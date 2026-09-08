<template>
  <div class="space-y-5">
    <!-- 顶部：余额 + Tab -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="card flex items-center gap-3 px-5 py-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-honey/15">
          <Coins class="h-5 w-5 text-honey" />
        </span>
        <div>
          <p class="font-display text-xl font-extrabold leading-none text-ink">{{ userPoints }}</p>
          <p class="text-xs text-ink-2">可用积分</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.key ? 'bg-coral text-white shadow-md shadow-coral/30' : 'bg-card text-ink-2 hover:text-ink'
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 商城 -->
    <template v-if="activeTab === 'mall'">
      <!-- 分类 -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="type in rewardTypes"
          :key="type.key"
          :class="[
            'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
            selectedType === type.key ? 'bg-ink text-white' : 'bg-card text-ink-2 hover:text-ink'
          ]"
          @click="selectedType = type.key"
        >
          <component :is="type.icon" class="h-3.5 w-3.5" />
          {{ type.label }}
        </button>
      </div>

      <div v-if="filteredRewards.length === 0" class="card py-14 text-center">
        <Gift class="mx-auto mb-3 h-10 w-10 text-ink-2/40" />
        <p class="text-sm text-ink-2">这个分类还没有奖励，去问问家长吧！</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="reward in filteredRewards"
          :key="reward.id"
          :class="['card flex flex-col p-5', !canAfford(reward) && 'opacity-55']"
        >
          <div class="mb-3 flex items-start justify-between">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-2xl"
              :style="{ background: typeStyle(reward.type).bg, color: typeStyle(reward.type).color }"
            >
              <component :is="typeStyle(reward.type).icon" class="h-6 w-6" />
            </span>
            <span
              v-if="reward.stock !== null && reward.stock !== undefined"
              :class="[
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                reward.stock > 0 ? 'bg-sprout/15 text-sprout' : 'bg-danger/10 text-danger'
              ]"
            >
              {{ reward.stock > 0 ? `剩 ${reward.stock} 份` : '已兑完' }}
            </span>
          </div>

          <h3 class="font-semibold text-ink">{{ reward.name }}</h3>
          <p class="mb-4 mt-0.5 line-clamp-2 min-h-[2.4em] text-xs text-ink-2">{{ reward.description }}</p>

          <div class="mt-auto flex items-center justify-between">
            <div class="flex items-baseline gap-1">
              <span
                class="font-display text-2xl font-extrabold"
                :class="canAfford(reward) ? 'text-honey' : 'text-ink-2'"
              >
                {{ reward.pointsCost }}
              </span>
              <span class="text-xs text-ink-2">积分</span>
            </div>
            <button
              :disabled="!canAfford(reward) || reward.stock === 0"
              :class="[
                'rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all',
                canAfford(reward) && reward.stock !== 0
                  ? 'bg-coral shadow-md shadow-coral/30 hover:brightness-105 active:scale-95'
                  : 'cursor-not-allowed bg-ink/10 text-ink-2'
              ]"
              @click="openRedeemModal(reward)"
            >
              {{ reward.stock === 0 ? '已兑完' : canAfford(reward) ? '兑换' : `还差 ${reward.pointsCost - userPoints} 分` }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 我的兑换 -->
    <template v-else>
      <div v-if="redemptions.length === 0" class="card py-14 text-center">
        <PackageOpen class="mx-auto mb-3 h-10 w-10 text-ink-2/40" />
        <p class="text-sm text-ink-2">还没有兑换记录，攒够积分来换奖励吧！</p>
      </div>
      <div v-else class="card divide-y divide-line overflow-hidden">
        <div
          v-for="redemption in redemptions"
          :key="redemption.id"
          class="flex items-center justify-between px-5 py-4"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-full"
              :style="{ background: typeStyle(redemption.reward?.type).bg, color: typeStyle(redemption.reward?.type).color }"
            >
              <component :is="typeStyle(redemption.reward?.type).icon" class="h-5 w-5" />
            </span>
            <div>
              <p class="text-sm font-medium text-ink">{{ redemption.reward?.name }}</p>
              <p class="text-xs text-ink-2">{{ formatDate(redemption.createdAt) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-display text-base font-bold text-coral">-{{ redemption.pointsSpent }}</span>
            <span :class="['rounded-full px-2.5 py-0.5 text-[11px] font-medium', statusClass(redemption.status)]">
              {{ statusText(redemption.status) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- 兑换确认弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showRedeemModal && selectedReward"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm"
          @click.self="showRedeemModal = false"
        >
          <div class="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl">
            <h3 class="text-lg font-bold text-ink">确认兑换</h3>
            <p class="mt-1 text-sm text-ink-2">
              确定用 <span class="font-semibold text-honey">{{ selectedReward.pointsCost }} 积分</span>
              兑换「{{ selectedReward.name }}」吗？
            </p>

            <div class="mt-4 space-y-2 rounded-2xl bg-base p-4 text-sm">
              <div class="flex justify-between text-ink-2">
                <span>当前积分</span>
                <span class="font-semibold text-ink">{{ userPoints }}</span>
              </div>
              <div class="flex justify-between text-ink-2">
                <span>兑换消耗</span>
                <span class="font-semibold text-coral">-{{ selectedReward.pointsCost }}</span>
              </div>
              <div class="flex justify-between border-t border-line pt-2">
                <span class="text-ink">兑换后剩余</span>
                <span class="font-display font-bold text-sprout">{{ userPoints - selectedReward.pointsCost }}</span>
              </div>
            </div>

            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl bg-ink/5 py-2.5 text-sm font-medium text-ink-2 hover:bg-ink/10" @click="showRedeemModal = false">
                再想想
              </button>
              <button class="btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold" :disabled="redeeming" @click="confirmRedeem">
                {{ redeeming ? '提交中…' : '确认兑换' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  Coins,
  Gamepad2,
  Gift,
  PackageOpen,
  Palette,
  CircleDollarSign,
  Ticket,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { rewardApi, pointApi } from '@/api';

const authStore = useAuthStore();

const tabs = [
  { key: 'mall', label: '奖励商城' },
  { key: 'mine', label: '我的兑换' },
];
const activeTab = ref('mall');

const rewardTypes = [
  { key: 'all', label: '全部', icon: Gift },
  { key: 'virtual', label: '虚拟奖励', icon: Gamepad2 },
  { key: 'physical', label: '实物奖励', icon: PackageOpen },
  { key: 'activity', label: '活动奖励', icon: Ticket },
  { key: 'cash', label: '零花钱', icon: CircleDollarSign },
];

const selectedType = ref('all');
const rewards = ref<any[]>([]);
const redemptions = ref<any[]>([]);
const userPoints = ref(0);
const showRedeemModal = ref(false);
const selectedReward = ref<any>(null);
const redeeming = ref(false);

const filteredRewards = computed(() => {
  if (selectedType.value === 'all') return rewards.value;
  return rewards.value.filter((r) => r.type === selectedType.value);
});

const typeStyle = (type?: string) => {
  const styles: Record<string, { bg: string; color: string; icon: any }> = {
    physical: { bg: 'rgba(34,195,230,0.12)', color: '#22c3e6', icon: PackageOpen },
    virtual: { bg: 'rgba(255,90,95,0.12)', color: '#ff5a5f', icon: Gamepad2 },
    activity: { bg: 'rgba(124,217,63,0.15)', color: '#5cb52b', icon: Ticket },
    cash: { bg: 'rgba(255,176,32,0.15)', color: '#ffb020', icon: CircleDollarSign },
  };
  return styles[type || ''] || { bg: 'rgba(28,28,30,0.05)', color: '#6e6e73', icon: Gift };
};

const fetchRewards = async () => {
  try {
    const response = (await rewardApi.getRewards({ familyId: authStore.user?.familyId })) as any;
    rewards.value = response.rewards || [];
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
  }
};

const fetchRedemptions = async () => {
  try {
    const response = (await rewardApi.getRedemptions({ userId: authStore.user?.id })) as any;
    redemptions.value = response.redemptions || [];
  } catch (error) {
    console.error('Failed to fetch redemptions:', error);
  }
};

const fetchUserPoints = async () => {
  try {
    const response = (await pointApi.getStats({ userId: authStore.user?.id || 0 })) as any;
    userPoints.value = response.stats?.totalBalance || 0;
  } catch (error) {
    console.error('Failed to fetch user points:', error);
  }
};

const canAfford = (reward: any) => userPoints.value >= (reward.pointsCost || 0);

const openRedeemModal = (reward: any) => {
  if (!canAfford(reward) || reward.stock === 0) return;
  selectedReward.value = reward;
  showRedeemModal.value = true;
};

const confirmRedeem = async () => {
  if (!selectedReward.value || redeeming.value) return;
  redeeming.value = true;

  try {
    await rewardApi.redeemReward(selectedReward.value.id, {
      userId: authStore.user?.id || 0,
    });
    showRedeemModal.value = false;
    selectedReward.value = null;
    await Promise.all([fetchUserPoints(), fetchRedemptions(), fetchRewards()]);
  } catch (error: any) {
    console.error('Failed to redeem reward:', error);
    alert(error.response?.data?.error || '兑换失败，请稍后再试');
  } finally {
    redeeming.value = false;
  }
};

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-honey/15 text-honey',
    approved: 'bg-sky/15 text-sky',
    completed: 'bg-sprout/15 text-sprout',
    rejected: 'bg-danger/10 text-danger',
  };
  return classes[status] || 'bg-ink/5 text-ink-2';
};

const statusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    completed: '已完成',
    rejected: '已拒绝',
  };
  return texts[status] || status;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchRewards();
  fetchRedemptions();
  fetchUserPoints();
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
