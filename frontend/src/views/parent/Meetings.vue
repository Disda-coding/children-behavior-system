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
          <h1 class="text-xl font-bold text-gray-800">会议管理</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 会议列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">会议列表</h2>
          <button
            @click="showAddModal = true"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            创建会议
          </button>
        </div>

        <div v-if="meetings.length === 0" class="text-center py-8 text-gray-500">
          暂无会议，点击上方按钮创建
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="meeting in meetings"
            :key="meeting.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-gray-800">{{ meeting.title }}</h3>
                <p class="text-sm text-gray-500">{{ meeting.description }}</p>
                <div class="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>孩子：{{ meeting.childName }}</span>
                  <span>时间：{{ formatDate(meeting.scheduledAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded',
                    meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ getStatusLabel(meeting.status) }}
                </span>
                <button
                  v-if="meeting.status === 'scheduled'"
                  @click="completeMeeting(meeting.id)"
                  class="text-sm text-green-600 hover:text-green-700"
                >
                  完成
                </button>
              </div>
            </div>
            <div v-if="meeting.score !== null" class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-sm">
                <span class="text-gray-500">评分：</span>
                <span class="font-medium text-yellow-600">{{ meeting.score }}分</span>
                <span v-if="meeting.scoreNote" class="text-gray-400 ml-2">- {{ meeting.scoreNote }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 创建会议弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">创建会议</h3>
        <form @submit.prevent="createMeeting" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">会议标题</label>
            <input
              v-model="newMeeting.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="如：本周表现总结"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              v-model="newMeeting.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="会议内容描述..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">选择孩子</label>
            <select
              v-model="newMeeting.childId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option v-for="child in children" :key="child.id" :value="child.id">
                {{ child.displayName }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">PPT链接（可选）</label>
            <input
              v-model="newMeeting.pptUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">预约时间</label>
            <input
              v-model="newMeeting.scheduledAt"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 评分弹窗 -->
    <div v-if="showScoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">会议评分</h3>
        <form @submit.prevent="submitScore" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">评分（1-10分）</label>
            <input
              v-model.number="scoreData.score"
              type="number"
              min="1"
              max="10"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">评语</label>
            <textarea
              v-model="scoreData.note"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="对孩子的表现进行评价..."
            ></textarea>
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showScoreModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              提交评分
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
import { meetingApi, familyApi } from '@/api';

const authStore = useAuthStore();

const meetings = ref<any[]>([]);
const children = ref<any[]>([]);
const showAddModal = ref(false);
const showScoreModal = ref(false);
const currentMeetingId = ref<number | null>(null);

const newMeeting = ref({
  title: '',
  description: '',
  childId: 0,
  pptUrl: '',
  scheduledAt: '',
});

const scoreData = ref({
  score: 8,
  note: '',
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: '待进行',
    completed: '已完成',
    cancelled: '已取消',
  };
  return labels[status] || status;
};

const fetchMeetings = async () => {
  try {
    const response = await meetingApi.getMeetings({
      familyId: authStore.user?.familyId
    }) as any;
    meetings.value = response.meetings || [];
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
  }
};

const fetchChildren = async () => {
  try {
    if (authStore.user?.familyId) {
      const response = await familyApi.getFamily(authStore.user.familyId) as any;
      children.value = (response.members || []).filter((m: any) => m.role === 'child');
      if (children.value.length > 0 && !newMeeting.value.childId) {
        newMeeting.value.childId = children.value[0].id;
      }
    }
  } catch (error) {
    console.error('Failed to fetch children:', error);
  }
};

const createMeeting = async () => {
  try {
    await meetingApi.createMeeting({
      familyId: authStore.user?.familyId || 0,
      childId: newMeeting.value.childId,
      title: newMeeting.value.title,
      description: newMeeting.value.description,
      pptUrl: newMeeting.value.pptUrl || undefined,
      scheduledAt: new Date(newMeeting.value.scheduledAt).toISOString(),
    });
    showAddModal.value = false;
    newMeeting.value = { title: '', description: '', childId: children.value[0]?.id || 0, pptUrl: '', scheduledAt: '' };
    fetchMeetings();
  } catch (error) {
    console.error('Failed to create meeting:', error);
    alert('创建会议失败');
  }
};

const completeMeeting = (id: number) => {
  currentMeetingId.value = id;
  showScoreModal.value = true;
};

const submitScore = async () => {
  if (!currentMeetingId.value) return;
  try {
    await meetingApi.scoreMeeting(currentMeetingId.value, {
      score: scoreData.value.score,
      scoreNote: scoreData.value.note,
    });
    showScoreModal.value = false;
    scoreData.value = { score: 8, note: '' };
    fetchMeetings();
  } catch (error) {
    console.error('Failed to submit score:', error);
    alert('提交评分失败');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchMeetings();
  fetchChildren();
});
</script>
