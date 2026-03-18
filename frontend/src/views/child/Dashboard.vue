<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部导航 -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-800">我的成长空间</h1>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {{ authStore.user?.displayName?.charAt(0) || '?' }}
              </div>
              <span class="text-gray-700 text-sm font-medium">{{ authStore.user?.displayName }}</span>
            </div>
            <button
              @click="authStore.logout"
              class="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 积分卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- 总积分 -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">我的总积分</p>
              <div class="mt-2">
                <FlipNumber :value="stats.totalBalance" :size="48" class="text-white" />
              </div>
            </div>
            <div class="bg-white/20 p-3 rounded-full">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 今日获得 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">今日获得</p>
              <div class="mt-2">
                <FlipNumber :value="stats.todayEarned" :size="36" class="text-green-600" />
              </div>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 今日扣除 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">今日扣除</p>
              <div class="mt-2">
                <FlipNumber :value="stats.todayDeducted" :size="36" class="text-red-600" />
              </div>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 本周获得 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">本周获得</p>
              <div class="mt-2">
                <FlipNumber :value="stats.weekEarned" :size="36" class="text-yellow-600" />
              </div>
            </div>
            <div class="bg-yellow-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <router-link
          to="/child/achievements"
          class="bg-white rounded-xl p-6 shadow-sm card-hover text-center"
        >
          <div class="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800">我的成就</h3>
        </router-link>

        <router-link
          to="/child/rewards"
          class="bg-white rounded-xl p-6 shadow-sm card-hover text-center"
        >
          <div class="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800">兑换奖励</h3>
        </router-link>

        <router-link
          to="/child/appeals"
          class="bg-white rounded-xl p-6 shadow-sm card-hover text-center"
        >
          <div class="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800">申诉</h3>
        </router-link>

        <router-link
          to="/child/meetings"
          class="bg-white rounded-xl p-6 shadow-sm card-hover text-center"
        >
          <div class="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800">家庭会议</h3>
        </router-link>
      </div>

      <!-- 最近动态 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">最近动态</h2>
        <div v-if="recentRecords.length === 0" class="text-center py-8 text-gray-500">
          暂无记录
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  record.type === 'earn' ? 'bg-green-100 text-green-600' :
                  record.type === 'deduct' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                ]"
              >
                <span class="text-lg font-bold">
                  {{ record.type === 'earn' ? '+' : record.type === 'deduct' ? '-' : '' }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ record.reason }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(record.createdAt) }}</p>
              </div>
            </div>
            <span
              :class="[
                'font-bold',
                record.type === 'earn' ? 'text-green-600' :
                record.type === 'deduct' ? 'text-red-600' :
                'text-gray-600'
              ]"
            >
              {{ record.type === 'earn' ? '+' : '' }}{{ record.amount }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { pointApi } from '@/api';
import FlipNumber from '@/components/common/FlipNumber.vue';

const authStore = useAuthStore();

const stats = ref({
  todayEarned: 0,
  todayDeducted: 0,
  weekEarned: 0,
  weekDeducted: 0,
  totalBalance: 0,
});

const recentRecords = ref<any[]>([]);

const fetchStats = async () => {
  try {
    if (authStore.user?.id) {
      const response = await pointApi.getStats({ userId: authStore.user.id }) as { stats: typeof stats.value };
      stats.value = response.stats;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

const fetchRecentRecords = async () => {
  try {
    if (authStore.user?.id) {
      const response = await pointApi.getRecords({ userId: authStore.user.id }) as { records: any[] };
      recentRecords.value = response.records.slice(0, 10);
    }
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchStats();
  fetchRecentRecords();
});
</script>
