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
          <h1 class="text-xl font-bold text-gray-800">成就管理</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">成就列表</h2>
          <button
            @click="showAddModal = true"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            添加成就
          </button>
        </div>

        <div v-if="achievements.length === 0" class="text-center py-8 text-gray-500">
          暂无成就，点击上方按钮添加
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-start space-x-3">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-800">{{ achievement.name }}</h3>
                <p class="text-sm text-gray-500">{{ achievement.description }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ achievement.conditionValue }}{{ achievement.conditionUnit }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加成就弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">添加成就</h3>
        <form @submit.prevent="addAchievement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">成就名称</label>
            <input
              v-model="newAchievement.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="如：连续7天早起"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <input
              v-model="newAchievement.description"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">条件类型</label>
            <select
              v-model="newAchievement.conditionType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="consecutive">连续</option>
              <option value="count">累计次数</option>
              <option value="accumulate">累计数值</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">目标值</label>
            <input
              v-model.number="newAchievement.conditionValue"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
            <input
              v-model="newAchievement.conditionUnit"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="如：天、次、小时"
            />
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { achievementApi } from '@/api';

const authStore = useAuthStore();

const achievements = ref<any[]>([]);
const showAddModal = ref(false);

const newAchievement = ref({
  name: '',
  description: '',
  conditionType: 'consecutive' as 'consecutive' | 'count' | 'accumulate',
  conditionValue: 7,
  conditionUnit: '天',
});

const fetchAchievements = async () => {
  try {
    const response = await achievementApi.getAchievements() as any;
    achievements.value = response.achievements || [];
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  }
};

const addAchievement = async () => {
  try {
    await achievementApi.createAchievement({
      familyId: authStore.user?.familyId,
      name: newAchievement.value.name,
      description: newAchievement.value.description,
      conditionType: newAchievement.value.conditionType,
      conditionValue: newAchievement.value.conditionValue,
      conditionUnit: newAchievement.value.conditionUnit,
    });
    showAddModal.value = false;
    newAchievement.value = { name: '', description: '', conditionType: 'consecutive', conditionValue: 7, conditionUnit: '天' };
    fetchAchievements();
  } catch (error) {
    console.error('Failed to add achievement:', error);
    alert('添加成就失败');
  }
};

onMounted(() => {
  fetchAchievements();
});
</script>
