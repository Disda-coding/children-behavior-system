<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/parent/dashboard" class="text-gray-600 hover:text-gray-800 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">奖励管理</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <!-- 快速添加常用奖励 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">快速添加常用奖励</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            v-for="template in rewardTemplates"
            :key="template.name"
            @click="quickAddReward(template)"
            class="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all text-center"
          >
            <div class="text-2xl mb-2">{{ template.icon }}</div>
            <p class="text-sm font-medium text-gray-800">{{ template.name }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ template.pointsCost }}积分</p>
          </button>
        </div>
      </div>

      <!-- 奖励列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">奖励列表</h2>
          <button
            @click="showAddModal = true"
            class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            添加自定义奖励
          </button>
        </div>

        <div v-if="rewards.length === 0" class="text-center py-8 text-gray-500">
          暂无奖励，点击上方按钮添加或使用快速添加
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="reward in rewards"
            :key="reward.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-start space-x-3">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">{{ reward.icon || '🎁' }}</span>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-800">{{ reward.name }}</h3>
                <p class="text-sm text-gray-500">{{ reward.description }}</p>
                <p class="text-sm font-medium text-yellow-600 mt-1">
                  {{ formatPointsCost(reward) }}
                </p>
                <span
                  :class="[
                    'inline-block px-2 py-1 text-xs rounded mt-2',
                    reward.type === 'physical' ? 'bg-blue-100 text-blue-700' :
                    reward.type === 'virtual' ? 'bg-purple-100 text-purple-700' :
                    reward.type === 'activity' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ getTypeLabel(reward.type) }}
                </span>
                <span v-if="reward.config?.tieredPricing" class="inline-block px-2 py-1 text-xs rounded mt-2 ml-2 bg-orange-100 text-orange-700">
                  阶梯价格
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 兑换记录 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-6">兑换记录</h2>
        <div v-if="redemptions.length === 0" class="text-center py-8 text-gray-500">
          暂无兑换记录
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="redemption in redemptions"
            :key="redemption.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div>
              <p class="font-medium text-gray-800">{{ redemption.rewardName }}</p>
              <p class="text-sm text-gray-500">
                {{ redemption.displayName }} · {{ formatDate(redemption.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">-{{ redemption.pointsSpent }}积分</span>
              <span
                :class="[
                  'px-2 py-1 text-xs rounded',
                  redemption.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  redemption.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                ]"
              >
                {{ getStatusLabel(redemption.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加奖励弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 mb-4">添加奖励</h3>
        <form @submit.prevent="addReward" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">奖励名称</label>
            <input
              v-model="newReward.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="如：周末去游乐园"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <input
              v-model="newReward.description"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">图标</label>
            <div class="grid grid-cols-8 gap-2">
              <button
                v-for="icon in commonIcons"
                :key="icon"
                type="button"
                @click="newReward.icon = icon"
                :class="[
                  'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors',
                  newReward.icon === icon ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-50 hover:bg-gray-100'
                ]"
              >
                {{ icon }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              v-model="newReward.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="physical">实物奖励</option>
              <option value="virtual">虚拟奖励</option>
              <option value="activity">活动奖励</option>
              <option value="cash">现金奖励</option>
            </select>
          </div>
          
          <!-- 价格类型选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">价格类型</label>
            <div class="flex gap-2">
              <button
                type="button"
                @click="priceType = 'fixed'"
                :class="[
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  priceType === 'fixed' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'
                ]"
              >
                固定价格
              </button>
              <button
                type="button"
                @click="priceType = 'tiered'"
                :class="[
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  priceType === 'tiered' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'
                ]"
              >
                阶梯价格
              </button>
            </div>
          </div>

          <!-- 固定价格 -->
          <div v-if="priceType === 'fixed'">
            <label class="block text-sm font-medium text-gray-700 mb-1">所需积分</label>
            <input
              v-model.number="newReward.pointsCost"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="如：100"
            />
          </div>

          <!-- 阶梯价格 -->
          <div v-else class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">阶梯价格设置</label>
            <p class="text-xs text-gray-500">兑换次数越多，单次所需积分指数增加</p>
            <div v-for="(tier, index) in tieredPricing" :key="index" class="flex gap-2 items-center">
              <span class="text-sm text-gray-600 w-20">第 {{ tier.count }} 次</span>
              <input
                v-model.number="tier.points"
                type="number"
                min="1"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="积分"
              />
              <button
                v-if="tieredPricing.length > 1"
                type="button"
                @click="removeTier(index)"
                class="text-red-600 hover:text-red-700 p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              v-if="tieredPricing.length < 5"
              type="button"
              @click="addTier"
              class="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              + 添加阶梯
            </button>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { rewardApi } from '@/api';

const authStore = useAuthStore();

const rewards = ref<any[]>([]);
const redemptions = ref<any[]>([]);
const showAddModal = ref(false);
const priceType = ref<'fixed' | 'tiered'>('fixed');

// 常用图标
const commonIcons = ['🎁', '🎮', '🍦', '🎬', '📚', '🧸', '⚽', '🎨', '🎵', '✈️', '🏖️', '💰', '🍕', '🍰', '🥤'];

// 常用奖励模板
const rewardTemplates = [
  { name: '玩游戏30分钟', icon: '🎮', type: 'activity', pointsCost: 50, description: '可以玩30分钟游戏' },
  { name: '吃冰淇淋', icon: '🍦', type: 'physical', pointsCost: 30, description: '奖励一个美味的冰淇淋' },
  { name: '看电影', icon: '🎬', type: 'activity', pointsCost: 100, description: '可以看一部电影' },
  { name: '买本书', icon: '📚', type: 'physical', pointsCost: 80, description: '可以买一本喜欢的书' },
  { name: '去公园玩', icon: '⚽', type: 'activity', pointsCost: 40, description: '可以去公园玩耍' },
  { name: '买玩具', icon: '🧸', type: 'physical', pointsCost: 150, description: '可以买一个小玩具' },
  { name: '画画时间', icon: '🎨', type: 'activity', pointsCost: 30, description: '额外的画画时间' },
  { name: '听音乐', icon: '🎵', type: 'virtual', pointsCost: 20, description: '可以听音乐放松' },
  { name: '周末出游', icon: '✈️', type: 'activity', pointsCost: 200, description: '周末去好玩的地方' },
  { name: '海滩度假', icon: '🏖️', type: 'activity', pointsCost: 500, description: '去海滩玩一天' },
  { name: '零花钱', icon: '💰', type: 'cash', pointsCost: 100, description: '兑换10元现金' },
  { name: '吃披萨', icon: '🍕', type: 'activity', pointsCost: 60, description: '可以吃披萨' },
];

// 阶梯价格
const tieredPricing = ref([
  { count: 1, points: 50 },
  { count: 2, points: 80 },
  { count: 3, points: 130 },
]);

const newReward = ref({
  name: '',
  description: '',
  icon: '🎁',
  type: 'activity' as 'physical' | 'virtual' | 'activity' | 'cash',
  pointsCost: 100,
});

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    physical: '实物',
    virtual: '虚拟',
    activity: '活动',
    cash: '现金',
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝',
    completed: '已完成',
  };
  return labels[status] || status;
};

const formatPointsCost = (reward: any) => {
  if (reward.config?.tieredPricing) {
    const tiers = Object.entries(reward.config.tieredPricing);
    if (tiers.length > 0 && tiers[0]) {
      return `${tiers[0][1]} 积分起`;
    }
  }
  return `${reward.pointsCost} 积分`;
};

const quickAddReward = async (template: any) => {
  try {
    await rewardApi.createReward({
      familyId: authStore.user?.familyId || 0,
      name: template.name,
      description: template.description,
      type: template.type,
      pointsCost: template.pointsCost,
      iconUrl: template.icon,
    });
    fetchRewards();
    alert(`已添加奖励：${template.name}`);
  } catch (error) {
    console.error('Failed to add reward:', error);
    alert('添加奖励失败');
  }
};

const addTier = () => {
  const nextCount = tieredPricing.value.length + 1;
  const prevPoints = tieredPricing.value[tieredPricing.value.length - 1]?.points || 50;
  // 指数增加：每次增加约1.6倍
  tieredPricing.value.push({
    count: nextCount,
    points: Math.round(prevPoints * 1.6),
  });
};

const removeTier = (index: number) => {
  tieredPricing.value.splice(index, 1);
  // 重新编号
  tieredPricing.value.forEach((tier, i) => {
    tier.count = i + 1;
  });
};

const fetchRewards = async () => {
  try {
    const response = await rewardApi.getRewards() as any;
    rewards.value = response.rewards || [];
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
  }
};

const fetchRedemptions = async () => {
  try {
    const response = await rewardApi.getRedemptions() as any;
    redemptions.value = response.redemptions || [];
  } catch (error) {
    console.error('Failed to fetch redemptions:', error);
  }
};

const addReward = async () => {
  try {
    const data: any = {
      familyId: authStore.user?.familyId || 0,
      name: newReward.value.name,
      description: newReward.value.description,
      type: newReward.value.type,
      iconUrl: newReward.value.icon,
    };

    if (priceType.value === 'fixed') {
      data.pointsCost = newReward.value.pointsCost;
    } else {
      // 阶梯价格
      const pricing: Record<number, number> = {};
      tieredPricing.value.forEach(tier => {
        pricing[tier.count] = tier.points;
      });
      data.pointsCost = tieredPricing.value[0]?.points || 50;
      data.config = { tieredPricing: pricing };
    }

    await rewardApi.createReward(data);
    showAddModal.value = false;
    newReward.value = { name: '', description: '', icon: '🎁', type: 'activity', pointsCost: 100 };
    priceType.value = 'fixed';
    tieredPricing.value = [
      { count: 1, points: 50 },
      { count: 2, points: 80 },
      { count: 3, points: 130 },
    ];
    fetchRewards();
  } catch (error) {
    console.error('Failed to add reward:', error);
    alert('添加奖励失败');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchRewards();
  fetchRedemptions();
});
</script>
