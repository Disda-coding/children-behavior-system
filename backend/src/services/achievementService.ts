import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { achievements, userAchievements, pointRecords, users } from '../db/schema';
import { notifyAchievementUnlocked, notifyPointsEarned } from '../utils/notification';

type Db = ReturnType<typeof drizzle>;

interface UnlockedAchievement {
  achievementId: number;
  name: string;
  rewardPoints: number;
}

/**
 * 查询用户的三项实时指标（供成就列表接口计算实时进度）。
 */
export async function getUserMetrics(db: Db, userId: number) {
  const [user, earnRecords] = await Promise.all([
    db.select({ streakCount: users.streakCount }).from(users).where(eq(users.id, userId)).get(),
    db
      .select({
        amount: pointRecords.amount,
        createdAt: pointRecords.createdAt,
      })
      .from(pointRecords)
      .where(and(eq(pointRecords.userId, userId), eq(pointRecords.type, 'earn')))
      .orderBy(desc(pointRecords.createdAt), desc(pointRecords.id)),
  ]);

  return {
    earnCount: earnRecords.length,
    earnSum: earnRecords.reduce((sum, r) => sum + r.amount, 0),
    consecutiveDays: calcConsecutiveDays(earnRecords.map((r) => r.createdAt)),
    streakCount: user?.streakCount || 0,
  };
}

/** 按条件类型取实时进度值 */
export function progressByCondition(
  conditionType: string | null | undefined,
  metrics: { earnCount: number; earnSum: number; consecutiveDays: number; streakCount: number }
): number {
  if (conditionType === 'count') return metrics.earnCount;
  if (conditionType === 'accumulate') return metrics.earnSum;
  if (conditionType === 'consecutive') return metrics.consecutiveDays;
  if (conditionType === 'streak') return metrics.streakCount;
  return 0;
}

/** 徽章档次：按奖励积分自动分档（TODO 决策） */
export function badgeTier(rewardPoints: number | null | undefined): 'copper' | 'silver' | 'gold' | 'platinum' {
  const p = rewardPoints || 0;
  if (p >= 500) return 'platinum';
  if (p >= 200) return 'gold';
  if (p >= 50) return 'silver';
  return 'copper';
}


/**
 * 评估指定用户的成就进度。
 * 在每次产生 earn 类型积分记录后调用：
 *  - count      累计得分次数（earn 记录数）
 *  - accumulate 累计获得积分（earn 金额求和）
 *  - consecutive 连续得分天数（每天至少 1 条 earn 记录）
 * 达成条件时自动完成成就、发放积分奖励并推送通知。
 *
 * @returns 本次新解锁的成就列表
 */
export async function evaluateAchievements(
  db: Db,
  rawDb: D1Database,
  userId: number,
  familyId: number,
): Promise<UnlockedAchievement[]> {
  const unlocked: UnlockedAchievement[] = [];

  // 1. 取出家庭内启用的非模板成就
  const familyAchievements = await db
    .select()
    .from(achievements)
    .where(and(
      eq(achievements.familyId, familyId),
      eq(achievements.isActive, true),
      eq(achievements.isTemplate, false),
    ));

  if (familyAchievements.length === 0) return unlocked;

  // 2. 取出用户全部 earn 记录（一次查询，内存中计算三种进度）
  const earnRecords = await db
    .select({
      amount: pointRecords.amount,
      createdAt: pointRecords.createdAt,
    })
    .from(pointRecords)
    .where(and(eq(pointRecords.userId, userId), eq(pointRecords.type, 'earn')))
    .orderBy(desc(pointRecords.createdAt), desc(pointRecords.id));

  const earnCount = earnRecords.length;
  const earnSum = earnRecords.reduce((sum, r) => sum + r.amount, 0);
  const consecutiveDays = calcConsecutiveDays(earnRecords.map((r) => r.createdAt));

  // 3. 用户已有成就记录
  const existing = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const existingMap = new Map(existing.map((ua) => [ua.achievementId, ua]));

  // 4. 逐个成就评估
  for (const achievement of familyAchievements) {
    const ua = existingMap.get(achievement.id);

    // 已完成（未撤销）的跳过
    if (ua?.isCompleted && !ua.isRevoked) continue;

    const progress =
      achievement.conditionType === 'count'
        ? earnCount
        : achievement.conditionType === 'accumulate'
          ? earnSum
          : achievement.conditionType === 'streak'
            ? await getCurrentStreak(db, userId)
            : consecutiveDays;

    const completed = progress >= achievement.conditionValue;
    const now = new Date().toISOString();

    if (!ua) {
      // 尚无记录：有进度或达成时才插入
      if (progress <= 0) continue;
      const inserted = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId: achievement.id,
          progress: Math.min(progress, achievement.conditionValue),
          isCompleted: completed,
          completedAt: completed ? now : null,
        })
        .returning();
      if (completed) {
        await awardAchievement(db, rawDb, userId, achievement, inserted[0].id);
        unlocked.push({
          achievementId: achievement.id,
          name: achievement.name,
          rewardPoints: achievement.rewardPoints || 0,
        });
      }
    } else {
      // 已有记录：更新进度；未达成且本次达成则完成
      const newCompleted = completed && !ua.isCompleted;
      await db
        .update(userAchievements)
        .set({
          progress: Math.min(progress, achievement.conditionValue),
          ...(newCompleted ? { isCompleted: true, completedAt: now } : {}),
        })
        .where(eq(userAchievements.id, ua.id));
      if (newCompleted) {
        await awardAchievement(db, rawDb, userId, achievement, ua.id);
        unlocked.push({
          achievementId: achievement.id,
          name: achievement.name,
          rewardPoints: achievement.rewardPoints || 0,
        });
      }
    }
  }

  return unlocked;
}

/** 发放成就积分奖励 + 通知 */
async function awardAchievement(
  db: Db,
  rawDb: D1Database,
  userId: number,
  achievement: {
    id: number;
    name: string;
    rewardPoints: number | null;
  },
  userAchievementId: number,
) {
  await notifyAchievementUnlocked(
    rawDb,
    userId,
    achievement.name,
    userAchievementId,
    achievement.rewardPoints || 0,
  );

  const rewardPoints = achievement.rewardPoints || 0;
  if (rewardPoints <= 0) return;

  const latest = await db
    .select({ balanceAfter: pointRecords.balanceAfter })
    .from(pointRecords)
    .where(eq(pointRecords.userId, userId))
    .orderBy(desc(pointRecords.createdAt), desc(pointRecords.id))
    .limit(1)
    .get();

  const newBalance = (latest?.balanceAfter || 0) + rewardPoints;

  const record = await db
    .insert(pointRecords)
    .values({
      userId,
      type: 'earn',
      amount: rewardPoints,
      balanceAfter: newBalance,
      reason: `获得成就奖励: ${achievement.name}`,
      createdBy: userId,
    })
    .returning();

  await notifyPointsEarned(
    rawDb,
    userId,
    rewardPoints,
    `获得成就奖励: ${achievement.name}`,
    record[0].id,
  );
}

/**
 * 计算连续得分天数。
 * 只要"今天或昨天"在链上即视为仍在连续（对当天尚未得分的情况宽容）。
 */
/** 查询用户当前 Streak（streak 条件类型专用） */
async function getCurrentStreak(db: Db, userId: number): Promise<number> {
  const user = await db.select({ streakCount: users.streakCount }).from(users).where(eq(users.id, userId)).get();
  return user?.streakCount || 0;
}

function calcConsecutiveDays(createdAts: (string | null)[]): number {
  const days = new Set<string>();
  for (const ts of createdAts) {
    if (!ts) continue;
    const day = (ts.includes('T') ? ts : ts.replace(' ', 'T')).slice(0, 10);
    days.add(day);
  }
  if (days.size === 0) return 0;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);

  // 连续链必须包含今天或昨天，否则已断签
  if (!days.has(today) && !days.has(yesterday)) return 0;

  let count = 0;
  const cur = new Date(now);
  // 如果今天还没有得分，从昨天开始数
  if (!days.has(today)) cur.setUTCDate(cur.getUTCDate() - 1);

  while (days.has(cur.toISOString().slice(0, 10))) {
    count += 1;
    cur.setUTCDate(cur.getUTCDate() - 1);
  }
  return count;
}
