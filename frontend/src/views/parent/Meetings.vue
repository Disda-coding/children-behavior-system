<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">📅</span>
          会议管理
        </h1>
        <p class="text-slate-600 mt-2">管理家庭会议，查看孩子的会议申请和PPT演示</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
          <div class="text-sm text-slate-500 mt-1">总会议数</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</div>
          <div class="text-sm text-slate-500 mt-1">待安排</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-green-600">{{ stats.scheduled }}</div>
          <div class="text-sm text-slate-500 mt-1">已安排</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-purple-600">{{ stats.completed }}</div>
          <div class="text-sm text-slate-500 mt-1">已完成</div>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">状态:</span>
            <select v-model="filterStatus" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部</option>
              <option value="pending">待安排</option>
              <option value="scheduled">已安排</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">孩子:</span>
            <select v-model="filterChild" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部</option>
              <option v-for="child in children" :key="child.id" :value="child.id">{{ child.displayName }}</option>
            </select>
          </div>
          <button @click="refreshData" class="ml-auto px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
            <span>🔄</span>
            刷新
          </button>
        </div>
      </div>

      <!-- 会议列表 -->
      <div class="space-y-4">
        <div v-for="meeting in filteredMeetings" :key="meeting.id" 
          class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="flex flex-col lg:flex-row lg:items-start gap-6">
            <!-- 左侧：会议信息 -->
            <div class="flex-1">
              <div class="flex items-start gap-4">
                <!-- 孩子头像 -->
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {{ meeting.childName?.[0] || '?' }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 flex-wrap">
                    <h3 class="text-lg font-bold text-slate-800">{{ meeting.title }}</h3>
                    <span :class="getStatusClass(meeting.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ getStatusText(meeting.status) }}
                    </span>
                  </div>
                  <p class="text-slate-600 mt-2">{{ meeting.description || '暂无描述' }}</p>
                  <div class="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span class="flex items-center gap-1">
                      <span>👤</span>
                      {{ meeting.childName }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span>📅</span>
                      {{ formatDate(meeting.createdAt) }}
                    </span>
                    <span v-if="meeting.scheduledAt" class="flex items-center gap-1 text-blue-600">
                      <span>⏰</span>
                      安排于 {{ formatDateTime(meeting.scheduledAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：操作按钮 -->
            <div class="flex flex-wrap gap-2 lg:flex-col lg:items-end">
              <!-- 待安排状态 -->
              <template v-if="meeting.status === 'pending'">
                <button @click="openScheduleModal(meeting)" 
                  class="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <span>📅</span>
                  安排时间
                </button>
                <button @click="cancelMeeting(meeting)" 
                  class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition-colors">
                  取消
                </button>
              </template>

              <!-- 已安排状态 -->
              <template v-if="meeting.status === 'scheduled'">
                <button @click="openScoreModal(meeting)" 
                  class="px-4 py-2 bg-green-500 text-white rounded-xl text-sm hover:bg-green-600 transition-colors flex items-center gap-2">
                  <span>⭐</span>
                  评分
                </button>
                <button @click="cancelMeeting(meeting)" 
                  class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition-colors">
                  取消
                </button>
              </template>

              <!-- 已完成状态 -->
              <template v-if="meeting.status === 'completed'">
                <div class="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <span class="text-yellow-500 text-lg">
                    {{ '⭐'.repeat(meeting.score || 0) }}
                  </span>
                  <span class="text-yellow-700 font-medium">{{ meeting.score }}分</span>
                </div>
                <button v-if="meeting.scoreNote" @click="showScoreNote(meeting)" 
                  class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition-colors">
                  查看评语
                </button>
              </template>

              <!-- 已取消状态 -->
              <template v-if="meeting.status === 'cancelled'">
                <span class="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm">
                  已取消
                </span>
              </template>

              <!-- 查看PPT按钮 -->
              <button v-if="meeting.pptUrl" @click="viewPPT(meeting)" 
                class="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl text-sm hover:bg-indigo-200 transition-colors flex items-center gap-2">
                <span>📊</span>
                查看PPT
              </button>

              <!-- 删除按钮 -->
              <button v-if="meeting.status === 'cancelled' || meeting.status === 'completed'" 
                @click="deleteMeeting(meeting)" 
                class="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm hover:bg-red-100 transition-colors">
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredMeetings.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">📅</div>
          <h3 class="text-xl font-bold text-slate-700 mb-2">暂无会议</h3>
          <p class="text-slate-500">当前筛选条件下没有会议记录</p>
        </div>
      </div>
    </div>

    <!-- 安排会议弹窗 -->
    <Teleport to="body">
      <div v-if="showScheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-md">
          <h3 class="text-xl font-bold text-slate-800 mb-4">安排会议时间</h3>
          <p class="text-slate-600 mb-4">{{ currentMeeting?.title }}</p>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-2">选择日期时间</label>
            <input v-model="scheduleForm.scheduledAt" type="datetime-local" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div class="flex gap-3">
            <button @click="showScheduleModal = false" 
              class="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              取消
            </button>
            <button @click="submitSchedule" 
              class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
              确认安排
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 评分弹窗 -->
    <Teleport to="body">
      <div v-if="showScoreModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-md">
          <h3 class="text-xl font-bold text-slate-800 mb-4">会议评分</h3>
          <p class="text-slate-600 mb-4">{{ currentMeeting?.title }}</p>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-3">评分 (1-5星)</label>
            <div class="flex gap-2 justify-center">
              <button v-for="star in 5" :key="star" @click="scoreForm.score = star"
                class="text-4xl transition-transform hover:scale-110"
                :class="star <= scoreForm.score ? 'text-yellow-400' : 'text-slate-200'">
                ⭐
              </button>
            </div>
            <p class="text-center text-sm text-slate-500 mt-2">
              {{ scoreForm.score === 5 ? '完美表现！奖励50积分' : scoreForm.score === 4 ? '表现优秀！奖励30积分' : scoreForm.score >= 1 ? '继续加油！' : '请选择评分' }}
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-2">评语（可选）</label>
            <textarea v-model="scoreForm.scoreNote" rows="3" placeholder="写下对孩子的评价和建议..."
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>

          <div class="flex gap-3">
            <button @click="showScoreModal = false" 
              class="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              取消
            </button>
            <button @click="submitScore" :disabled="!scoreForm.score"
              class="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              提交评分
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 查看评语弹窗 -->
    <Teleport to="body">
      <div v-if="showNoteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-md">
          <h3 class="text-xl font-bold text-slate-800 mb-4">会议评语</h3>
          <div class="flex items-center gap-2 mb-4">
            <span class="text-yellow-500 text-lg">{{ '⭐'.repeat(currentMeeting?.score || 0) }}</span>
            <span class="text-yellow-700 font-medium">{{ currentMeeting?.score }}分</span>
          </div>
          <div class="bg-slate-50 rounded-xl p-4 mb-4">
            <p class="text-slate-700 whitespace-pre-wrap">{{ currentMeeting?.scoreNote || '暂无评语' }}</p>
          </div>
          <button @click="showNoteModal = false" 
            class="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
            关闭
          </button>
        </div>
      </div>
    </Teleport>

    <!-- 查看PPT弹窗 -->
    <Teleport to="body">
      <div v-if="showPPTModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-slate-800">PPT演示文稿</h3>
            <button @click="showPPTModal = false" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
              ✕
            </button>
          </div>
          <div class="bg-slate-100 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <div class="text-center">
              <div class="text-6xl mb-4">📊</div>
              <p class="text-slate-600 mb-4">PPT文件: {{ currentMeeting?.pptUrl?.split('/').pop() }}</p>
              <a :href="currentMeeting?.pptUrl" target="_blank" 
                class="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
                <span>📥</span>
                下载查看
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { meetingApi } from '../../api';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// 状态
const meetings = ref<any[]>([]);
const stats = ref({
  total: 0,
  pending: 0,
  scheduled: 0,
  completed: 0,
  cancelled: 0,
});
const children = ref<any[]>([]);
const filterStatus = ref('');
const filterChild = ref('');

// 弹窗状态
const showScheduleModal = ref(false);
const showScoreModal = ref(false);
const showNoteModal = ref(false);
const showPPTModal = ref(false);
const currentMeeting = ref<any>(null);

// 表单
const scheduleForm = ref({
  scheduledAt: '',
});
const scoreForm = ref({
  score: 0,
  scoreNote: '',
});

// 计算属性
const filteredMeetings = computed(() => {
  let result = meetings.value;
  if (filterStatus.value) {
    result = result.filter(m => m.status === filterStatus.value);
  }
  if (filterChild.value) {
    result = result.filter(m => m.childId === parseInt(filterChild.value));
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// 获取会议列表
const fetchMeetings = async () => {
  try {
    const familyId = authStore.user?.familyId;
    if (!familyId) return;
    
    const res = await meetingApi.getMeetings({ familyId });
    if (res.success) {
      meetings.value = res.data || [];
      
      // 提取孩子列表
      const childMap = new Map();
      meetings.value.forEach(m => {
        if (m.childId && !childMap.has(m.childId)) {
          childMap.set(m.childId, { id: m.childId, displayName: m.childName });
        }
      });
      children.value = Array.from(childMap.values());
    }
  } catch (error) {
    console.error('获取会议列表失败:', error);
  }
};

// 获取统计
const fetchStats = async () => {
  try {
    const familyId = authStore.user?.familyId;
    if (!familyId) return;
    
    const res = await meetingApi.getMeetingStats({ familyId });
    if (res.success) {
      stats.value = res.data || { total: 0, pending: 0, scheduled: 0, completed: 0, cancelled: 0 };
    }
  } catch (error) {
    console.error('获取统计失败:', error);
  }
};

// 刷新数据
const refreshData = async () => {
  await Promise.all([fetchMeetings(), fetchStats()]);
};

// 获取状态样式
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };
  return classes[status] || 'bg-slate-100 text-slate-500';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待安排',
    scheduled: '已安排',
    completed: '已完成',
    cancelled: '已取消',
  };
  return texts[status] || status;
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 打开安排弹窗
const openScheduleModal = (meeting: any) => {
  currentMeeting.value = meeting;
  // 默认设置为明天同一时间
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMinutes(0);
  scheduleForm.value.scheduledAt = tomorrow.toISOString().slice(0, 16);
  showScheduleModal.value = true;
};

// 提交安排
const submitSchedule = async () => {
  if (!currentMeeting.value || !scheduleForm.value.scheduledAt || !authStore.user?.id) return;
  
  try {
    const res = await meetingApi.scheduleMeeting(currentMeeting.value.id, {
      scheduledAt: new Date(scheduleForm.value.scheduledAt).toISOString(),
      scheduledBy: authStore.user.id,
    });
    
    if (res.success) {
      showScheduleModal.value = false;
      await refreshData();
    }
  } catch (error) {
    console.error('安排会议失败:', error);
    alert('安排失败，请重试');
  }
};

// 取消会议
const cancelMeeting = async (meeting: any) => {
  if (!confirm('确定要取消这个会议吗？')) return;
  if (!authStore.user?.id) return;
  
  try {
    const res = await meetingApi.cancelMeeting(meeting.id, {
      cancelledBy: authStore.user.id,
    });
    
    if (res.success) {
      await refreshData();
    }
  } catch (error) {
    console.error('取消会议失败:', error);
    alert('取消失败，请重试');
  }
};

// 打开评分弹窗
const openScoreModal = (meeting: any) => {
  currentMeeting.value = meeting;
  scoreForm.value = { score: 0, scoreNote: '' };
  showScoreModal.value = true;
};

// 提交评分
const submitScore = async () => {
  if (!currentMeeting.value || !scoreForm.value.score) return;
  
  try {
    const res = await meetingApi.scoreMeeting(currentMeeting.value.id, {
      score: scoreForm.value.score,
      scoreNote: scoreForm.value.scoreNote,
    });
    
    if (res.success) {
      showScoreModal.value = false;
      await refreshData();
      
      // 显示奖励提示
      if (scoreForm.value.score >= 4) {
        const points = scoreForm.value.score === 5 ? 50 : 30;
        setTimeout(() => {
          alert(`🎉 孩子获得了 ${points} 积分奖励！`);
        }, 300);
      }
    }
  } catch (error) {
    console.error('评分失败:', error);
    alert('评分失败，请重试');
  }
};

// 显示评语
const showScoreNote = (meeting: any) => {
  currentMeeting.value = meeting;
  showNoteModal.value = true;
};

// 查看PPT
const viewPPT = (meeting: any) => {
  currentMeeting.value = meeting;
  showPPTModal.value = true;
};

// 删除会议
const deleteMeeting = async (meeting: any) => {
  if (!confirm('确定要删除这个会议记录吗？此操作不可恢复。')) return;
  
  try {
    const res = await meetingApi.deleteMeeting(meeting.id);
    
    if (res.success) {
      await refreshData();
    }
  } catch (error) {
    console.error('删除会议失败:', error);
    alert('删除失败，请重试');
  }
};

// 初始化
onMounted(() => {
  refreshData();
});
</script>
