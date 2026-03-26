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
          <h1 class="text-xl font-bold text-gray-800">申诉</h1>
        </div>
      </div>
    </nav>

    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 申诉说明 -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-medium text-blue-900">申诉说明</h3>
            <p class="text-blue-700 text-sm mt-1">
              如果你对某次扣分有异议，可以在这里提交申诉。家长会在审核后给出答复。
            </p>
          </div>
        </div>
      </div>

      <!-- 扣分记录列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">可申诉的扣分记录</h2>
        <div v-if="deductRecords.length === 0" class="text-center py-8 text-gray-500">
          暂无扣分记录
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="record in deductRecords"
            :key="record.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span class="text-red-600 font-bold">-</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ record.reason }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(record.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-red-600 font-bold">-{{ record.amount }}</span>
              <button
                @click="openAppealModal(record)"
                :disabled="hasAppealed(record.id)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  hasAppealed(record.id)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                ]"
              >
                {{ hasAppealed(record.id) ? '已申诉' : '申诉' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的申诉 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">我的申诉</h2>
        <div v-if="myAppeals.length === 0" class="text-center py-8 text-gray-500">
          暂无申诉记录
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="appeal in myAppeals"
            :key="appeal.id"
            class="p-4 border border-gray-200 rounded-xl"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-medium text-gray-800">{{ appeal.pointRecord?.reason }}</p>
                <p class="text-sm text-gray-500">扣分: -{{ appeal.pointRecord?.amount }}</p>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  appeal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  appeal.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                ]"
              >
                {{ appeal.status === 'pending' ? '审核中' : appeal.status === 'approved' ? '已通过' : '已驳回' }}
              </span>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 mt-3">
              <p class="text-sm text-gray-600">
                <span class="font-medium">申诉理由：</span>{{ appeal.reason }}
              </p>
            </div>
            <div v-if="appeal.response" class="mt-3 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-700">
                <span class="font-medium">家长答复：</span>{{ appeal.response }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 申诉弹窗 -->
    <div v-if="showAppealModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
        <h3 class="text-xl font-bold text-gray-800 mb-4">提交申诉</h3>
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <p class="font-medium text-gray-800">{{ selectedRecord?.reason }}</p>
          <p class="text-red-600 font-bold mt-1">-{{ selectedRecord?.amount }} 积分</p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">申诉理由</label>
          <textarea
            v-model="appealReason"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="请详细说明申诉理由..."
          ></textarea>
        </div>
        <div class="flex gap-3">
          <button
            @click="showAppealModal = false"
            class="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="submitAppeal"
            :disabled="!appealReason.trim()"
            class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交申诉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { pointApi, appealApi } from '@/api';

const authStore = useAuthStore();

const deductRecords = ref<any[]>([]);
const myAppeals = ref<any[]>([]);
const showAppealModal = ref(false);
const selectedRecord = ref<any>(null);
const appealReason = ref('');

const fetchDeductRecords = async () => {
  try {
    if (authStore.user?.id) {
      const response = await pointApi.getRecords({
        userId: authStore.user.id,
        type: 'deduct'
      }) as { records: any[] };
      deductRecords.value = response.records;
    }
  } catch (error) {
    console.error('Failed to fetch deduct records:', error);
  }
};

const fetchMyAppeals = async () => {
  try {
    if (authStore.user?.id) {
      const response = await appealApi.getAppeals({
        userId: authStore.user.id
      }) as { appeals: any[] };
      myAppeals.value = response.appeals;
    }
  } catch (error) {
    console.error('Failed to fetch appeals:', error);
  }
};

const hasAppealed = (recordId: number) => {
  return myAppeals.value.some(appeal => appeal.pointRecordId === recordId);
};

const openAppealModal = (record: any) => {
  selectedRecord.value = record;
  appealReason.value = '';
  showAppealModal.value = true;
};

const submitAppeal = async () => {
  try {
    if (authStore.user?.id && selectedRecord.value) {
      await appealApi.createAppeal({
        userId: authStore.user.id,
        pointRecordId: selectedRecord.value.id,
        reason: appealReason.value
      });
      showAppealModal.value = false;
      // 刷新申诉列表
      await fetchMyAppeals();
      alert('申诉提交成功！');
    }
  } catch (error) {
    console.error('Failed to submit appeal:', error);
    alert('申诉提交失败，请重试');
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchDeductRecords();
  fetchMyAppeals();
});
</script>
