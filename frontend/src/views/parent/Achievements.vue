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

    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <!-- 成就列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
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

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <button
                  @click="openAssignModal(achievement)"
                  class="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  赋予孩子
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已赋予成就记录 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-6">已赋予成就</h2>
        <div v-if="assignedAchievements.length === 0" class="text-center py-8 text-gray-500">
          暂无已赋予的成就
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="record in assignedAchievements"
            :key="record.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ record.achievement?.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ record.displayName }} · {{ formatDate(record.completedAt) }}
                </p>
              </div>
            </div>
            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">已完成</span>
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

    <!-- 赋予成就弹窗 -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">赋予成就</h3>
        <p class="text-sm text-gray-600 mb-4">
          将成就 "{{ selectedAchievement?.name }}" 赋予孩子
        </p>
        <form @submit.prevent="assignAchievement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">选择孩子</label>
            <select
              v-model="assignForm.userId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option v-for="child in children" :key="child.id" :value="child.id">
                {{ child.displayName }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
            <input
              v-model="assignForm.note"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="如：表现优秀，提前完成目标"
            />
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showAssignModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              确认赋予
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
import { achievementApi, familyApi } from '@/api';

const authStore = useAuthStore();

const achievements = ref<any[]>([]);
const assignedAchievements = ref<any[]>([]);
const children = ref<any[]>([]);
const showAddModal = ref(false);
const showAssignModal = ref(false);
const selectedAchievement = ref<any>(null);

const newAchievement = ref({
  name: '',
  description: '',
  conditionType: 'consecutive' as 'consecutive' | 'count' | 'accumulate',
  conditionValue: 7,
  conditionUnit: '天',
});

const assignForm = ref({
  userId: 0,
  note: '',
});

const fetchAchievements = async () => {
  try {
    const response = await achievementApi.getAchievements({ familyId: authStore.user?.familyId }) as any;
    achievements.value = response.achievements || [];
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  }
};

const fetchChildren = async () => {
  try {
    if (authStore.user?.familyId) {
      const response = await familyApi.getFamily(authStore.user.familyId) as any;
      children.value = (response.members || []).filter((m: any) => m.role === 'child');
    }
  } catch (error) {
    console.error('Failed to fetch children:', error);
  }
};

const fetchAssignedAchievements = async () => {
  try {
    // 获取所有孩子的成就
    const allAssigned: any[] = [];
    for (const child of children.value) {
      const response = await achievementApi.getUserAchievements(child.id) as any;
      const userAchievements = response.userAchievements || [];
      for (const ua of userAchievements) {
        allAssigned.push({
          ...ua,
          displayName: child.displayName,
        });
      }
    }
    assignedAchievements.value = allAssigned;
  } catch (error) {
    console.error('Failed to fetch assigned achievements:', error);
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

const openAssignModal = (achievement: any) => {
  selectedAchievement.value = achievement;
  assignForm.value = { userId: children.value[0]?.id || 0, note: '' };
  showAssignModal.value = true;
};

const assignAchievement = async () => {
  if (!selectedAchievement.value) return;
  try {
    await achievementApi.assignAchievement(selectedAchievement.value.id, {
      userId: assignForm.value.userId,
      note: assignForm.value.note,
    });
    showAssignModal.value = false;
    fetchAssignedAchievements();
    alert('成就赋予成功！');
  } catch (error) {
    console.error('Failed to assign achievement:', error);
    alert('赋予成就失败，可能该孩子已获得此成就');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchAchievements();
  fetchChildren().then(() => {
    fetchAssignedAchievements();
  });
});
</script>
