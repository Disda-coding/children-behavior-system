<template>
  <div class="app-shell min-h-screen bg-gray-50">
    <nav class="app-nav bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/child/dashboard" class="text-gray-600 hover:text-gray-800 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">兑换奖励</h1>
          <div class="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <span class="text-blue-600 font-bold">{{ userPoints }}</span>
            <span class="text-sm text-blue-500">积分</span>
          </div>
        </div>
      </div>
    </nav>

    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 奖励分类标签 -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="type in rewardTypes"
          :key="type.key"
          @click="selectedType = type.key"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedType === type.key
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- 奖励列表 -->
      <div v-if="filteredRewards.length === 0" class="text-center py-12 bg-white rounded-xl">
        <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-800">暂无奖励</h3>
        <p class="text-gray-500">请稍后再来看看</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="reward in filteredRewards"
          :key="reward.id"
          class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          :class="{ 'opacity-60': !canAfford(reward) }"
        >
          <div class="flex items-start justify-between mb-4">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              :class="getTypeClass(reward.type)"
            >
              {{ reward.iconUrl || getTypeIcon(reward.type) }}
            </div>
            <span
              v-if="reward.stock !== null && reward.stock !== undefined"
              class="text-xs px-2 py-1 rounded-full"
              :class="reward.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              剩余 {{ reward.stock }}
            </span>
          </div>

          <h3 class="font-bold text-lg text-gray-800 mb-2">{{ reward.name }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ reward.description }}</p>

          <!-- 阶梯价格显示 -->
          <div v-if="hasTieredPricing(reward)" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500 mb-2">阶梯价格（连续兑换递增）：</p>
            <div class="space-y-1">
              <div
                v-for="(cost, hours) in getTieredPricing(reward)"
                :key="hours"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-600">{{ hours }} 小时</span>
                <span class="font-bold" :class="getTierPriceClass(hours, reward)">{{ cost }} 积分</span>
              </div>
            </div>
            <p v-if="todayRedeemedHours > 0" class="text-xs text-orange-500 mt-2">
              今日已兑换 {{ todayRedeemedHours }} 小时，下次兑换价格已调整
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold" :class="canAfford(reward) ? 'text-amber-500' : 'text-gray-400'">
                {{ calculateCost(reward) }}
              </span>
              <span class="text-sm text-gray-500">积分</span>
            </div>
            <button
              @click="openRedeemModal(reward)"
              :disabled="!canAfford(reward) || reward.stock === 0"
              class="px-6 py-2 rounded-lg font-medium transition-colors"
              :class="canAfford(reward) && reward.stock !== 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            >
              {{ reward.stock === 0 ? '已兑完' : canAfford(reward) ? '兑换' : '积分不足' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 兑换历史 -->
      <div class="mt-12">
        <h2 class="text-lg font-bold text-gray-800 mb-4">我的兑换记录</h2>
        <div v-if="redemptions.length === 0" class="text-center py-8 bg-white rounded-xl">
          <p class="text-gray-500">还没有兑换过奖励</p>
        </div>
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="divide-y divide-gray-100">
            <div
              v-for="redemption in redemptions"
              :key="redemption.id"
              class="p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ redemption.reward?.iconUrl || '🎁' }}</span>
                <div>
                  <p class="font-medium text-gray-800">{{ redemption.reward?.name }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(redemption.createdAt) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-amber-500">-{{ redemption.pointsSpent }}</p>
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="getStatusClass(redemption.status)"
                >
                  {{ getStatusText(redemption.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 兑换确认弹窗 -->
    <div v-if="showRedeemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-2">确认兑换</h3>
        <p class="text-gray-600 mb-4">
          确定要兑换 <span class="font-bold">{{ selectedReward?.name }}</span> 吗？
        </p>

        <!-- 游戏时间选择 -->
        <div v-if="hasTieredPricing(selectedReward)" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">选择时长</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="(cost, hours) in getTieredPricing(selectedReward)"
              :key="hours"
              @click="selectedHours = parseFloat(String(hours))"
              :class="[
                'p-3 rounded-lg text-center border-2 transition-colors',
                selectedHours === parseFloat(String(hours))
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              ]"
            >
              <p class="font-bold text-gray-800">{{ hours }}小时</p>
              <p class="text-sm" :class="getTierPriceClass(String(hours), selectedReward)">{{ cost }}积分</p>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">当前积分</span>
            <span class="font-bold">{{ userPoints }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">兑换消耗</span>
            <span class="font-bold text-red-500">-{{ calculateCost(selectedReward) }}</span>
          </div>
          <div class="border-t pt-2 flex justify-between">
            <span class="text-gray-800 font-medium">兑换后剩余</span>
            <span class="font-bold text-blue-600">{{ userPoints - calculateCost(selectedReward) }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showRedeemModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmRedeem"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            确认兑换
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { rewardApi, pointApi } from '@/api';

const authStore = useAuthStore();

const rewardTypes = [
  { key: 'all', label: '全部' },
  { key: 'virtual', label: '虚拟奖励' },
  { key: 'physical', label: '实物奖励' },
  { key: 'activity', label: '活动奖励' },
  { key: 'cash', label: '现金' },
];

const selectedType = ref('all');
const rewards = ref<any[]>([]);
const redemptions = ref<any[]>([]);
const userPoints = ref(0);
const showRedeemModal = ref(false);
const selectedReward = ref<any>(null);
const selectedHours = ref(1);
const todayRedeemedHours = ref(0);

// 过滤后的奖励
const filteredRewards = computed(() => {
  if (selectedType.value === 'all') return rewards.value;
  return rewards.value.filter(r => r.type === selectedType.value);
});

const fetchRewards = async () => {
  try {
    const response = await rewardApi.getRewards({ familyId: authStore.user?.familyId }) as any;
    rewards.value = response.rewards || [];
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
  }
};

const fetchRedemptions = async () => {
  try {
    const response = await rewardApi.getRedemptions({ userId: authStore.user?.id }) as any;
    redemptions.value = response.redemptions || [];
  } catch (error) {
    console.error('Failed to fetch redemptions:', error);
  }
};

const fetchUserPoints = async () => {
  try {
    const response = await pointApi.getStats({ userId: authStore.user?.id || 0 }) as any;
    userPoints.value = response.stats?.totalBalance || 0;
  } catch (error) {
    console.error('Failed to fetch user points:', error);
  }
};

const fetchGameTimeHistory = async (rewardId: number) => {
  try {
    const response = await rewardApi.getGameTimeHistory({
      userId: authStore.user?.id || 0,
      rewardId,
    }) as any;
    todayRedeemedHours.value = response.todayHours || 0;
  } catch (error) {
    console.error('Failed to fetch game time history:', error);
    todayRedeemedHours.value = 0;
  }
};

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    physical: 'bg-blue-100 text-blue-600',
    virtual: 'bg-pink-100 text-pink-600',
    activity: 'bg-green-100 text-green-600',
    cash: 'bg-amber-100 text-amber-600',
  };
  return classes[type] || 'bg-gray-100 text-gray-600';
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    physical: '📦',
    virtual: '🎮',
    activity: '🎯',
    cash: '💰',
  };
  return icons[type] || '🎁';
};

const hasTieredPricing = (reward: any) => {
  if (!reward) return false;
  const config = parseConfig(reward.config);
  return config.tieredPricing && Object.keys(config.tieredPricing).length > 0;
};

const getTieredPricing = (reward: any) => {
  if (!reward) return {};
  const config = parseConfig(reward.config);
  return config.tieredPricing || {};
};

const getTierPriceClass = (hours: string | number, reward: any) => {
  const pricing = getTieredPricing(reward);
  const hourNum = typeof hours === 'string' ? parseFloat(hours) : hours;
  const currentTotal = todayRedeemedHours.value + selectedHours.value;

  // 如果当前选择的时长加上已兑换的时长大于等于这个阶梯，显示为当前价格
  if (currentTotal >= hourNum && hourNum >= selectedHours.value) {
    return 'text-blue-600 font-bold';
  }
  return 'text-gray-500';
};

const parseConfig = (config: string | object) => {
  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch {
      return {};
    }
  }
  return config || {};
};

const calculateCost = (reward: any) => {
  if (!reward) return 0;
  
  const config = parseConfig(reward.config);
  if (config.tieredPricing && selectedHours.value) {
    // 根据今日已兑换时长计算实际价格
    const pricing = config.tieredPricing;
    const sortedTiers = Object.entries(pricing)
      .map(([h, cost]) => ({ hours: parseFloat(h), cost: cost as number }))
      .sort((a, b) => a.hours - b.hours);
    
    // 找到匹配的阶梯
    for (const tier of sortedTiers) {
      if (selectedHours.value <= tier.hours) {
        return tier.cost;
      }
    }
    return sortedTiers[sortedTiers.length - 1]?.cost || reward.pointsCost;
  }
  
  return reward.pointsCost;
};

const canAfford = (reward: any) => {
  return userPoints.value >= calculateCost(reward);
};

const openRedeemModal = (reward: any) => {
  selectedReward.value = reward;
  selectedHours.value = 1;
  
  // 如果是游戏时间类型，获取今日兑换历史
  if (hasTieredPricing(reward)) {
    fetchGameTimeHistory(reward.id);
  }
  
  showRedeemModal.value = true;
};

const confirmRedeem = async () => {
  if (!selectedReward.value) return;
  
  try {
    const note = hasTieredPricing(selectedReward.value)
      ? `${selectedHours.value}小时游戏时间`
      : undefined;
    
    await rewardApi.redeemReward(selectedReward.value.id, {
      userId: authStore.user?.id || 0,
      hours: hasTieredPricing(selectedReward.value) ? selectedHours.value : undefined,
      note,
    });
    
    showRedeemModal.value = false;
    selectedReward.value = null;
    
    // 刷新数据
    await Promise.all([
      fetchUserPoints(),
      fetchRedemptions(),
      fetchRewards(),
    ]);
    
    alert('兑换申请已提交，请等待家长审核！');
  } catch (error: any) {
    console.error('Failed to redeem reward:', error);
    alert(error.response?.data?.error || '兑换失败');
  }
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getStatusText = (status: string) => {
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
/* 自定义滚动条 */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
</style>