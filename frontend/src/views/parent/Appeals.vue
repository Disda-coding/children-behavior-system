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
          <h1 class="text-xl font-bold text-gray-800">申诉审核</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 申诉列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">待处理申诉</h2>
          <div class="flex gap-2">
            <button
              @click="filterStatus = 'pending'"
              :class="[
                'px-3 py-1 rounded-lg text-sm transition-colors',
                filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'
              ]"
            >
              待处理
            </button>
            <button
              @click="filterStatus = 'approved'"
              :class="[
                'px-3 py-1 rounded-lg text-sm transition-colors',
                filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              ]"
            >
              已批准
            </button>
            <button
              @click="filterStatus = 'rejected'"
              :class="[
                'px-3 py-1 rounded-lg text-sm transition-colors',
                filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
              ]"
            >
              已拒绝
            </button>
          </div>
        </div>

        <div v-if="filteredAppeals.length === 0" class="text-center py-8 text-gray-500">
          暂无{{ getStatusText(filterStatus) }}申诉
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="appeal in filteredAppeals"
            :key="appeal.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-medium text-gray-800">{{ appeal.displayName }}</span>
                  <span
                    :class="[
                      'px-2 py-0.5 text-xs rounded',
                      appeal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      appeal.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    ]"
                  >
                    {{ getStatusLabel(appeal.status) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                  <span class="text-gray-400">申诉原因：</span>{{ appeal.reason }}
                </p>
                <p class="text-sm text-gray-500">
                  <span class="text-gray-400">原记录：</span>{{ appeal.pointReason }}
                  <span
                    :class="[
                      'ml-2 font-medium',
                      appeal.pointType === 'earn' ? 'text-green-600' : 'text-red-600'
                    ]"
                  >
                    {{ appeal.pointType === 'earn' ? '+' : '-' }}{{ appeal.pointAmount }}
                  </span>
                </p>
                <p class="text-xs text-gray-400 mt-2">
                  {{ formatDate(appeal.createdAt) }}
                </p>
              </div>
            </div>

            <!-- 处理按钮（仅待处理状态显示） -->
            <div v-if="appeal.status === 'pending'" class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                @click="handleAppeal(appeal.id, 'approved')"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                批准申诉
              </button>
              <button
                @click="handleAppeal(appeal.id, 'rejected')"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                拒绝申诉
              </button>
            </div>

            <!-- 处理结果（已处理状态显示） -->
            <div v-else class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                <span class="text-gray-400">处理结果：</span>{{ appeal.response || '无' }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                处理时间：{{ formatDate(appeal.handledAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { appealApi } from '@/api';

const authStore = useAuthStore();

const appeals = ref<any[]>([]);
const filterStatus = ref<'pending' | 'approved' | 'rejected'>('pending');

const filteredAppeals = computed(() => {
  return appeals.value.filter(a => a.status === filterStatus.value);
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝',
  };
  return labels[status] || status;
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝',
  };
  return texts[status] || status;
};

const fetchAppeals = async () => {
  try {
    const response = await appealApi.getAppeals() as any;
    appeals.value = response.appeals || [];
  } catch (error) {
    console.error('Failed to fetch appeals:', error);
  }
};

const handleAppeal = async (id: number, status: 'approved' | 'rejected') => {
  const response = status === 'approved' 
    ? '申诉已批准，积分已调整' 
    : '申诉已拒绝，维持原判';
  
  if (!confirm(`确定要${status === 'approved' ? '批准' : '拒绝'}这个申诉吗？`)) return;

  try {
    await appealApi.updateAppeal(id, {
      status,
      response,
      handledBy: authStore.user?.id,
    });
    fetchAppeals();
  } catch (error) {
    console.error('Failed to handle appeal:', error);
    alert('处理申诉失败');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchAppeals();
});
</script>
