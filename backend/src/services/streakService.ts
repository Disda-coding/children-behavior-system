import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { pointRecords, users, families } from '../db/schema';

/**
 * 游戏化服务：Streak 连续打卡 + 每日三环 + 等级体系
 *
 * 设计要点：
 * - 所有"日期"均为 Asia/Shanghai 时区的 YYYY-MM-DD 字符串（家庭成员都在国内，无需多时区）
 * - 冻结卡每月 1 日惰性重置（不依赖 cron，读写用户时判断跨月即可）
 * - EXP = 累计 earn 积分（直接查 point_records，不冗余存储）
 */

/** 上海时区的"今天"，格式 YYYY-MM-DD */
export function shanghaiToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

/** 上海时区当前月份，格式 YYYY-MM */
export function shanghaiThisMonth(): string {
  return shanghaiToday().slice(0, 7);
}

/** 上海时区的"昨天" */
export function shanghaiYesterday(): string {
  const now = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

// ---------- 等级体系 ----------

export interface LevelDef {
  name: string;
  min: number; // 该等级所需累计 EXP 下限
}

export const LEVELS: LevelDef[] = [
  { name: '萌芽', min: 0 },
  { name: '新叶', min: 200 },
  { name: '青枝', min: 500 },
  { name: '繁荫', min: 1000 },
  { name: '硕果', min: 2000 },
  { name: '骄阳', min: 5000 },
];

export function getLevelInfo(exp: number) {
  let index = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (exp >= LEVELS[i].min) {
      index = i;
      break;
    }
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const progress = next
    ? Math.min(1, (exp - current.min) / (next.min - current.min))
    : 1; // 已满级
  return {
    level: index + 1,
    name: current.name,
    exp,
    currentLevelExp: current.min,
    nextLevelExp: next?.min ?? null,
    progress,
  };
}

// ---------- Streak ----------

export interface StreakResult {
  streakCount: number;
  freezeUsed: boolean; // 本次是否消耗了冻结卡（用于前端提示）
  freezeCards: number; // 剩余冻结卡
}

/**
 * 孩子获得积分时更新 Streak。失败只打日志，不影响积分主流程。
 */
export async function updateStreakOnEarn(
  db: DrizzleD1Database<Record<string, never>>,
  userId: number
): Promise<StreakResult | null> {
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return null;

    const today = shanghaiToday();
    const thisMonth = shanghaiThisMonth();

    // 惰性月度重置冻结卡
    let freezeCards = user.streakFreezeCards ?? 2;
    if (user.streakFreezeResetMonth !== thisMonth) {
      freezeCards = 2;
    }

    // 今天已打卡过，不重复处理
    if (user.streakLastDate === today) {
      if (freezeCards !== user.streakFreezeCards) {
        await db
          .update(users)
          .set({ streakFreezeCards: freezeCards, streakFreezeResetMonth: thisMonth })
          .where(eq(users.id, userId));
      }
      return {
        streakCount: user.streakCount ?? 0,
        freezeUsed: false,
        freezeCards,
      };
    }

    let streak = user.streakCount ?? 0;
    let freezeUsed = false;

    if (user.streakLastDate === shanghaiYesterday()) {
      // 昨天有打卡 → 连续
      streak += 1;
    } else if (freezeCards > 0) {
      // 断签但可用冻结卡保签
      freezeCards -= 1;
      freezeUsed = true;
      streak += 1;
    } else {
      // 真断签，重新开始
      streak = 1;
    }

    await db
      .update(users)
      .set({
        streakCount: streak,
        streakLastDate: today,
        streakFreezeCards: freezeCards,
        streakFreezeResetMonth: thisMonth,
      })
      .where(eq(users.id, userId));

    return { streakCount: streak, freezeUsed, freezeCards };
  } catch (error) {
    console.error('Update streak error:', error);
    return null;
  }
}

// ---------- 每日三环 ----------

/** 三环目标（家庭级可配置前的默认值） */
export const RING_TARGET_POINTS = 20; // 积分环：今日得 20 分
export const RING_TARGET_COUNT = 3; // 习惯环：今日 3 次得分行为
export const RING_TARGET_STREAK = 7; // 坚持环：连续 7 天

export interface RingsData {
  points: { value: number; target: number };
  habits: { value: number; target: number };
  persist: { value: number; target: number };
  allComplete: boolean;
  streak: number;
  freezeCards: number;
  exp: number;
  level: ReturnType<typeof getLevelInfo>;
}

/**
 * 获取孩子每日三环数据。
 * 积分环：今日获得积分；习惯环：今日得分次数；坚持环：当前 Streak。
 */
export async function getRings(
  db: DrizzleD1Database<Record<string, never>>,
  userId: number
): Promise<RingsData | null> {
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return null;

  // 家庭级三环目标（家长可配置，缺省 20 分 / 3 次）
  let targetPoints = RING_TARGET_POINTS;
  let targetCount = RING_TARGET_COUNT;
  if (user.familyId) {
    const family = await db.select().from(families).where(eq(families.id, user.familyId)).get();
    targetPoints = family?.ringTargetPoints || RING_TARGET_POINTS;
    targetCount = family?.ringTargetCount || RING_TARGET_COUNT;
  }

  const today = shanghaiToday();

  // 今日 earn 记录聚合（created_at 存 UTC，+8h 后与上海"今天"比对）
  const todayStats = await db
    .select({
      total: sql<number>`COALESCE(SUM(${pointRecords.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(pointRecords)
    .where(
      and(
        eq(pointRecords.userId, userId),
        eq(pointRecords.type, 'earn'),
        sql`date(${pointRecords.createdAt}, '+8 hours') = ${today}`
      )
    )
    .get();

  // 累计 EXP
  const expRow = await db
    .select({ total: sql<number>`COALESCE(SUM(${pointRecords.amount}), 0)` })
    .from(pointRecords)
    .where(
      and(eq(pointRecords.userId, userId), eq(pointRecords.type, 'earn'))
    )
    .get();

  const exp = expRow?.total || 0;
  const todayPoints = todayStats?.total || 0;
  const todayCount = todayStats?.count || 0;
  const streak = user.streakCount ?? 0;
  const freezeCards = user.streakFreezeCards ?? 2;

  const points = { value: todayPoints, target: targetPoints };
  const habits = { value: todayCount, target: targetCount };
  const persist = { value: Math.min(streak, RING_TARGET_STREAK), target: RING_TARGET_STREAK };

  return {
    points,
    habits,
    persist,
    // 完美一天 = 积分环 + 习惯环当日双满（坚持环为长期激励，不参与当日判定）
    allComplete:
      points.value >= points.target &&
      habits.value >= habits.target,
    streak,
    freezeCards,
    exp,
    level: getLevelInfo(exp),
  };
}
