<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/child/dashboard" class="text-gray-600 hover:text-gray-800 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">兑换奖励</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 我的积分 -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-8">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-primary-100 text-sm">我的积分</p>
            <p class="text-4xl font-bold mt-2">{{ userPoints }}</p>
          </div>
          <div class="bg-white/20 p-4 rounded-full">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 分类标签 -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="category in categories"
          :key="category.value"
          @click="activeCategory = category.value"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            activeCategory === category.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ category.label }}
        </button>
      </div>

      <!-- 奖励列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RewardCard
          v-for="reward in filteredRewards"
          :key="reward.id"
          :name="reward.name"
          :description="reward.description || ''"
          :type="reward.type"
          :points-cost="getRewardCost(reward)"
          :user-points="userPoints"
          :stock="reward.stock"
          :tiered-pricing="reward.config?.tieredPricing"
          @redeem="handleRedeem(reward)"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="filteredRewards.length === 0" class="text-center py-12">
        <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-800">暂无奖励</h3>
        <p class="text-gray-500">该分类下暂时没有可兑换的奖励</p>
      </div>
    </main>

    <!-- 兑换确认弹窗 -->
    <div v-if="showRedeemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
        <h3 class="text-xl font-bold text-gray-800 mb-4">确认兑换</h3>
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <p class="font-medium text-gray-800">{{ selectedReward?.name }}</p>
          <p class="text-gray-500 text-sm mt-1">{{ selectedReward?.description }}</p>
          <div class="flex items-center gap-2 mt-3">
            <span class="text-warning-600 font-bold text-xl">{{ getRewardCost(selectedReward!) }}</span>
            <span class="text-gray-500">积分</span>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="showRedeemModal = false"
            class="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmRedeem"
            class="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            确认兑换
          </button>
        </div>
      </div>
    </div>

    <!-- 兑换成功弹窗 -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
        <div class="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">兑换成功！</h3>
        <p class="text-gray-600 mb-4">你已成功兑换：{{ selectedReward?.name }}</p>
        <p class="text-gray-500 text-sm">请等待家长审核</p>
        <button
          @click="showSuccessModal = false"
          class="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { rewardApi, pointApi } from '@/api';
import RewardCard from '@/components/common/RewardCard.vue';

const authStore = useAuthStore();

const userPoints = ref(0);
const rewards = ref<any[]>([]);
const activeCategory = ref('all');
const showRedeemModal = ref(false);
const showSuccessModal = ref(false);
const selectedReward = ref<any>(null);

const categories = [
  { label: '全部', value: 'all' },
  { label: '实物奖励', value: 'physical' },
  { label: '虚拟奖励', value: 'virtual' },
  { label: '活动奖励', value: 'activity' },
  { label: '现金奖励', value: 'cash' },
];

// 过滤奖励
const filteredRewards = computed(() => {
  if (activeCategory.value === 'all') {
    return rewards.value;
  }
  return rewards.value.filter(reward => reward.type === activeCategory.value);
});

// 获取奖励成本（支持阶梯价格）
const getRewardCost = (reward: any) => {
  if (reward.config?.tieredPricing) {
    // 如果有阶梯价格，返回基础价格
    const tiers = Object.entries(reward.config.tieredPricing);
    if (tiers.length > 0) {
      return tiers[0][1] as number;
    }
  }
  return reward.pointsCost;
};

const fetchUserPoints = async () => {
  try {
    if (authStore.user?.id) {
      const response = await pointApi.getStats({ userId: authStore.user.id }) as { stats: { totalBalance: number } };
      userPoints.value = response.stats.totalBalance;
    }
  } catch (error) {
    console.error('Failed to fetch user points:', error);
  }
};

const fetchRewards = async () => {
  try {
    const response = await rewardApi.getRewards() as { rewards: any[] };
    rewards.value = response.rewards;
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
  }
};

const handleRedeem = (reward: any) => {
  selectedReward.value = reward;
  showRedeemModal.value = true;
};

const confirmRedeem = async () => {
  try {
    if (authStore.user?.id && selectedReward.value) {
      await rewardApi.redeemReward(selectedReward.value.id, {
        userId: authStore.user.id,
      });
      showRedeemModal.value = false;
      showSuccessModal.value = true;
      // 刷新积分
      await fetchUserPoints();
    }
  } catch (error) {
    console.error('Failed to redeem reward:', error);
    alert('兑换失败，请重试');
  }
};

onMounted(() => {
  fetchUserPoints();
  fetchRewards();
});
</script>
