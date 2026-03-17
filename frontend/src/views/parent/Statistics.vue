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
          <h1 class="text-xl font-bold text-gray-800">数据统计</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 时间范围选择 -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div class="flex gap-2 overflow-x-auto">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            @click="selectedRange = range.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              selectedRange === range.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- 积分统计图表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">积分变化趋势</h2>
        <PointsChart :data="chartData" :width="800" :height="300" />
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">总获得积分</p>
              <p class="text-3xl font-bold text-success-600 mt-2">{{ totalEarned }}</p>
            </div>
            <div class="bg-success-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">总扣除积分</p>
              <p class="text-3xl font-bold text-danger-600 mt-2">{{ totalDeducted }}</p>
            </div>
            <div class="bg-danger-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">兑换次数</p>
              <p class="text-3xl font-bold text-warning-600 mt-2">{{ redemptionCount }}</p>
            </div>
            <div class="bg-warning-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">成就完成率</p>
              <p class="text-3xl font-bold text-primary-600 mt-2">{{ achievementRate }}%</p>
            </div>
            <div class="bg-primary-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">积分明细</h2>
          <button
            @click="exportData"
            class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出数据
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700">日期</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700">类型</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700">原因</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-gray-700">积分</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in recentRecords"
                :key="record.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td class="py-3 px-4 text-sm text-gray-600">{{ formatDate(record.createdAt) }}</td>
                <td class="py-3 px-4">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      record.type === 'earn' ? 'bg-success-100 text-success-700' :
                      record.type === 'deduct' ? 'bg-danger-100 text-danger-700' :
                      'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ record.type === 'earn' ? '获得' : record.type === 'deduct' ? '扣除' : '兑换' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-800">{{ record.reason }}</td>
                <td class="py-3 px-4 text-sm text-right font-medium"
                  :class="record.type === 'earn' ? 'text-success-600' : 'text-danger-600'"
                >
                  {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { pointApi, statsApi, rewardApi, achievementApi } from '@/api';
import PointsChart from '@/components/common/PointsChart.vue';

const authStore = useAuthStore();

const selectedRange = ref('7');
const chartData = ref<any[]>([]);
const recentRecords = ref<any[]>([]);
const totalEarned = ref(0);
const totalDeducted = ref(0);
const redemptionCount = ref(0);
const achievementRate = ref(0);

const timeRanges = [
  { label: '最近7天', value: '7' },
  { label: '最近30天', value: '30' },
  { label: '最近90天', value: '90' },
];

const fetchStats = async () => {
  try {
    if (authStore.user?.id) {
      // 获取积分统计数据
      const response = await statsApi.getPointStats({
        userId: authStore.user.id,
        days: parseInt(selectedRange.value)
      }) as { dailyStats: Record<string, { earned: number; deducted: number }> };
      
      // 转换图表数据
      chartData.value = Object.entries(response.dailyStats).map(([date, stats]) => ({
        date,
        earned: stats.earned,
        deducted: stats.deducted
      }));

      // 计算总计
      totalEarned.value = chartData.value.reduce((sum, d) => sum + d.earned, 0);
      totalDeducted.value = chartData.value.reduce((sum, d) => sum + d.deducted, 0);

      // 获取兑换记录
      const redemptionResponse = await rewardApi.getRedemptions({
        userId: authStore.user.id
      }) as { redemptions: any[] };
      redemptionCount.value = redemptionResponse.redemptions.length;

      // 获取成就完成率
      const achievementResponse = await achievementApi.getUserAchievements(authStore.user.id) as {
        userAchievements: { isCompleted: boolean }[]
      };
      const achievements = achievementResponse.userAchievements;
      if (achievements.length > 0) {
        const completed = achievements.filter(a => a.isCompleted).length;
        achievementRate.value = Math.round((completed / achievements.length) * 100);
      }
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

const fetchRecentRecords = async () => {
  try {
    if (authStore.user?.id) {
      const response = await pointApi.getRecords({
        userId: authStore.user.id
      }) as { records: any[] };
      recentRecords.value = response.records.slice(0, 20);
    }
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const exportData = () => {
  // 导出数据为 CSV
  const csvContent = [
    ['日期', '类型', '原因', '积分'],
    ...recentRecords.value.map(r => [
      formatDate(r.createdAt),
      r.type === 'earn' ? '获得' : r.type === 'deduct' ? '扣除' : '兑换',
      r.reason,
      r.type === 'earn' ? `+${r.amount}` : `-${r.amount}`
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `积分明细_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

watch(selectedRange, () => {
  fetchStats();
});

onMounted(() => {
  fetchStats();
  fetchRecentRecords();
});
</script>