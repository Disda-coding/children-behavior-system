<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/child/dashboard" class="text-gray-600 hover:text-gray-800 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">我的成就</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 成就统计 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-3xl font-bold text-primary-600">{{ completedCount }}</p>
            <p class="text-gray-500 text-sm">已完成</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-warning-600">{{ inProgressCount }}</p>
            <p class="text-gray-500 text-sm">进行中</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-success-600">{{ totalRewardPoints }}</p>
            <p class="text-gray-500 text-sm">获得积分</p>
          </div>
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AchievementBadge
          v-for="achievement in userAchievements"
          :key="achievement.id"
          :name="achievement.achievement?.name || ''"
          :description="achievement.achievement?.description || ''"
          :current-value="achievement.progress"
          :target-value="achievement.achievement?.conditionValue || 1"
          :unit="achievement.achievement?.conditionUnit || ''"
          :is-completed="achievement.isCompleted"
          @completed="onAchievementCompleted"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="userAchievements.length === 0" class="text-center py-12">
        <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-800">暂无成就</h3>
        <p class="text-gray-500">开始完成任务来获得成就吧！</p>
      </div>
    </main>

    <!-- 成就完成弹窗 -->
    <div v-if="showCompletionModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-bounce-in">
        <div class="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">恭喜！</h2>
        <p class="text-gray-600 mb-4">你完成了成就：{{ completedAchievementName }}</p>
        <p class="text-success-600 font-bold text-lg mb-6">+{{ completedAchievementPoints }} 积分</p>
        <button
          @click="showCompletionModal = false"
          class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          太棒了！
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { achievementApi } from '@/api';
import AchievementBadge from '@/components/common/AchievementBadge.vue';

const authStore = useAuthStore();

const userAchievements = ref<any[]>([]);
const showCompletionModal = ref(false);
const completedAchievementName = ref('');
const completedAchievementPoints = ref(0);

// 计算已完成数量
const completedCount = computed(() => {
  return userAchievements.value.filter(a => a.isCompleted).length;
});

// 计算进行中数量
const inProgressCount = computed(() => {
  return userAchievements.value.filter(a => !a.isCompleted).length;
});

// 计算获得的总积分
const totalRewardPoints = computed(() => {
  return userAchievements.value
    .filter(a => a.isCompleted)
    .reduce((sum, a) => sum + (a.achievement?.rewardPoints || 0), 0);
});

const fetchUserAchievements = async () => {
  try {
    if (authStore.user?.id) {
      const response = await achievementApi.getUserAchievements(authStore.user.id) as { userAchievements: any[] };
      userAchievements.value = response.userAchievements;
    }
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  }
};

const onAchievementCompleted = () => {
  // 显示完成弹窗
  showCompletionModal.value = true;
  // 可以在这里添加音效
};

onMounted(() => {
  fetchUserAchievements();
});
</script>

<style scoped>
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
</style>
