<template>
  <div class="space-y-5">
    <!-- 问候 + Streak + 等级 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="font-display text-2xl font-extrabold text-ink">
          你好，{{ authStore.user?.displayName }}！
        </h2>
        <p class="text-sm text-ink-2">继续努力，集齐今天的三环吧</p>
      </div>
      <StreakFlame :streak="rings?.streak ?? 0" :freeze-cards="rings?.freezeCards ?? 0" />
    </div>

    <!-- 三环 + 积分主卡 -->
    <div class="grid gap-5 lg:grid-cols-[auto_1fr]">
      <div class="card flex items-center justify-center p-6">
        <ProgressRings
          v-if="rings"
          :points="rings.points"
          :habits="rings.habits"
          :persist="rings.persist"
          :all-complete="rings.allComplete"
          :size="216"
        />
        <div v-else class="h-[216px] w-[216px] animate-pulse rounded-full bg-ink/5"></div>
      </div>

      <div class="flex flex-col gap-5">
        <!-- 积分大数字 -->
        <div class="points-card p-6">
          <p class="text-sm text-white/75">我的积分</p>
          <div class="mt-1 flex items-baseline gap-2">
            <FlipNumber :value="points" class="font-display text-5xl font-extrabold" />
            <span class="text-lg text-white/75">分</span>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-white/10 px-4 py-2.5">
              <p class="text-xs text-white/70">今日获得</p>
              <p class="font-display text-xl font-bold">+{{ todayPoints }}</p>
            </div>
            <div class="rounded-xl bg-white/10 px-4 py-2.5">
              <p class="text-xs text-white/70">本周获得</p>
              <p class="font-display text-xl font-bold">+{{ weekPoints }}</p>
            </div>
          </div>
        </div>

        <!-- 等级 -->
        <div v-if="rings" class="card p-4">
          <LevelBadge :level="rings.level" />
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div>
      <h3 class="mb-3 text-sm font-semibold text-ink-2">快捷入口</h3>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-5">
        <RouterLink
          v-for="entry in quickEntries"
          :key="entry.to"
          :to="entry.to"
          class="card card-hover group flex flex-col items-center gap-3 p-5"
        >
          <span
            class="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
            :style="{ background: entry.bg, color: entry.color }"
          >
            <component :is="entry.icon" class="h-6 w-6" />
          </span>
          <span class="text-sm font-medium text-ink">{{ entry.label }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- 最近动态 -->
    <div>
      <h3 class="mb-3 text-sm font-semibold text-ink-2">最近动态</h3>
      <div class="card overflow-hidden">
        <div v-if="recentRecords.length === 0" class="py-12 text-center text-ink-2">
          暂无记录，快去赚积分吧！
        </div>
        <div v-else class="divide-y divide-line">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-ink/[0.02]"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-full"
                :class="record.type === 'earn' ? 'bg-sprout/15' : 'bg-coral/10'"
              >
                <CirclePlus v-if="record.type === 'earn'" class="h-5 w-5 text-sprout" />
                <CircleMinus v-else class="h-5 w-5 text-coral" />
              </span>
              <div>
                <p class="text-sm font-medium text-ink">{{ record.reason }}</p>
                <p class="text-xs text-ink-2">{{ formatDate(record.createdAt) }}</p>
              </div>
            </div>
            <span
              class="font-display text-base font-bold"
              :class="record.type === 'earn' ? 'text-sprout' : 'text-coral'"
            >
              {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  CircleMinus,
  CirclePlus,
  FileClock,
  Gift,
  ScrollText,
  Trophy,
  UsersRound,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { pointApi } from '@/api';
import FlipNumber from '@/components/common/FlipNumber.vue';
import ProgressRings from '@/components/child/ProgressRings.vue';
import StreakFlame from '@/components/child/StreakFlame.vue';
import LevelBadge from '@/components/child/LevelBadge.vue';

interface RingsData {
  points: { value: number; target: number };
  habits: { value: number; target: number };
  persist: { value: number; target: number };
  allComplete: boolean;
  streak: number;
  freezeCards: number;
  exp: number;
  level: {
    level: number;
    name: string;
    exp: number;
    nextLevelExp: number | null;
    progress: number;
  };
}

const authStore = useAuthStore();

const points = ref(0);
const todayPoints = ref(0);
const weekPoints = ref(0);
const recentRecords = ref<any[]>([]);
const rings = ref<RingsData | null>(null);

const quickEntries = [
  { to: '/child/achievements', label: '我的成就', icon: Trophy, bg: 'rgba(255,176,32,0.15)', color: '#ffb020' },
  { to: '/child/rewards', label: '兑换奖励', icon: Gift, bg: 'rgba(255,90,95,0.12)', color: '#ff5a5f' },
  { to: '/child/meetings', label: '家庭会议', icon: UsersRound, bg: 'rgba(34,195,230,0.12)', color: '#22c3e6' },
  { to: '/child/appeals', label: '申诉中心', icon: ScrollText, bg: 'rgba(124,217,63,0.15)', color: '#5cb52b' },
  { to: '/child/records', label: '积分记录', icon: FileClock, bg: 'rgba(28,28,30,0.05)', color: '#6e6e73' },
];

const fetchPoints = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const statsRes = (await pointApi.getStats({ userId })) as any;
    const stats = statsRes.stats || {};
    points.value = stats.totalBalance || 0;
    todayPoints.value = stats.todayEarned || 0;
    weekPoints.value = stats.weekEarned || 0;

    const recordsRes = (await pointApi.getRecords({ userId })) as any;
    recentRecords.value = (recordsRes.records || []).slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch points:', error);
  }
};

const fetchRings = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;
    const res = (await pointApi.getRings(userId)) as any;
    if (res.rings) rings.value = res.rings;
  } catch (error) {
    console.error('Failed to fetch rings:', error);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

let pollInterval: number | null = null;

const startPolling = () => {
  pollInterval = window.setInterval(() => {
    fetchPoints();
    fetchRings();
  }, 10000);
};

onMounted(() => {
  fetchPoints();
  fetchRings();
  startPolling();
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
});
</script>

<style scoped>
.points-card {
  border-radius: 1.5rem;
  background: linear-gradient(135deg, var(--color-coral) 0%, #ff7a45 100%);
  color: #fff;
  box-shadow: 0 12px 28px -10px rgb(255 90 95 / 45%);
}
</style>
