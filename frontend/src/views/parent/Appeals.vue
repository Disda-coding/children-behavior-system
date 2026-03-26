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
          <h1 class="text-xl font-bold text-gray-800">申诉审核</h1>
        </div>
      </div>
    </nav>

    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-3xl font-bold text-gray-800">{{ stats.total }}</p>
          <p class="text-gray-500 text-sm">总申诉</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</p>
          <p class="text-gray-500 text-sm">待审核</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-3xl font-bold text-green-600">{{ stats.approved }}</p>
          <p class="text-gray-500 text-sm">已通过</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-3xl font-bold text-red-600">{{ stats.rejected }}</p>
          <p class="text-gray-500 text-sm">已驳回</p>
        </div>
      </div>

      <!-- 标签页 -->
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
              v-if="tab.key === 'pending' && stats.pending > 0"
              class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
            >
              {{ stats.pending }}
            </span>
          </button>
        </div>
      </div>

      <!-- 待审核列表 -->
      <div v-if="activeTab === 'pending'">
        <div v-if="pendingAppeals.length === 0" class="text-center py-12 bg-white rounded-xl">
          <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-800">暂无待审核申诉</h3>
          <p class="text-gray-500">所有申诉都已处理完毕</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="appeal in pendingAppeals"
            :key="appeal.id"
            class="bg-white rounded-xl p-6 shadow-sm"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span class="text-red-600 font-bold text-lg">-{{ appeal.pointRecord?.amount }}</span>
                </div>
                <div>
                  <p class="font-bold text-gray-800">{{ appeal.pointRecord?.reason }}</p>
                  <p class="text-sm text-gray-500">
                    {{ appeal.user?.displayName }} · {{ formatDate(appeal.createdAt) }}
                  </p>
                </div>
              </div>
              <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                待审核
              </span>
            </div>

            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <p class="text-sm text-gray-600">
                <span class="font-medium">申诉理由：</span>{{ appeal.reason }}
              </p>
            </div>

            <div class="flex gap-3">
              <button
                @click="openApproveModal(appeal)"
                class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                通过并返还积分
              </button>
              <button
                @click="openRejectModal(appeal)"
                class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                驳回
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 已处理列表 -->
      <div v-else-if="activeTab === 'processed'">
        <div v-if="processedAppeals.length === 0" class="text-center py-12 bg-white rounded-xl">
          <p class="text-gray-500">暂无已处理的申诉</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">孩子</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">扣分记录</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">申诉理由</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">处理时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="appeal in processedAppeals" :key="appeal.id">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                      {{ appeal.user?.displayName?.charAt(0) }}
                    </div>
                    <span class="font-medium text-gray-800">{{ appeal.user?.displayName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="text-gray-800">{{ appeal.pointRecord?.reason }}</p>
                  <p class="text-sm text-red-600">-{{ appeal.pointRecord?.amount }} 积分</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-gray-600 text-sm max-w-xs truncate">{{ appeal.reason }}</p>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(appeal.status)"
                  >
                    {{ getStatusText(appeal.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(appeal.handledAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- 通过申诉弹窗 -->
    <div v-if="showApproveModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-lg font-bold text-gray-800 mb-4">通过申诉</h3>
        <div class="bg-green-50 rounded-lg p-4 mb-4">
          <p class="text-sm text-green-700">
            通过此申诉后，将返还 <span class="font-bold">{{ selectedAppeal?.pointRecord?.amount }}</span> 积分给孩子
          </p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">处理意见（可选）</label>
          <textarea
            v-model="approveResponse"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="请输入处理意见..."
          ></textarea>
        </div>
        <div class="flex gap-3">
          <button
            @click="showApproveModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmApprove"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            确认通过
          </button>
        </div>
      </div>
    </div>

    <!-- 驳回申诉弹窗 -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-lg font-bold text-gray-800 mb-4">驳回申诉</h3>
        <div class="bg-red-50 rounded-lg p-4 mb-4">
          <p class="text-sm text-red-700">
            驳回后，孩子将收到您的答复，积分不会返还
          </p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">驳回原因（建议填写）</label>
          <textarea
            v-model="rejectResponse"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="请输入驳回原因..."
          ></textarea>
        </div>
        <div class="flex gap-3">
          <button
            @click="showRejectModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmReject"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            确认驳回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { appealApi } from '@/api';

const authStore = useAuthStore();

const tabs = [
  { key: 'pending', label: '待审核' },
  { key: 'processed', label: '已处理' },
];

const activeTab = ref('pending');
const appeals = ref<any[]>([]);
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
});

const showApproveModal = ref(false);
const showRejectModal = ref(false);
const selectedAppeal = ref<any>(null);
const approveResponse = ref('');
const rejectResponse = ref('');

// 待审核列表
const pendingAppeals = computed(() => {
  return appeals.value.filter(a => a.status === 'pending');
});

// 已处理列表
const processedAppeals = computed(() => {
  return appeals.value.filter(a => a.status !== 'pending');
});

const fetchAppeals = async () => {
  try {
    const response = await appealApi.getAppeals({ 
      familyId: authStore.user?.familyId 
    }) as any;
    appeals.value = response.appeals || [];
  } catch (error) {
    console.error('Failed to fetch appeals:', error);
  }
};

const fetchStats = async () => {
  try {
    const response = await appealApi.getAppealStats({ 
      familyId: authStore.user?.familyId 
    }) as any;
    stats.value = response.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
  } catch (error) {
    console.error('Failed to fetch appeal stats:', error);
  }
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  };
  return texts[status] || status;
};

const openApproveModal = (appeal: any) => {
  selectedAppeal.value = appeal;
  approveResponse.value = '';
  showApproveModal.value = true;
};

const openRejectModal = (appeal: any) => {
  selectedAppeal.value = appeal;
  rejectResponse.value = '';
  showRejectModal.value = true;
};

const confirmApprove = async () => {
  try {
    await appealApi.approveAppeal(selectedAppeal.value.id, {
      handledBy: authStore.user?.id || 0,
      response: approveResponse.value || undefined,
    });
    
    showApproveModal.value = false;
    selectedAppeal.value = null;
    
    await Promise.all([fetchAppeals(), fetchStats()]);
    alert('申诉已通过，积分已返还！');
  } catch (error) {
    console.error('Failed to approve appeal:', error);
    alert('操作失败');
  }
};

const confirmReject = async () => {
  try {
    await appealApi.rejectAppeal(selectedAppeal.value.id, {
      handledBy: authStore.user?.id || 0,
      response: rejectResponse.value || undefined,
    });
    
    showRejectModal.value = false;
    selectedAppeal.value = null;
    
    await Promise.all([fetchAppeals(), fetchStats()]);
    alert('申诉已驳回');
  } catch (error) {
    console.error('Failed to reject appeal:', error);
    alert('操作失败');
  }
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchAppeals();
  fetchStats();
});
</script>
