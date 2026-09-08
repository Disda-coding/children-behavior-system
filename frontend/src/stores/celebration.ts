import { defineStore } from 'pinia';
import { ref } from 'vue';
import { achievementApi, pointApi } from '@/api';
import { useAuthStore } from './auth';

export interface CelebrationItem {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  points?: number;
  /** 庆祝类型：成就解锁 / 等级提升 */
  kind?: 'achievement' | 'levelUp';
  /** 弹层主标题（默认"恭喜获得成就！"） */
  title?: string;
  /** 徽章档次（铜/银/金/铂），决定动画配色 */
  tier?: 'copper' | 'silver' | 'gold' | 'platinum';
}

/**
 * 全局成就庆祝：儿童端登录后每 10 秒轮询，
 * 检测到新解锁成就 / 等级提升时入队，由 AppShell 全屏动画逐个播放。
 */
export const useCelebrationStore = defineStore('celebration', () => {
  const queue = ref<CelebrationItem[]>([]);
  let seenIds = new Set<number>();
  let lastLevel = 0;
  let initialized = false;
  let timer: number | null = null;
  let storageKey = '';

  const loadSeen = (userId: number) => {
    storageKey = `celebration_seen_${userId}`;
    try {
      const raw = localStorage.getItem(storageKey);
      // 已有记录：恢复"看过的庆祝"；首次使用：null，交由 check() 做静默基线
      seenIds = raw ? new Set<number>(JSON.parse(raw)) : new Set();
      return raw !== null;
    } catch {
      seenIds = new Set();
      return false;
    }
  };

  const saveSeen = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...seenIds]));
    } catch {
      // 忽略存储失败（如隐私模式）
    }
  };

  const check = async () => {
    const auth = useAuthStore();
    const userId = auth.user?.id;
    if (!userId || auth.user?.role !== 'child') return;

    try {
      // 首次运行：恢复持久化的"已看过"记录
      if (!initialized) {
        const restored = loadSeen(userId);
        initialized = true;
        if (!restored) {
          // 第一次使用：静默基线 = 24 小时前完成的旧成就；
          // 近 24 小时内被授予的成就仍会补播动画（换浏览器/清缓存也能看到）
          const res0 = (await achievementApi.getUserAchievements(userId, true)) as any;
          const baselineBefore = Date.now() - 24 * 60 * 60 * 1000;
          seenIds = new Set(
            ((res0.userAchievements || []) as any[])
              .filter(
                (a: any) =>
                  a.isCompleted &&
                  !a.isRevoked &&
                  (!a.completedAt || new Date(a.completedAt).getTime() < baselineBefore),
              )
              .map((a: any) => a.id as number),
          );
          saveSeen();
        }
      }

      const res = (await achievementApi.getUserAchievements(userId, true)) as any;
      // 已完成且未撤销的成就；用 userAchievement 自身 id 判重（同一成就重复获得也能触发）
      const list = (res.userAchievements || []).filter(
        (a: any) => a.isCompleted && !a.isRevoked,
      );

      // 未看过的成就 → 入队播放（持久化，孩子离线期间被授予的也会在下次打开时补播一次）
      const fresh = list.filter((a: any) => !seenIds.has(a.id));
      if (fresh.length > 0) {
        queue.value.push(
          ...fresh.map((a: any) => ({
            id: a.id,
            name: a.achievement?.name || '新成就',
            description: a.achievement?.description,
            icon: a.achievement?.iconUrl,
            points: a.achievement?.rewardPoints || 0,
            tier: a.tier || undefined,
            kind: 'achievement' as const,
          })),
        );
        for (const a of fresh) seenIds.add(a.id);
        saveSeen();
      }

      // 等级提升检测（EXP = 累计获得积分，由 /rings 返回）
      const ringsRes = (await pointApi.getRings(userId)) as any;
      const level = ringsRes?.rings?.level;
      if (level) {
        if (lastLevel && level.level > lastLevel) {
          queue.value.push({
            id: 900000 + level.level,
            name: `升到 Lv.${level.level} · ${level.name}`,
            description: '继续加油，向更高的等级进发！',
            icon: '🌟',
            points: 0,
            tier: 'gold' as const,
            kind: 'levelUp',
            title: '等级提升！',
          });
        }
        lastLevel = level.level;
      }
    } catch {
      // 轮询失败静默忽略，下个周期重试
    }
  };

  const start = () => {
    if (timer !== null) return;
    check();
    timer = window.setInterval(check, 10000);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  /** 关闭当前动画，播放队列中下一个 */
  const dismiss = () => {
    queue.value.shift();
  };

  /** 手动播放一个庆祝项（如点击徽章墙重播），不写入已看记录 */
  const playNow = (item: CelebrationItem) => {
    queue.value.push(item);
  };

  return { queue, start, stop, dismiss, playNow, check };
});
