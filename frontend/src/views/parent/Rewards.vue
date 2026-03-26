<template>
  <div class="app-shell min-h-screen bg-gray-50">
    <nav class="app-nav bg-white shadow-sm">
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

    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 标签页切换 -->
      <div class="bg-white rounded-xl shadow-sm mb-6">
        <div class="flex border-b">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'flex-1 py-4 text-center font-medium transition-colors',
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
            <span
              v-if="tab.key === 'pending' && pendingCount > 0"
              class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
            >
              {{ pendingCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- 奖励列表 -->
      <div v-if="activeTab === 'rewards'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-gray-800">奖励列表</h2>
          <button
            @click="showAddModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            添加奖励
          </button>
        </div>

        <div v-if="rewards.length === 0" class="text-center py-12 bg-white rounded-xl">
          <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-800">暂无奖励</h3>
          <p class="text-gray-500">点击上方按钮添加奖励</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="reward in rewards"
            :key="reward.id"
            class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                :class="getTypeClass(reward.type)"
              >
                {{ getTypeIcon(reward.type) }}
              </div>
              <div class="flex gap-2">
                <button
                  @click="editReward(reward)"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteReward(reward.id)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <h3 class="font-bold text-lg text-gray-800 mb-2">{{ reward.name }}</h3>
            <p class="text-sm text-gray-500 mb-4">{{ reward.description }}</p>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-amber-500">{{ reward.pointsCost }}</span>
                <span class="text-sm text-gray-500">积分</span>
              </div>
              <span
                v-if="reward.stock !== null && reward.stock !== undefined"
                class="text-sm px-3 py-1 rounded-full"
                :class="reward.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                库存: {{ reward.stock }}
              </span>
            </div>

            <!-- 阶梯价格提示 -->
            <div v-if="reward.config" class="mt-4 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-500 mb-2">阶梯价格:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(cost, hours) in parseConfig(reward.config).tieredPricing"
                  :key="hours"
                  class="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {{ hours }}h: {{ cost }}分
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 兑换审核 -->
      <div v-else-if="activeTab === 'pending'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-gray-800">待审核兑换</h2>
          <button
            @click="fetchRedemptions"
            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            :class="{ 'animate-spin': loadingRedemptions }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div v-if="pendingRedemptions.length === 0" class="text-center py-12 bg-white rounded-xl">
          <p class="text-gray-500">暂无待审核的兑换请求</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="redemption in pendingRedemptions"
            :key="redemption.id"
            class="bg-white rounded-xl p-6 shadow-sm"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  {{ redemption.reward?.iconUrl || '🎁' }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">{{ redemption.reward?.name }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ redemption.user?.displayName }} · {{ formatDate(redemption.createdAt) }}
                  </p>
                  <p v-if="redemption.note" class="text-sm text-gray-600 mt-1">
                    备注: {{ redemption.note }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-amber-500">-{{ redemption.pointsSpent }}</p>
                <p class="text-sm text-gray-500">积分</p>
              </div>
            </div>

            <div class="flex gap-3 mt-4 pt-4 border-t border-gray-100">
              <button
                @click="approveRedemption(redemption.id)"
                class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                通过
              </button>
              <button
                @click="rejectRedemption(redemption.id)"
                class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                拒绝
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 兑换历史 -->
      <div v-else-if="activeTab === 'history'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-gray-800">兑换历史</h2>
          <select
            v-model="historyFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="approved">已通过</option>
            <option value="completed">已完成</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>

        <div v-if="filteredHistory.length === 0" class="text-center py-12 bg-white rounded-xl">
          <p class="text-gray-500">暂无兑换记录</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">奖励</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">孩子</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">积分</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="redemption in filteredHistory" :key="redemption.id">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ redemption.reward?.iconUrl || '🎁' }}</span>
                    <span class="font-medium text-gray-800">{{ redemption.reward?.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ redemption.user?.displayName }}</td>
                <td class="px-6 py-4">
                  <span class="font-bold text-amber-500">-{{ redemption.pointsSpent }}</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusClass(redemption.status)"
                  >
                    {{ getStatusText(redemption.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(redemption.createdAt) }}</td>
                <td class="px-6 py-4">
                  <button
                    v-if="redemption.status === 'approved'"
                    @click="completeRedemption(redemption.id)"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    标记完成
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- 添加/编辑奖励弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 mb-4">{{ editingReward ? '编辑奖励' : '添加奖励' }}</h3>
        <form @submit.prevent="saveReward" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">奖励名称</label>
            <input
              v-model="rewardForm.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="如：游戏时间"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <input
              v-model="rewardForm.description"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="可选"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">奖励类型</label>
            <select
              v-model="rewardForm.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="physical">实物奖励</option>
              <option value="virtual">虚拟奖励</option>
              <option value="activity">活动奖励</option>
              <option value="cash">现金/零花钱</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">基础积分</label>
            <input
              v-model.number="rewardForm.pointsCost"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">库存（可选）</label>
            <input
              v-model.number="rewardForm.stock"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="留空表示无限"
            />
          </div>

          <!-- 阶梯价格配置 -->
          <div class="border-t pt-4">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">阶梯价格配置</label>
              <button
                type="button"
                @click="addTier"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                + 添加阶梯
              </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">用于游戏时间等连续兑换价格递增的场景</p>
            <div v-for="(tier, index) in tiers" :key="index" class="flex gap-2 mb-2">
              <input
                v-model.number="tier.hours"
                type="number"
                step="0.5"
                min="0.5"
                placeholder="小时"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                v-model.number="tier.cost"
                type="number"
                min="1"
                placeholder="积分"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                @click="removeTier(index)"
                class="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ editingReward ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { rewardApi } from '@/api';

const authStore = useAuthStore();

const tabs = [
  { key: 'rewards', label: '奖励列表' },
  { key: 'pending', label: '待审核' },
  { key: 'history', label: '兑换历史' },
];

const activeTab = ref('rewards');
const rewards = ref<any[]>([]);
const redemptions = ref<any[]>([]);
const loadingRedemptions = ref(false);
const historyFilter = ref('');
const showAddModal = ref(false);
const editingReward = ref<any>(null);

const rewardForm = ref({
  name: '',
  description: '',
  type: 'virtual' as 'physical' | 'virtual' | 'activity' | 'cash',
  pointsCost: 100,
  stock: undefined as number | undefined,
});

const tiers = ref<{ hours: number; cost: number }[]>([]);

// 待审核数量
const pendingCount = computed(() => {
  return redemptions.value.filter(r => r.status === 'pending').length;
});

// 待审核列表
const pendingRedemptions = computed(() => {
  return redemptions.value.filter(r => r.status === 'pending');
});

// 过滤后的历史记录
const filteredHistory = computed(() => {
  let list = redemptions.value.filter(r => r.status !== 'pending');
  if (historyFilter.value) {
    list = list.filter(r => r.status === historyFilter.value);
  }
  return list;
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
  loadingRedemptions.value = true;
  try {
    const response = await rewardApi.getRedemptions({ familyId: authStore.user?.familyId }) as any;
    redemptions.value = response.redemptions || [];
  } catch (error) {
    console.error('Failed to fetch redemptions:', error);
  } finally {
    loadingRedemptions.value = false;
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

const editReward = (reward: any) => {
  editingReward.value = reward;
  rewardForm.value = {
    name: reward.name,
    description: reward.description || '',
    type: reward.type,
    pointsCost: reward.pointsCost,
    stock: reward.stock,
  };
  
  // 解析阶梯价格
  const config = parseConfig(reward.config);
  if (config.tieredPricing) {
    tiers.value = Object.entries(config.tieredPricing).map(([hours, cost]) => ({
      hours: parseFloat(hours),
      cost: cost as number,
    }));
  } else {
    tiers.value = [];
  }
  
  showAddModal.value = true;
};

const addTier = () => {
  tiers.value.push({ hours: 1, cost: 200 });
};

const removeTier = (index: number) => {
  tiers.value.splice(index, 1);
};

const saveReward = async () => {
  try {
    // 构建阶梯价格配置
    const config: Record<string, any> = {};
    if (tiers.value.length > 0) {
      const tieredPricing: Record<string, number> = {};
      tiers.value.forEach(tier => {
        tieredPricing[tier.hours.toString()] = tier.cost;
      });
      config.tieredPricing = tieredPricing;
    }
    
    if (!authStore.user?.familyId) {
      alert('请先加入家庭');
      return;
    }

    const data = {
      ...rewardForm.value,
      familyId: authStore.user.familyId,
      config: Object.keys(config).length > 0 ? config : undefined,
    };

    if (editingReward.value) {
      await rewardApi.updateReward(editingReward.value.id, data);
    } else {
      await rewardApi.createReward(data);
    }
    
    showAddModal.value = false;
    resetForm();
    fetchRewards();
  } catch (error) {
    console.error('Failed to save reward:', error);
    alert('保存失败');
  }
};

const deleteReward = async (id: number) => {
  if (!confirm('确定要删除这个奖励吗？')) return;
  
  try {
    await rewardApi.deleteReward(id);
    fetchRewards();
  } catch (error) {
    console.error('Failed to delete reward:', error);
    alert('删除失败');
  }
};

const approveRedemption = async (id: number) => {
  try {
    await rewardApi.approveRedemption(id, { approvedBy: authStore.user?.id || 0 });
    fetchRedemptions();
  } catch (error) {
    console.error('Failed to approve redemption:', error);
    alert('审核失败');
  }
};

const rejectRedemption = async (id: number) => {
  const reason = prompt('请输入拒绝原因（可选）：');
  if (reason === null) return;
  
  try {
    await rewardApi.rejectRedemption(id, { 
      approvedBy: authStore.user?.id || 0,
      note: reason || undefined,
    });
    fetchRedemptions();
  } catch (error) {
    console.error('Failed to reject redemption:', error);
    alert('拒绝失败');
  }
};

const completeRedemption = async (id: number) => {
  try {
    await rewardApi.completeRedemption(id, { approvedBy: authStore.user?.id || 0 });
    fetchRedemptions();
  } catch (error) {
    console.error('Failed to complete redemption:', error);
    alert('操作失败');
  }
};

const resetForm = () => {
  editingReward.value = null;
  rewardForm.value = {
    name: '',
    description: '',
    type: 'virtual',
    pointsCost: 100,
    stock: undefined,
  };
  tiers.value = [];
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
});
</script>