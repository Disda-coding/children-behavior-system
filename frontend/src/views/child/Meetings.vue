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
          <h1 class="text-xl font-bold text-gray-800">家庭会议</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 我的 PPT 文件 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">我的 PPT 文件</h2>
          <button
            @click="showUploadModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            上传 PPT
          </button>
        </div>
        
        <div v-if="pptFiles.length === 0" class="text-center py-8 text-gray-500">
          暂无 PPT 文件
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="file in pptFiles"
            :key="file.key"
            class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 truncate">{{ file.filename }}</p>
                <p class="text-sm text-gray-500 mt-1">{{ formatFileSize(file.size) }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(file.uploadedAt) }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-4">
              <button
                @click="viewPPT(file)"
                class="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                查看
              </button>
              <button
                @click="usePPTForMeeting(file)"
                class="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                用于会议
              </button>
              <button
                @click="deletePPT(file)"
                class="py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 申请会议按钮 -->
      <div class="mb-6">
        <button
          @click="showApplyModal = true"
          class="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          申请家庭会议
        </button>
      </div>

      <!-- 会议列表 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">我的会议</h2>
        <div v-if="meetings.length === 0" class="text-center py-8 text-gray-500">
          暂无会议记录
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="meeting in meetings"
            :key="meeting.id"
            class="p-4 border border-gray-200 rounded-xl"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-medium text-gray-800">{{ meeting.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ meeting.description }}</p>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ getStatusText(meeting.status) }}
              </span>
            </div>

            <!-- 会议时间 -->
            <div v-if="meeting.scheduledAt" class="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatDateTime(meeting.scheduledAt) }}
            </div>

            <!-- PPT 文件 -->
            <div v-if="meeting.pptUrl" class="flex items-center gap-2 mb-3">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <button
                @click="viewMeetingPPT(meeting)"
                class="text-blue-600 hover:text-blue-700 text-sm"
              >
                查看会议 PPT
              </button>
            </div>

            <!-- 评分 -->
            <div v-if="meeting.status === 'completed' && meeting.score !== null" class="bg-green-50 rounded-lg p-3">
              <div class="flex items-center gap-2">
                <span class="text-green-700 font-medium">评分:</span>
                <div class="flex items-center gap-1">
                  <svg
                    v-for="n in 5"
                    :key="n"
                    class="w-5 h-5"
                    :class="n <= meeting.score ? 'text-yellow-400' : 'text-gray-300'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span class="text-green-700 font-bold ml-2">{{ meeting.score }}分</span>
              </div>
              <p v-if="meeting.scoreNote" class="text-green-600 text-sm mt-2">
                {{ meeting.scoreNote }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- PPT 上传弹窗 -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
        <h3 class="text-xl font-bold text-gray-800 mb-4">上传 PPT</h3>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".ppt,.pptx,.pdf"
            class="hidden"
            @change="handleFileSelect"
          />
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-gray-600 mb-2">
            <span v-if="selectedFile" class="text-blue-600 font-medium">{{ selectedFile.name }}</span>
            <span v-else>拖拽文件到此处，或</span>
          </p>
          <button
            @click="fileInput?.click()"
            type="button"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            点击选择文件
          </button>
          <p class="text-gray-400 text-sm mt-2">支持 PPT、PPTX、PDF 格式，最大 10MB</p>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showUploadModal = false"
            class="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="uploadPPT"
            :disabled="!selectedFile || isUploading"
            class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isUploading">上传中...</span>
            <span v-else>上传</span>
          </button>
        </div>
      </div>
    </div>

    <!-- PPT 查看弹窗 -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 max-w-4xl mx-4 w-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ viewingFile?.filename }}</h3>
          <button
            @click="showViewModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            v-if="viewingFile?.url"
            :src="viewingFile.url"
            class="w-full h-full min-h-[500px]"
            frameborder="0"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- 申请会议弹窗 -->
    <div v-if="showApplyModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md mx-4 w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-800 mb-4">申请家庭会议</h3>
        
        <!-- 会议主题 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">会议主题 *</label>
          <input
            v-model="meetingForm.title"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入会议主题"
          />
        </div>

        <!-- 会议描述 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">会议描述</label>
          <textarea
            v-model="meetingForm.description"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="请简要描述会议内容..."
          ></textarea>
        </div>

        <!-- 期望时间 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">期望时间</label>
          <input
            v-model="meetingForm.scheduledAt"
            type="datetime-local"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 选择 PPT -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">选择 PPT</label>
          <select
            v-model="meetingForm.pptKey"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">不使用 PPT</option>
            <option v-for="file in pptFiles" :key="file.key" :value="file.key">
              {{ file.filename }}
            </option>
          </select>
          <p v-if="pptFiles.length === 0" class="text-sm text-gray-500 mt-2">
            还没有 PPT 文件，请先上传
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="showApplyModal = false"
            class="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="submitMeeting"
            :disabled="!meetingForm.title.trim() || isSubmitting"
            class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">提交中...</span>
            <span v-else>提交申请</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { meetingApi, uploadApi } from '@/api';

const authStore = useAuthStore();

const meetings = ref<any[]>([]);
const pptFiles = ref<any[]>([]);
const showApplyModal = ref(false);
const showUploadModal = ref(false);
const showViewModal = ref(false);
const isSubmitting = ref(false);
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const viewingFile = ref<any>(null);

const meetingForm = ref({
  title: '',
  description: '',
  scheduledAt: '',
  pptKey: ''
});

const fetchMeetings = async () => {
  try {
    if (authStore.user?.id) {
      const response = await meetingApi.getMeetings({
        childId: authStore.user.id
      }) as { meetings: any[] };
      meetings.value = response.meetings;
    }
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
  }
};

const fetchPPTFiles = async () => {
  try {
    const response = await uploadApi.getFileList() as { files: any[] };
    pptFiles.value = response.files;
  } catch (error) {
    console.error('Failed to fetch PPT files:', error);
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files[0]) {
    const file = event.dataTransfer.files[0];
    if (file.name.match(/\.(ppt|pptx|pdf)$/i)) {
      selectedFile.value = file;
    } else {
      alert('请上传 PPT 或 PDF 格式的文件');
    }
  }
};

const uploadPPT = async () => {
  if (!selectedFile.value) return;
  
  try {
    isUploading.value = true;
    await uploadApi.uploadFile(selectedFile.value);
    showUploadModal.value = false;
    selectedFile.value = null;
    await fetchPPTFiles();
    alert('上传成功！');
  } catch (error) {
    console.error('Failed to upload PPT:', error);
    alert('上传失败，请重试');
  } finally {
    isUploading.value = false;
  }
};

const viewPPT = (file: any) => {
  viewingFile.value = file;
  showViewModal.value = true;
};

const viewMeetingPPT = (meeting: any) => {
  if (meeting.pptUrl) {
    viewingFile.value = {
      filename: meeting.title + ' 的 PPT',
      url: meeting.pptUrl
    };
    showViewModal.value = true;
  }
};

const usePPTForMeeting = (file: any) => {
  meetingForm.value.pptKey = file.key;
  showApplyModal.value = true;
};

const deletePPT = async (file: any) => {
  if (!confirm('确定要删除这个文件吗？')) return;
  
  try {
    await uploadApi.deleteFile(file.key);
    await fetchPPTFiles();
    alert('删除成功！');
  } catch (error) {
    console.error('Failed to delete PPT:', error);
    alert('删除失败，请重试');
  }
};

const submitMeeting = async () => {
  try {
    isSubmitting.value = true;
    
    if (authStore.user?.familyId) {
      // 获取 PPT URL
      let pptUrl = '';
      if (meetingForm.value.pptKey) {
        const selectedPPT = pptFiles.value.find(f => f.key === meetingForm.value.pptKey);
        if (selectedPPT) {
          pptUrl = selectedPPT.url;
        }
      }

      await meetingApi.createMeeting({
        familyId: authStore.user.familyId,
        childId: authStore.user.id,
        title: meetingForm.value.title,
        description: meetingForm.value.description,
        scheduledAt: meetingForm.value.scheduledAt || undefined,
        pptUrl: pptUrl || undefined
      });

      showApplyModal.value = false;
      meetingForm.value = { title: '', description: '', scheduledAt: '', pptKey: '' };
      
      await fetchMeetings();
      alert('会议申请提交成功！');
    }
  } catch (error) {
    console.error('Failed to submit meeting:', error);
    alert('提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    scheduled: '已安排',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  fetchMeetings();
  fetchPPTFiles();
});
</script>