<template>
  <div class="app-shell min-h-screen bg-gray-50">
    <nav class="app-nav bg-white shadow-sm">
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

    <main class="app-main max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <!-- 快速添加常用成就 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">快速添加常用成就</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            v-for="template in achievementTemplates"
            :key="template.name"
            @click="quickAddAchievement(template)"
            class="p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 border border-transparent transition-all text-center"
          >
            <div class="text-2xl mb-2">{{ template.icon }}</div>
            <p class="text-sm font-medium text-gray-800">{{ template.name }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ template.conditionValue }}{{ template.conditionUnit }}</p>
          </button>
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">成就列表</h2>
          <button
            @click="showAddModal = true"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            添加自定义成就
          </button>
        </div>

        <div v-if="achievements.length === 0" class="text-center py-8 text-gray-500">
          暂无成就，点击上方按钮添加或使用快速添加
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-start space-x-3">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">{{ achievement.iconUrl || '🏆' }}</span>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-800">{{ achievement.name }}</h3>
                <p class="text-sm text-gray-500">{{ achievement.description }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ achievement.conditionValue }}{{ achievement.conditionUnit }}
                </p>
                <p v-if="achievement.rewardPoints" class="text-xs text-green-600 mt-1">
                  奖励: {{ achievement.rewardPoints }} 积分
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
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">已赋予成就</h2>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">显示已撤销:</span>
            <button
              @click="showRevoked = !showRevoked"
              :class="[
                'w-12 h-6 rounded-full transition-colors relative',
                showRevoked ? 'bg-green-500' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  showRevoked ? 'translate-x-7' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
        
        <div v-if="assignedAchievements.length === 0" class="text-center py-8 text-gray-500">
          暂无已赋予的成就
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="record in filteredAssignedAchievements"
            :key="record.id"
            :class="[
              'flex items-center justify-between p-4 rounded-xl transition-all',
              record.isRevoked ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                record.isRevoked ? 'bg-red-100' : 'bg-yellow-100'
              ]">
                <span class="text-xl">{{ record.achievement?.iconUrl || '🏆' }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">
                  {{ record.achievement?.name }}
                  <span v-if="record.isRevoked" class="ml-2 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">已撤销</span>
                </p>
                <p class="text-sm text-gray-500">
                  {{ record.displayName }} · {{ formatDate(record.completedAt) }}
                </p>
                <p v-if="record.achievement?.rewardPoints" class="text-xs text-green-600">
                  奖励: {{ record.achievement.rewardPoints }} 积分
                </p>
                <p v-if="record.isRevoked && record.revokeReason" class="text-xs text-red-500 mt-1">
                  撤销原因: {{ record.revokeReason }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span v-if="!record.isRevoked" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">已完成</span>
              <span v-else class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">已撤销</span>
              
              <!-- 撤销/恢复按钮 -->
              <button
                v-if="!record.isRevoked"
                @click="openRevokeModal(record)"
                class="text-red-600 hover:text-red-700 text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
              >
                撤销
              </button>
              <button
                v-else
                @click="restoreAchievement(record)"
                class="text-green-600 hover:text-green-700 text-sm px-3 py-1 rounded hover:bg-green-50 transition-colors"
              >
                恢复
              </button>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">图标</label>
            <div class="grid grid-cols-8 gap-2">
              <button
                v-for="icon in commonIcons"
                :key="icon"
                type="button"
                @click="newAchievement.iconUrl = icon"
                :class="[
                  'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors',
                  newAchievement.iconUrl === icon ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50 hover:bg-gray-100'
                ]"
              >
                {{ icon }}
              </button>
            </div>
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">奖励积分</label>
            <input
              v-model.number="newAchievement.rewardPoints"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="完成成就后奖励的积分"
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

    <!-- 撤销成就弹窗 -->
    <div v-if="showRevokeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">撤销成就</h3>
        <p class="text-sm text-gray-600 mb-4">
          确定要撤销成就 "{{ selectedRecord?.achievement?.name }}" 吗？
        </p>
        <p v-if="selectedRecord?.achievement?.rewardPoints" class="text-sm text-red-600 mb-4">
          警告：此成就包含 {{ selectedRecord.achievement.rewardPoints }} 积分奖励，撤销后将扣除相应积分
        </p>
        <form @submit.prevent="confirmRevokeAchievement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">撤销原因（可选）</label>
            <textarea
              v-model="revokeForm.reason"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="请输入撤销原因..."
            ></textarea>
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showRevokeModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              确认撤销
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { achievementApi, familyApi } from '@/api';

const authStore = useAuthStore();

const achievements = ref<any[]>([]);
const assignedAchievements = ref<any[]>([]);
const children = ref<any[]>([]);
const showAddModal = ref(false);
const showAssignModal = ref(false);
const showRevokeModal = ref(false);
const showRevoked = ref(false);
const selectedAchievement = ref<any>(null);
const selectedRecord = ref<any>(null);

const commonIcons = ['🏆', '🥇', '🥈', '🥉', '⭐', '💫', '🌟', '✨', '🎯', '🎖️', '🏅', '🌈', '🔥', '💪', '📚'];

const achievementTemplates = [
  { name: '早起达人', icon: '🌅', description: '连续早起不赖床', conditionType: 'consecutive', conditionValue: 7, conditionUnit: '天' },
  { name: '作业之星', icon: '⭐', description: '按时完成所有作业', conditionType: 'consecutive', conditionValue: 5, conditionUnit: '天' },
  { name: '阅读小能手', icon: '📚', description: '累计阅读时长', conditionType: 'accumulate', conditionValue: 10, conditionUnit: '小时' },
  { name: '运动健将', icon: '⚽', description: '累计运动次数', conditionType: 'count', conditionValue: 20, conditionUnit: '次' },
  { name: '整理大师', icon: '🧹', description: '保持房间整洁', conditionType: 'consecutive', conditionValue: 7, conditionUnit: '天' },
  { name: '礼貌之星', icon: '🌟', description: '主动问好、说谢谢', conditionType: 'count', conditionValue: 30, conditionUnit: '次' },
  { name: '节约小卫士', icon: '💧', description: '节约用水用电', conditionType: 'consecutive', conditionValue: 14, conditionUnit: '天' },
  { name: '助人之星', icon: '🤝', description: '帮助他人次数', conditionType: 'count', conditionValue: 10, conditionUnit: '次' },
  { name: '专注小达人', icon: '🎯', description: '专注学习时长', conditionType: 'accumulate', conditionValue: 20, conditionUnit: '小时' },
  { name: '创意之星', icon: '🎨', description: '完成创意作品', conditionType: 'count', conditionValue: 5, conditionUnit: '件' },
  { name: '音乐小天才', icon: '🎵', description: '练习乐器时长', conditionType: 'accumulate', conditionValue: 15, conditionUnit: '小时' },
  { name: '环保卫士', icon: '🌱', description: '参与环保活动', conditionType: 'count', conditionValue: 5, conditionUnit: '次' },
];

const newAchievement = ref({
  name: '',
  description: '',
  iconUrl: '🏆',
  conditionType: 'consecutive' as 'consecutive' | 'count' | 'accumulate',
  conditionValue: 7,
  conditionUnit: '天',
  rewardPoints: 0,
});

const assignForm = ref({
  userId: 0,
  note: '',
});

const revokeForm = ref({
  reason: '',
});

const filteredAssignedAchievements = computed(() => {
  if (showRevoked.value) {
    return assignedAchievements.value;
  }
  return assignedAchievements.value.filter(a => !a.isRevoked);
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
    const allAssigned: any[] = [];
    for (const child of children.value) {
      const response = await achievementApi.getUserAchievements(child.id, true) as any;
      const userAchievements = response.userAchievements || [];
      for (const ua of userAchievements) {
        allAssigned.push({
          ...ua,
          displayName: child.displayName,
          childId: child.id,
        });
      }
    }
    assignedAchievements.value = allAssigned;
  } catch (error) {
    console.error('Failed to fetch assigned achievements:', error);
  }
};

const quickAddAchievement = async (template: any) => {
  try {
    await achievementApi.createAchievement({
      familyId: authStore.user?.familyId,
      name: template.name,
      description: template.description,
      conditionType: template.conditionType,
      conditionValue: template.conditionValue,
      conditionUnit: template.conditionUnit,
      iconUrl: template.icon,
      rewardPoints: 0,
    });
    fetchAchievements();
    alert(`已添加成就：${template.name}`);
  } catch (error) {
    console.error('Failed to add achievement:', error);
    alert('添加成就失败');
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
      iconUrl: newAchievement.value.iconUrl,
      rewardPoints: newAchievement.value.rewardPoints,
    });
    showAddModal.value = false;
    newAchievement.value = { name: '', description: '', iconUrl: '🏆', conditionType: 'consecutive', conditionValue: 7, conditionUnit: '天', rewardPoints: 0 };
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

const openRevokeModal = (record: any) => {
  selectedRecord.value = record;
  revokeForm.value = { reason: '' };
  showRevokeModal.value = true;
};

const confirmRevokeAchievement = async () => {
  if (!selectedRecord.value) return;
  try {
    await achievementApi.revokeAchievement(selectedRecord.value.id, {
      revokedBy: authStore.user?.id || 0,
      reason: revokeForm.value.reason,
    });
    showRevokeModal.value = false;
    fetchAssignedAchievements();
    alert('成就已撤销，相应积分已扣除');
  } catch (error) {
    console.error('Failed to revoke achievement:', error);
    alert('撤销成就失败');
  }
};

const restoreAchievement = async (record: any) => {
  if (!confirm(`确定要恢复成就 "${record.achievement?.name}" 吗？`)) {
    return;
  }
  try {
    await achievementApi.restoreAchievement(record.id, {
      restoredBy: authStore.user?.id || 0,
    });
    fetchAssignedAchievements();
    alert('成就已恢复，相应积分已返还');
  } catch (error) {
    console.error('Failed to restore achievement:', error);
    alert('恢复成就失败');
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
