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

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 奖励列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">奖励列表</h2>
          <button
            @click="showAddModal = true"
            class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            添加奖励
          </button>
        </div>

        <div v-if="rewards.length === 0" class="text-center py-8 text-gray-500">
          暂无奖励，点击上方按钮添加
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="reward in rewards"
            :key="reward.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-start space-x-3">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-800">{{ reward.name }}</h3>
                <p class="text-sm text-gray-500">{{ reward.description }}</p>
                <p class="text-sm font-medium text-yellow-600 mt-1">
                  {{ reward.pointsCost }} 积分
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
    </main>

    <!-- 添加奖励弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
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
          <div>
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

const newReward = ref({
  name: '',
  description: '',
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
    await rewardApi.createReward({
      familyId: authStore.user?.familyId || 0,
      name: newReward.value.name,
      description: newReward.value.description,
      type: newReward.value.type,
      pointsCost: newReward.value.pointsCost,
    });
    showAddModal.value = false;
    newReward.value = { name: '', description: '', type: 'activity', pointsCost: 100 };
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
