<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部导航 -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-800">家长管理后台</h1>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
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
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">家庭成员</p>
              <p class="text-3xl font-bold text-blue-600 mt-2">{{ familyMembers.length }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">积分规则</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ pointRulesCount }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">成就数量</p>
              <p class="text-3xl font-bold text-yellow-600 mt-2">{{ achievementsCount }}</p>
            </div>
            <div class="bg-yellow-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">待处理申诉</p>
              <p class="text-3xl font-bold text-red-600 mt-2">{{ pendingAppealsCount }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <router-link
          to="/parent/points"
          class="bg-white rounded-xl p-5 shadow-sm card-hover flex flex-col items-center justify-center py-8"
        >
          <div class="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800 text-base">积分管理</h3>
        </router-link>

        <router-link
          to="/parent/achievements"
          class="bg-white rounded-xl p-5 shadow-sm card-hover flex flex-col items-center justify-center py-8"
        >
          <div class="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800 text-base">成就管理</h3>
        </router-link>

        <router-link
          to="/parent/rewards"
          class="bg-white rounded-xl p-5 shadow-sm card-hover flex flex-col items-center justify-center py-8"
        >
          <div class="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800 text-base">奖励管理</h3>
        </router-link>

        <router-link
          to="/parent/statistics"
          class="bg-white rounded-xl p-5 shadow-sm card-hover flex flex-col items-center justify-center py-8"
        >
          <div class="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="font-medium text-gray-800 text-base">数据统计</h3>
        </router-link>
      </div>

      <!-- 家庭成员 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-16">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">家庭成员</h2>
          <div class="text-sm">
            <template v-if="inviteCode">
              <span class="text-gray-500">邀请码: </span>
              <span class="font-mono bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium">{{ inviteCode }}</span>
            </template>
            <template v-else>
              <span class="text-gray-400">暂无邀请码</span>
            </template>
          </div>
        </div>
        <div v-if="familyMembers.length === 0" class="text-center py-8 text-gray-500">
          暂无家庭成员
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="member in familyMembers"
            :key="member.id"
            class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
          >
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-bold text-lg">
                {{ member.displayName.charAt(0) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ member.displayName }}</p>
              <p class="text-sm text-gray-500">
                {{ member.role === 'child' ? '小孩' : '家长' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">最近活动</h2>
        <div class="text-center py-8 text-gray-500">
          暂无活动记录
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { familyApi, pointApi, achievementApi, appealApi } from '@/api';

const authStore = useAuthStore();

const familyMembers = ref<any[]>([]);
const pointRulesCount = ref(0);
const achievementsCount = ref(0);
const pendingAppealsCount = ref(0);
const inviteCode = ref('');
const debugInfo = ref('');

const fetchFamilyMembers = async () => {
  try {
    if (authStore.user?.familyId) {
      const response = await familyApi.getFamily(authStore.user.familyId) as any;
      debugInfo.value = JSON.stringify(response, null, 2);
      familyMembers.value = response.members || [];
      // API 返回的是 family.inviteCode（驼峰命名）
      inviteCode.value = response.family?.inviteCode || '';
    }
  } catch (error) {
    console.error('Failed to fetch family members:', error);
    debugInfo.value = 'Error: ' + String(error);
  }
};

const fetchStats = async () => {
  try {
    // 获取积分规则数量
    const rulesResponse = await pointApi.getRules() as any;
    pointRulesCount.value = rulesResponse.rules?.length || 0;

    // 获取成就数量
    const achievementsResponse = await achievementApi.getAchievements() as any;
    achievementsCount.value = achievementsResponse.achievements?.length || 0;

    // 获取待处理申诉数量
    const appealsResponse = await appealApi.getAppeals({ status: 'pending' }) as any;
    pendingAppealsCount.value = appealsResponse.appeals?.length || 0;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

onMounted(() => {
  fetchFamilyMembers();
  fetchStats();
});
</script>
