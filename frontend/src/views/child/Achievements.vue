<template>
  <div class="space-y-5">
    <!-- 顶部统计卡 -->
    <div class="card flex items-center justify-around p-5">
      <div class="text-center">
        <p class="font-display text-2xl font-extrabold text-honey">{{ completedCount }}</p>
        <p class="text-xs text-ink-2">已解锁</p>
      </div>
      <div class="h-8 w-px bg-line"></div>
      <div class="text-center">
        <p class="font-display text-2xl font-extrabold text-sky">{{ inProgressCount }}</p>
        <p class="text-xs text-ink-2">进行中</p>
      </div>
      <div class="h-8 w-px bg-line"></div>
      <div class="text-center">
        <p class="font-display text-2xl font-extrabold text-sprout">+{{ totalRewardPoints }}</p>
        <p class="text-xs text-ink-2">成就积分</p>
      </div>
    </div>

    <!-- 徽章墙 -->
    <div v-if="userAchievements.length > 0" class="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
      <button
        v-for="item in userAchievements"
        :key="item.id"
        class="card card-hover relative flex flex-col items-center gap-1.5 p-4 text-center"
        @click="selected = item"
      >
        <!-- NEW 标记 -->
        <span
          v-if="newlyCompletedIds.has(item.id)"
          class="absolute right-2 top-2 rounded-full bg-honey px-1.5 py-0.5 text-[10px] font-bold text-white"
        >
          NEW
        </span>
        <!-- 撤销标记 -->
        <span
          v-if="item.isRevoked"
          class="absolute right-2 top-2 rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white"
        >
          已撤销
        </span>

        <BadgeIcon :tier="item.tier" :locked="!item.isCompleted || item.isRevoked" :size="72" />
        <p class="line-clamp-1 w-full text-xs font-semibold text-ink">
          {{ item.achievement?.name }}
        </p>

        <!-- 进度 -->
        <div v-if="!item.isCompleted && !item.isRevoked" class="w-full">
          <div class="h-1.5 overflow-hidden rounded-full bg-ink/5">
            <div
              class="h-full rounded-full bg-sky transition-[width] duration-500"
              :style="{ width: `${progressPercent(item)}%` }"
            ></div>
          </div>
          <p class="mt-0.5 text-[10px] text-ink-2">
            {{ item.progress }} / {{ item.achievement?.conditionValue }}
          </p>
        </div>
        <p v-else-if="item.isCompleted && !item.isRevoked" class="text-[10px] text-honey">
          +{{ item.achievement?.rewardPoints }} 分
        </p>
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else class="card flex flex-col items-center gap-3 py-14">
      <Trophy class="h-10 w-10 text-ink-2/40" />
      <p class="text-sm text-ink-2">还没有徽章，完成好习惯来点亮第一个吧！</p>
    </div>

    <!-- 详情弹层 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selected"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm"
          @click.self="selected = null"
        >
          <div class="w-full max-w-xs rounded-3xl bg-card p-7 text-center shadow-2xl">
            <BadgeIcon
              :tier="selected.tier"
              :locked="!selected.isCompleted || selected.isRevoked"
              :size="110"
              class="mx-auto"
            />
            <h3 class="mt-4 text-lg font-bold text-ink">{{ selected.achievement?.name }}</h3>
            <p class="mt-1 text-sm text-ink-2">{{ selected.achievement?.description }}</p>

            <div class="mt-4 space-y-1.5 rounded-2xl bg-base p-3.5 text-left text-xs text-ink-2">
              <p>
                条件：
                <span class="font-medium text-ink">{{ conditionText(selected) }}</span>
              </p>
              <p v-if="!selected.isCompleted && !selected.isRevoked">
                当前进度：
                <span class="font-medium text-ink">{{ selected.progress }} / {{ selected.achievement?.conditionValue }}</span>
              </p>
              <p v-if="selected.achievement?.rewardPoints">
                奖励：
                <span class="font-medium text-honey">+{{ selected.achievement.rewardPoints }} 积分</span>
              </p>
              <p v-if="selected.isCompleted && !selected.isRevoked">
                解锁于：
                <span class="font-medium text-ink">{{ formatDate(selected.completedAt) }}</span>
              </p>
              <p v-if="selected.isRevoked && selected.revokeReason" class="text-danger">
                已撤销：{{ selected.revokeReason }}
              </p>
            </div>

            <button class="btn-primary mt-5 w-full py-2.5" @click="selected = null">好的</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Trophy } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { achievementApi } from '@/api';
import BadgeIcon from '@/components/child/BadgeIcon.vue';

const authStore = useAuthStore();

const userAchievements = ref<any[]>([]);
const previousCompletedIds = ref<Set<number>>(new Set());
const newlyCompletedIds = ref<Set<number>>(new Set());
const selected = ref<any>(null);
const isFirstLoad = ref(true);

let pollInterval: ReturnType<typeof setInterval> | null = null;

const completedCount = computed(
  () => userAchievements.value.filter((a) => a.isCompleted && !a.isRevoked).length
);
const inProgressCount = computed(
  () => userAchievements.value.filter((a) => !a.isCompleted && !a.isRevoked).length
);
const totalRewardPoints = computed(() =>
  userAchievements.value
    .filter((a) => a.isCompleted && !a.isRevoked)
    .reduce((sum, a) => sum + (a.achievement?.rewardPoints || 0), 0)
);

const progressPercent = (item: any) => {
  const target = item.achievement?.conditionValue || 1;
  return Math.min(100, Math.round(((item.progress || 0) / target) * 100));
};

const conditionText = (item: any) => {
  const type = item.achievement?.conditionType;
  const v = item.achievement?.conditionValue;
  const unit = item.achievement?.conditionUnit || '';
  if (type === 'count') return `累计获得积分 ${v} 次`;
  if (type === 'accumulate') return `累计获得 ${v} ${unit || '分'}`;
  if (type === 'consecutive') return `连续 ${v} 天获得积分`;
  if (type === 'streak') return `连续打卡保持 ${v} 天`;
  return `达到 ${v}`;
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const fetchUserAchievements = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const response = (await achievementApi.getUserAchievements(userId, true)) as any;
    const list = response.userAchievements || [];

    if (isFirstLoad.value) {
      previousCompletedIds.value = new Set(
        list.filter((a: any) => a.isCompleted).map((a: any) => a.id)
      );
      isFirstLoad.value = false;
    } else {
      // 新解锁徽章标记 NEW（全屏动画由全局 celebration store 负责）
      const current = new Set<number>(list.filter((a: any) => a.isCompleted).map((a: any) => a.id as number));
      for (const id of current) {
        if (!previousCompletedIds.value.has(id)) newlyCompletedIds.value.add(id);
      }
      previousCompletedIds.value = current;
    }

    userAchievements.value = list;
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  }
};

onMounted(() => {
  fetchUserAchievements();
  pollInterval = setInterval(fetchUserAchievements, 10000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
