<template>
  <div class="space-y-5">
    <!-- 顶部操作 -->
    <div class="flex justify-end">
      <button class="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold" @click="showApplyModal = true">
        <Plus class="mr-1 inline h-4 w-4" /> 申请家庭会议
      </button>
    </div>

    <!-- 会议列表 -->
    <div v-if="meetings.length === 0" class="card py-14 text-center">
      <UsersRound class="mx-auto mb-3 h-10 w-10 text-ink-2/40" />
      <p class="text-sm text-ink-2">还没有会议记录，主动申请一次家庭会议吧！</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="meeting in meetings" :key="meeting.id" class="card p-5">
        <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-ink">{{ meeting.title }}</h3>
            <p v-if="meeting.description" class="mt-0.5 text-sm text-ink-2">{{ meeting.description }}</p>
          </div>
          <span :class="['rounded-full px-2.5 py-0.5 text-[11px] font-medium', statusClass(meeting.status)]">
            {{ statusText(meeting.status) }}
          </span>
        </div>

        <div v-if="meeting.scheduledAt" class="flex items-center gap-1.5 text-xs text-ink-2">
          <CalendarDays class="h-3.5 w-3.5" />
          {{ formatDateTime(meeting.scheduledAt) }}
        </div>

        <!-- 附件链接 -->
        <div v-if="meeting.pptUrl" class="mt-2">
          <a
            :href="meeting.pptUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:opacity-80"
          >
            <Link2 class="h-3.5 w-3.5" />
            查看附件 / 演示文稿
          </a>
        </div>

        <!-- 评分 -->
        <div v-if="meeting.status === 'completed' && meeting.score !== null" class="mt-3 rounded-xl bg-sprout/10 p-3">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-medium text-sprout">家长评分</span>
            <span v-for="n in 5" :key="n" class="text-base leading-none" :class="n <= meeting.score ? 'text-honey' : 'text-ink/15'">★</span>
            <span class="font-display text-sm font-bold text-sprout">{{ meeting.score }} 分</span>
          </div>
          <p v-if="meeting.scoreNote" class="mt-1 text-xs text-ink-2">{{ meeting.scoreNote }}</p>
        </div>
      </div>
    </div>

    <!-- 申请会议弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showApplyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm" @click.self="showApplyModal = false">
          <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl">
            <h3 class="mb-4 text-lg font-bold text-ink">申请家庭会议</h3>

            <div class="space-y-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-ink">会议主题 *</label>
                <input v-model.trim="meetingForm.title" type="text" class="input" placeholder="例如：想聊聊游戏时间安排" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-ink">会议内容</label>
                <textarea v-model.trim="meetingForm.description" rows="3" class="input resize-none" placeholder="简要描述你想讨论的内容"></textarea>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-ink">期望时间</label>
                <input v-model="meetingForm.scheduledAt" type="datetime-local" class="input" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-ink">附件链接（可选）</label>
                <input v-model.trim="meetingForm.attachmentUrl" type="url" class="input" placeholder="粘贴腾讯文档 / 网盘链接" />
                <p class="mt-1 text-[11px] text-ink-2">把演示文稿放在在线文档，把链接粘贴到这里</p>
              </div>
            </div>

            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl bg-ink/5 py-2.5 text-sm font-medium text-ink-2 hover:bg-ink/10" @click="showApplyModal = false">取消</button>
              <button class="btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold" :disabled="!meetingForm.title.trim() || isSubmitting" @click="submitMeeting">
                {{ isSubmitting ? '提交中…' : '提交申请' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CalendarDays, Link2, Plus, UsersRound } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { meetingApi } from '@/api';

const authStore = useAuthStore();

const meetings = ref<any[]>([]);
const showApplyModal = ref(false);
const isSubmitting = ref(false);

const meetingForm = ref({
  title: '',
  description: '',
  scheduledAt: '',
  attachmentUrl: '',
});

const fetchMeetings = async () => {
  try {
    if (authStore.user?.id) {
      const response = (await meetingApi.getMeetings({ childId: authStore.user.id })) as any;
      meetings.value = response.meetings || response.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
  }
};

const submitMeeting = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    if (authStore.user?.familyId) {
      await meetingApi.createMeeting({
        familyId: authStore.user.familyId,
        childId: authStore.user.id,
        title: meetingForm.value.title,
        description: meetingForm.value.description,
        scheduledAt: meetingForm.value.scheduledAt || undefined,
        pptUrl: meetingForm.value.attachmentUrl || undefined,
      });
      showApplyModal.value = false;
      meetingForm.value = { title: '', description: '', scheduledAt: '', attachmentUrl: '' };
      await fetchMeetings();
    }
  } catch (error) {
    console.error('Failed to submit meeting:', error);
    alert('提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-honey/15 text-honey',
    scheduled: 'bg-sky/15 text-sky',
    completed: 'bg-sprout/15 text-sprout',
    cancelled: 'bg-ink/5 text-ink-2',
  };
  return classes[status] || 'bg-ink/5 text-ink-2';
};

const statusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待安排',
    scheduled: '已安排',
    completed: '已完成',
    cancelled: '已取消',
  };
  return texts[status] || status;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(fetchMeetings);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
