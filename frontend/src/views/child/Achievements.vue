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
          <h1 class="text-xl font-bold text-gray-800">我的成就</h1>
          <div class="ml-auto flex items-center space-x-2">
            <span v-if="lastUpdateTime" class="text-xs text-gray-400">
              上次更新: {{ formatTime(lastUpdateTime) }}
            </span>
            <button 
              @click="manualRefresh"
              :disabled="isUpdating"
              class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              :class="{ 'animate-spin': isUpdating }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 成就统计 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-3xl font-bold text-blue-600">{{ completedCount }}</p>
            <p class="text-gray-500 text-sm">已完成</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-yellow-600">{{ inProgressCount }}</p>
            <p class="text-gray-500 text-sm">进行中</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-green-600">{{ totalRewardPoints }}</p>
            <p class="text-gray-500 text-sm">获得积分</p>
          </div>
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="achievement in userAchievements"
          :key="achievement.id"
          :class="[
            'relative p-6 rounded-2xl transition-all achievement-card',
            achievement.isRevoked 
              ? 'bg-red-50 border-2 border-red-200 opacity-75' 
              : achievement.isCompleted 
                ? 'bg-green-50 border-2 border-green-200 completed' 
                : 'bg-white border-2 border-gray-100'
          ]"
        >
          <!-- 撤销标记 -->
          <div v-if="achievement.isRevoked" class="absolute top-4 right-4">
            <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">已撤销</span>
          </div>

          <!-- 新获得标记 -->
          <div v-if="isNewlyCompleted(achievement.id)" class="absolute top-4 right-4 z-10">
            <span class="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">NEW</span>
          </div>

          <!-- 成就图标 -->
          <div class="flex items-center justify-center mb-4">
            <div :class="[
              'w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all achievement-icon',
              achievement.isRevoked 
                ? 'bg-red-100' 
                : achievement.isCompleted 
                  ? 'bg-green-100' 
                  : 'bg-blue-100'
            ]">
              {{ achievement.achievement?.iconUrl || '🏆' }}
            </div>
          </div>

          <!-- 成就信息 -->
          <div class="text-center">
            <h3 :class="[
              'font-bold text-lg mb-2',
              achievement.isRevoked ? 'text-red-800 line-through' : 'text-gray-800'
            ]">
              {{ achievement.achievement?.name }}
            </h3>
            <p :class="[
              'text-sm mb-3',
              achievement.isRevoked ? 'text-red-600' : 'text-gray-500'
            ]">
              {{ achievement.achievement?.description }}
            </p>

            <!-- 进度条 -->
            <div v-if="!achievement.isCompleted && !achievement.isRevoked" class="mb-3">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>进度</span>
                <span>{{ achievement.progress }} / {{ achievement.achievement?.conditionValue }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all"
                  :style="{ width: `${Math.min((achievement.progress / (achievement.achievement?.conditionValue || 1)) * 100, 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- 奖励积分 -->
            <p v-if="achievement.achievement?.rewardPoints" :class="[
              'text-sm font-medium',
              achievement.isRevoked ? 'text-red-500 line-through' : 'text-green-600'
            ]">
              奖励: {{ achievement.achievement.rewardPoints }} 积分
            </p>

            <!-- 撤销原因 -->
            <div v-if="achievement.isRevoked && achievement.revokeReason" class="mt-3 p-2 bg-red-100 rounded-lg">
              <p class="text-xs text-red-700">
                <span class="font-medium">撤销原因:</span> {{ achievement.revokeReason }}
              </p>
            </div>

            <!-- 完成时间 -->
            <p v-if="achievement.isCompleted && !achievement.isRevoked" class="text-xs text-green-600 mt-2">
              完成于 {{ formatDate(achievement.completedAt) }}
            </p>
          </div>
        </div>
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

    <!-- Apple Watch 风格成就解锁动画 -->
    <AchievementUnlockAnimation
      v-if="showUnlockAnimation"
      :show="showUnlockAnimation"
      :achievement="unlockedAchievement"
      @close="closeUnlockAnimation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { achievementApi } from '@/api';
import AchievementUnlockAnimation from '@/components/common/AchievementUnlockAnimation.vue';

const authStore = useAuthStore();

const userAchievements = ref<any[]>([]);
const previousCompletedIds = ref<Set<number>>(new Set());
const newlyCompletedIds = ref<Set<number>>(new Set());
const isUpdating = ref(false);
const lastUpdateTime = ref<Date | null>(null);
const showUnlockAnimation = ref(false);
const unlockedAchievement = ref<any>(null);
const isFirstLoad = ref(true);

let pollInterval: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL = 5000; // 5秒轮询一次，更快响应

// 计算已完成数量（不包含已撤销的）
const completedCount = computed(() => {
  return userAchievements.value.filter(a => a.isCompleted && !a.isRevoked).length;
});

// 计算进行中数量
const inProgressCount = computed(() => {
  return userAchievements.value.filter(a => !a.isCompleted && !a.isRevoked).length;
});

// 计算获得的总积分（不包含已撤销的）
const totalRewardPoints = computed(() => {
  return userAchievements.value
    .filter(a => a.isCompleted && !a.isRevoked)
    .reduce((sum, a) => sum + (a.achievement?.rewardPoints || 0), 0);
});

// 检查是否是新完成的成就
const isNewlyCompleted = (id: number) => {
  return newlyCompletedIds.value.has(id);
};

const fetchUserAchievements = async (showLoading = false) => {
  if (showLoading) {
    isUpdating.value = true;
  }
  
  try {
    if (authStore.user?.id) {
      // 获取最新数据（包含已撤销的，以便完整显示）
      const response = await achievementApi.getUserAchievements(authStore.user.id, true) as { userAchievements: any[] };
      const newAchievements = response.userAchievements || [];
      
      // 首次加载，只记录已完成的成就ID，不触发动画
      if (isFirstLoad.value) {
        previousCompletedIds.value = new Set(
          newAchievements.filter(a => a.isCompleted).map(a => a.id)
        );
        isFirstLoad.value = false;
        console.log('首次加载，已记录完成成就:', previousCompletedIds.value);
      } else {
        // 非首次加载，检测新完成的成就
        const currentCompletedIds = new Set(
          newAchievements.filter(a => a.isCompleted).map(a => a.id)
        );
        
        // 找出新完成的成就（当前完成但之前未记录）
        const newCompletedIds: number[] = [];
        currentCompletedIds.forEach(id => {
          if (!previousCompletedIds.value.has(id)) {
            newCompletedIds.push(id);
          }
        });
        
        console.log('检测到新完成成就:', newCompletedIds);
        
        if (newCompletedIds.length > 0) {
          // 获取新成就的详细信息
          const newAchievementsList = newAchievements.filter(a => newCompletedIds.includes(a.id));
          
          // 显示第一个新成就的动画
          const firstNewAchievement = newAchievementsList[0];
          if (firstNewAchievement) {
            console.log('显示动画:', firstNewAchievement.achievement?.name);
            showAchievementUnlock(firstNewAchievement);
            
            // 添加到新完成列表（用于显示NEW标记）
            newCompletedIds.forEach(id => newlyCompletedIds.value.add(id));
            
            // 5秒后清除NEW标记
            setTimeout(() => {
              newCompletedIds.forEach(id => newlyCompletedIds.value.delete(id));
            }, 5000);
          }
          
          // 更新已记录的完成成就ID
          previousCompletedIds.value = currentCompletedIds;
        }
      }
      
      userAchievements.value = newAchievements;
      lastUpdateTime.value = new Date();
    }
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  } finally {
    if (showLoading) {
      isUpdating.value = false;
    }
  }
};

// 显示成就解锁动画
const showAchievementUnlock = (achievement: any) => {
  console.log('准备显示动画:', achievement);
  unlockedAchievement.value = {
    id: achievement.id,
    name: achievement.achievement?.name || '未知成就',
    description: achievement.achievement?.description || '',
    iconUrl: achievement.achievement?.iconUrl || '🏆',
    rewardPoints: achievement.achievement?.rewardPoints || 0,
  };
  showUnlockAnimation.value = true;
  console.log('动画已显示:', showUnlockAnimation.value);
};

// 关闭成就解锁动画
const closeUnlockAnimation = () => {
  console.log('关闭动画');
  showUnlockAnimation.value = false;
  unlockedAchievement.value = null;
};

// 手动刷新
const manualRefresh = async () => {
  await fetchUserAchievements(true);
};

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 开始轮询
const startPolling = () => {
  // 立即执行一次
  fetchUserAchievements();
  
  // 设置定时轮询
  pollInterval = setInterval(() => {
    fetchUserAchievements();
  }, POLL_INTERVAL);
};

// 停止轮询
const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
/* 新成就标记动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* 成就卡片悬停效果 */
.achievement-card.completed {
  animation: achievement-glow 2s ease-in-out infinite;
}

.achievement-card.completed .achievement-icon {
  animation: icon-pop 0.5s ease-out;
}

@keyframes achievement-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(34, 197, 94, 0.3);
  }
}

@keyframes icon-pop {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
