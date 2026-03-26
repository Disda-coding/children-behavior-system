<template>
  <div class="app-shell min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- 导航栏 -->
    <nav class="app-nav bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/parent/dashboard" class="text-gray-600 hover:text-gray-800 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </router-link>
            <h1 class="text-xl font-bold text-gray-800">家长控制台</h1>
          </div>
          <div class="flex items-center space-x-3">
            <!-- 通知中心 -->
            <NotificationCenter />
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

    <!-- 主内容区域 -->
    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 欢迎区域 -->
      <div class="hero-section mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">欢迎回来，{{ authStore.user?.displayName }}！</h2>
        <p class="text-gray-600">管理孩子的行为记录、积分和奖励</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ stats.totalPoints }}</div>
          <div class="text-sm text-gray-500 mt-1">家庭总积分</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ stats.todayRecords }}</div>
          <div class="text-sm text-gray-500 mt-1">今日记录</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ stats.achievements }}</div>
          <div class="text-sm text-gray-500 mt-1">已获成就</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ stats.children }}</div>
          <div class="text-sm text-gray-500 mt-1">家庭成员</div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="page-section">
        <h3 class="section-title mb-6">快捷入口</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <router-link
            to="/parent/points"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
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
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
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
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 class="font-medium text-gray-800 text-base">奖励管理</h3>
          </router-link>

          <router-link
            to="/parent/meetings"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-medium text-gray-800 text-base">会议管理</h3>
          </router-link>

          <router-link
            to="/parent/appeals"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="font-medium text-gray-800 text-base">申诉处理</h3>
          </router-link>

          <router-link
            to="/parent/statistics"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="font-medium text-gray-800 text-base">数据统计</h3>
          </router-link>

          <router-link
            to="/parent/logs"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-slate-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 class="font-medium text-gray-800 text-base">系统日志</h3>
          </router-link>

          <router-link
            to="/parent/backups"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 class="font-medium text-gray-800 text-base">数据备份</h3>
          </router-link>
        </div>
      </div>

      <!-- 家庭成员 -->
      <div class="page-section">
        <h3 class="section-title mb-6">家庭成员</h3>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div v-if="members.length === 0" class="text-center py-12 text-gray-500">
            暂无家庭成员
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="member in members"
              :key="member.id"
              class="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  :class="member.role === 'parent' ? 'bg-blue-500' : 'bg-green-500'"
                >
                  {{ member.displayName?.charAt(0) || '?' }}
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ member.displayName }}</p>
                  <p class="text-sm text-gray-500">
                    {{ member.role === 'parent' ? '家长' : '孩子' }}
                    <span v-if="member.role === 'child' && member.points !== undefined" class="ml-2">
                      · 积分: {{ member.points }}
                    </span>
                  </p>
                </div>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  member.role === 'parent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                ]"
              >
                {{ member.role === 'parent' ? '家长' : '孩子' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 邀请码 -->
      <div class="page-section">
        <h3 class="section-title mb-6">邀请码</h3>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-2">分享邀请码给孩子加入家庭</p>
              <p class="text-2xl font-bold text-blue-600 font-mono tracking-wider">{{ inviteCode }}</p>
            </div>
            <button
              @click="refreshInviteCode"
              class="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              刷新邀请码
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { familyApi, pointApi, achievementApi, appealApi } from '@/api';
import NotificationCenter from '@/components/common/NotificationCenter.vue';

const authStore = useAuthStore();

const stats = ref({
  totalPoints: 0,
  todayRecords: 0,
  achievements: 0,
  children: 0,
});

const members = ref<any[]>([]);
const inviteCode = ref('');

const fetchFamilyData = async () => {
  try {
    const familyId = authStore.user?.familyId;
    if (!familyId) return;

    const familyRes = await familyApi.getFamily(familyId) as any;
    members.value = familyRes.members || [];
    inviteCode.value = familyRes.inviteCode || '';

    stats.value.children = members.value.filter(m => m.role === 'child').length;

    let totalPoints = 0;
    for (const member of members.value) {
      if (member.role === 'child') {
        try {
          const pointsRes = await pointApi.getPointStats(member.id) as any;
          totalPoints += pointsRes.balance || 0;
          member.points = pointsRes.balance || 0;
        } catch (e) {
          console.error('Failed to fetch points for member:', member.id);
        }
      }
    }
    stats.value.totalPoints = totalPoints;

    const today = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    for (const member of members.value) {
      if (member.role === 'child') {
        try {
          const recordsRes = await pointApi.getPointRecords(member.id) as any;
          todayCount += (recordsRes.records || []).filter((r: any) => 
            r.createdAt?.startsWith(today)
          ).length;
        } catch (e) {
          console.error('Failed to fetch records for member:', member.id);
        }
      }
    }
    stats.value.todayRecords = todayCount;

    try {
      const achievementsRes = await achievementApi.getAllUserAchievements(familyId) as any;
      stats.value.achievements = (achievementsRes.userAchievements || []).filter(
        (a: any) => !a.isRevoked
      ).length;
    } catch (e) {
      console.error('Failed to fetch achievements');
    }
  } catch (error) {
    console.error('Failed to fetch family data:', error);
  }
};

const refreshInviteCode = async () => {
  try {
    const familyId = authStore.user?.familyId;
    if (!familyId) return;

    const res = await familyApi.refreshInviteCode(familyId) as any;
    inviteCode.value = res.inviteCode;
    alert('邀请码已刷新！');
  } catch (error) {
    console.error('Failed to refresh invite code:', error);
    alert('刷新失败');
  }
};

onMounted(() => {
  fetchFamilyData();
});
</script>
