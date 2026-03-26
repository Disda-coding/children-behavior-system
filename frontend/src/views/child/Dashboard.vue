<template>
  <div class="app-shell min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
    <!-- 导航栏 -->
    <nav class="app-nav bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/child/dashboard" class="text-gray-600 hover:text-gray-800 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </router-link>
            <h1 class="text-xl font-bold text-gray-800">我的成长</h1>
          </div>
          <div class="flex items-center space-x-3">
            <!-- 通知中心 -->
            <NotificationCenter />
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

    <!-- 主内容区域 -->
    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 欢迎区域 -->
      <div class="hero-section mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">你好，{{ authStore.user?.displayName }}！</h2>
        <p class="text-gray-600">继续努力，获得更多积分和成就吧！</p>
      </div>

      <!-- 积分卡片 -->
      <div class="page-section">
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm mb-2">我的积分</p>
              <div class="flex items-baseline gap-2">
                <FlipNumber :value="points" class="text-5xl font-bold" />
                <span class="text-green-100 text-lg">分</span>
              </div>
            </div>
            <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-2 gap-4">
            <div class="bg-white/10 rounded-xl p-4">
              <p class="text-green-100 text-xs mb-1">今日获得</p>
              <p class="text-2xl font-bold">+{{ todayPoints }}</p>
            </div>
            <div class="bg-white/10 rounded-xl p-4">
              <p class="text-green-100 text-xs mb-1">本周获得</p>
              <p class="text-2xl font-bold">+{{ weekPoints }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🏆</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ achievements }}</div>
          <div class="text-sm text-gray-500 mt-1">已获成就</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🎁</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ rewards }}</div>
          <div class="text-sm text-gray-500 mt-1">已兑换奖励</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📅</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ meetings }}</div>
          <div class="text-sm text-gray-500 mt-1">会议次数</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">⭐</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800">{{ avgScore }}</div>
          <div class="text-sm text-gray-500 mt-1">会议平均分</div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="page-section">
        <h3 class="section-title mb-6">快捷入口</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
          <router-link
            to="/child/achievements"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">🏆</span>
            </div>
            <h3 class="font-medium text-gray-800 text-base">我的成就</h3>
          </router-link>

          <router-link
            to="/child/rewards"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">🎁</span>
            </div>
            <h3 class="font-medium text-gray-800 text-base">兑换奖励</h3>
          </router-link>

          <router-link
            to="/child/meetings"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">📅</span>
            </div>
            <h3 class="font-medium text-gray-800 text-base">家庭会议</h3>
          </router-link>

          <router-link
            to="/child/appeals"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">📝</span>
            </div>
            <h3 class="font-medium text-gray-800 text-base">申诉中心</h3>
          </router-link>

          <router-link
            to="/child/records"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col items-center justify-center"
          >
            <div class="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">📊</span>
            </div>
            <h3 class="font-medium text-gray-800 text-base">积分记录</h3>
          </router-link>
        </div>
      </div>

      <!-- 最近动态 -->
      <div class="page-section">
        <h3 class="section-title mb-6">最近动态</h3>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div v-if="recentRecords.length === 0" class="text-center py-12 text-gray-500">
            暂无记录
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="record.type === 'earn' ? 'bg-green-100' : 'bg-red-100'"
                >
                  <span v-if="record.type === 'earn'">💰</span>
                  <span v-else>💸</span>
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ record.reason }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(record.createdAt) }}</p>
                </div>
              </div>
              <span
                :class="[
                  'text-lg font-bold',
                  record.type === 'earn' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 成就解锁动画 -->
    <AchievementUnlockAnimation
      :achievements="unlockedAchievements"
      @close="unlockedAchievements = []"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { pointApi, achievementApi, rewardApi, meetingApi } from '@/api';
import FlipNumber from '@/components/common/FlipNumber.vue';
import NotificationCenter from '@/components/common/NotificationCenter.vue';
import AchievementUnlockAnimation from '@/components/common/AchievementUnlockAnimation.vue';

const authStore = useAuthStore();

const points = ref(0);
const todayPoints = ref(0);
const weekPoints = ref(0);
const achievements = ref(0);
const rewards = ref(0);
const meetings = ref(0);
const avgScore = ref<string | number>(0);
const recentRecords = ref<any[]>([]);
const unlockedAchievements = ref<any[]>([]);
const previousAchievements = ref<Set<number>>(new Set());

let pollInterval: number | null = null;
let isFirstLoad = true;

const fetchPoints = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const statsRes = await pointApi.getStats({ userId }) as any;
    points.value = statsRes.balance || 0;
    todayPoints.value = statsRes.todayEarned || 0;
    weekPoints.value = statsRes.weekEarned || 0;

    const recordsRes = await pointApi.getRecords({ userId }) as any;
    recentRecords.value = (recordsRes.records || []).slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch points:', error);
  }
};

const fetchAchievements = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const res = await achievementApi.getUserAchievements(userId, true) as any;
    const userAchievements = res.userAchievements || [];
    achievements.value = userAchievements.filter((a: any) => !a.isRevoked).length;

    if (!isFirstLoad) {
      const currentIds = new Set<number>(userAchievements.map((a: any) => a.achievementId));
      const newUnlocked = userAchievements.filter(
        (a: any) => !previousAchievements.value.has(a.achievementId) && !a.isRevoked
      );
      if (newUnlocked.length > 0) {
        unlockedAchievements.value = newUnlocked.map((a: any) => ({
          name: a.achievement?.name || '成就',
          icon: a.achievement?.iconUrl || '🏆',
          points: a.achievement?.rewardPoints || 0,
        }));
      }
      previousAchievements.value = currentIds;
    } else {
      previousAchievements.value = new Set<number>(userAchievements.map((a: any) => a.achievementId));
      isFirstLoad = false;
    }
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  }
};

const fetchRewards = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const res = await rewardApi.getRedemptions({ userId }) as any;
    rewards.value = (res.redemptions || []).filter(
      (r: any) => r.status === 'approved' || r.status === 'completed'
    ).length;
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
  }
};

const fetchMeetings = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const res = await meetingApi.getMeetings({ childId: userId }) as any;
    const meetingList = res.data || res.meetings || [];
    meetings.value = meetingList.length;

    const scoredMeetings = meetingList.filter((m: any) => m.score);
    if (scoredMeetings.length > 0) {
      const totalScore = scoredMeetings.reduce((sum: number, m: any) => sum + m.score, 0);
      avgScore.value = (totalScore / scoredMeetings.length).toFixed(1);
    }
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const startPolling = () => {
  pollInterval = window.setInterval(() => {
    fetchPoints();
    fetchAchievements();
  }, 5000);
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

onMounted(() => {
  fetchPoints();
  fetchAchievements();
  fetchRewards();
  fetchMeetings();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>
