<template>
  <div class="space-y-5">
    <!-- Tab + 新建按钮 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.key ? 'bg-p-accent text-white shadow-md shadow-p-accent/25' : 'bg-card text-ink-2 hover:text-ink'
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span
            v-if="tab.key === 'review' && pendingCount > 0"
            class="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-p-danger px-1 text-[11px] font-bold text-white"
          >
            {{ pendingCount }}
          </span>
        </button>
      </div>
      <button v-if="activeTab === 'rewards'" class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold" @click="openForm()">
        <Plus class="mr-1 inline h-4 w-4" /> 新建奖励
      </button>
    </div>

    <!-- 兑换审核 -->
    <template v-if="activeTab === 'review'">
      <div v-if="redemptions.length === 0" class="card py-14 text-center">
        <ClipboardCheck class="mx-auto mb-3 h-10 w-10 text-ink-2/40" />
        <p class="text-sm text-ink-2">暂无兑换记录</p>
      </div>
      <div v-else class="card divide-y divide-line overflow-hidden">
        <div v-for="r in redemptions" :key="r.id" class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-p-accent/10 text-p-accent">
              <Gift class="h-5 w-5" />
            </span>
            <div>
              <p class="text-sm font-medium text-ink">
                {{ r.user?.displayName || r.user?.username }} 兑换「{{ r.reward?.name }}」
              </p>
              <p class="text-xs text-ink-2">{{ formatDate(r.createdAt) }} · {{ r.pointsSpent }} 积分</p>
              <p v-if="r.note" class="mt-0.5 text-xs text-ink-2">备注：{{ r.note }}</p>
            </div>
          </div>

          <div v-if="r.status === 'pending'" class="flex items-center gap-2">
            <button
              class="rounded-lg bg-p-green/10 px-3 py-1.5 text-xs font-semibold text-p-green hover:bg-p-green/20"
              @click="review(r, 'approve')"
            >
              通过
            </button>
            <button
              class="rounded-lg bg-p-danger/10 px-3 py-1.5 text-xs font-semibold text-p-danger hover:bg-p-danger/20"
              @click="review(r, 'reject')"
            >
              驳回
            </button>
          </div>
          <div v-else-if="r.status === 'approved'" class="flex items-center gap-2">
            <button
              class="rounded-lg bg-p-accent/10 px-3 py-1.5 text-xs font-semibold text-p-accent hover:bg-p-accent/20"
              @click="completeRedemption(r)"
            >
              标记已兑现
            </button>
            <span class="text-xs text-p-accent">已通过</span>
          </div>
          <span v-else :class="['rounded-full px-2.5 py-0.5 text-[11px] font-medium', statusClass(r.status)]">
            {{ statusText(r.status) }}
          </span>
        </div>
      </div>
    </template>

    <!-- 奖励管理 -->
    <template v-else>
      <div v-if="rewards.length === 0" class="card py-14 text-center">
        <Gift class="mx-auto mb-3 h-10 w-10 text-ink-2/40" />
        <p class="text-sm text-ink-2">还没有奖励，点击右上角新建</p>
      </div>
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="reward in rewards" :key="reward.id" class="card flex flex-col p-5">
          <div class="mb-3 flex items-start justify-between">
            <span class="rounded-lg bg-p-accent/10 px-2 py-0.5 text-[11px] font-medium text-p-accent">
              {{ typeText(reward.type) }}
            </span>
            <span :class="['rounded-full px-2 py-0.5 text-[11px] font-medium', reward.isActive ? 'bg-p-green/10 text-p-green' : 'bg-ink/5 text-ink-2']">
              {{ reward.isActive ? '上架中' : '已下架' }}
            </span>
          </div>
          <h3 class="font-semibold text-ink">{{ reward.name }}</h3>
          <p class="mb-4 mt-0.5 line-clamp-2 text-xs text-ink-2">{{ reward.description }}</p>
          <div class="mt-auto flex items-center justify-between">
            <div class="text-sm">
              <span class="font-display text-xl font-bold text-p-warm">{{ reward.pointsCost }}</span>
              <span class="text-xs text-ink-2"> 积分</span>
              <span v-if="reward.stock !== null && reward.stock !== undefined" class="ml-2 text-xs text-ink-2">
                库存 {{ reward.stock }}
              </span>
            </div>
            <div class="flex gap-1.5">
              <button class="rounded-lg bg-ink/5 p-2 text-ink-2 hover:bg-ink/10 hover:text-ink" title="编辑" @click="openForm(reward)">
                <Pencil class="h-4 w-4" />
              </button>
              <button class="rounded-lg bg-p-danger/10 p-2 text-p-danger hover:bg-p-danger/20" title="下架" @click="removeReward(reward)">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 新建/编辑弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm" @click.self="showForm = false">
          <div class="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl">
            <h3 class="mb-4 text-lg font-bold text-ink">{{ form.id ? '编辑奖励' : '新建奖励' }}</h3>
            <div class="space-y-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-ink">名称</label>
                <input v-model.trim="form.name" type="text" class="input" placeholder="例如：周末多看 30 分钟动画" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-ink">描述</label>
                <input v-model.trim="form.description" type="text" class="input" placeholder="可选" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-ink">类型</label>
                  <select v-model="form.type" class="input">
                    <option value="virtual">虚拟奖励</option>
                    <option value="physical">实物奖励</option>
                    <option value="activity">活动奖励</option>
                    <option value="cash">零花钱</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-ink">所需积分</label>
                  <input v-model.number="form.pointsCost" type="number" min="1" class="input" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-ink">库存（留空为不限）</label>
                  <input v-model.number="form.stock" type="number" min="0" class="input" placeholder="不限" />
                </div>
                <div class="flex items-end">
                  <p v-if="form.type === 'cash'" class="text-xs text-ink-2">
                    按汇率折算约 <span class="font-semibold text-p-warm">¥{{ (form.pointsCost / (cashRate || 100)).toFixed(2) }}</span>
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 flex gap-3">
              <button class="flex-1 rounded-xl bg-ink/5 py-2.5 text-sm font-medium text-ink-2 hover:bg-ink/10" @click="showForm = false">取消</button>
              <button class="btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold" :disabled="saving" @click="saveReward">
                {{ saving ? '保存中…' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 驳回原因弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="rejecting" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm" @click.self="rejecting = false">
          <div class="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl">
            <h3 class="mb-2 text-lg font-bold text-ink">驳回兑换</h3>
            <p class="mb-3 text-sm text-ink-2">积分将自动退回给孩子，库存同步恢复。</p>
            <textarea v-model.trim="rejectReason" class="input min-h-[72px] resize-none" placeholder="驳回原因（会通知给孩子）"></textarea>
            <div class="mt-4 flex gap-3">
              <button class="flex-1 rounded-xl bg-ink/5 py-2.5 text-sm font-medium text-ink-2 hover:bg-ink/10" @click="rejecting = false">取消</button>
              <button class="flex-1 rounded-xl bg-p-danger py-2.5 text-sm font-semibold text-white hover:brightness-105" @click="confirmReject">确认驳回</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ClipboardCheck, Gift, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { rewardApi, familyApi } from '@/api';

const authStore = useAuthStore();

const tabs = [
  { key: 'rewards', label: '奖励管理' },
  { key: 'review', label: '兑换审核' },
];
const activeTab = ref('rewards');

const rewards = ref<any[]>([]);
const redemptions = ref<any[]>([]);
const cashRate = ref(100);

const pendingCount = computed(() => redemptions.value.filter((r) => r.status === 'pending').length);

// ---- 表单 ----
const showForm = ref(false);
const saving = ref(false);
const form = reactive({
  id: 0,
  name: '',
  description: '',
  type: 'virtual' as 'virtual' | 'physical' | 'activity' | 'cash',
  pointsCost: 100,
  stock: undefined as number | undefined,
});

const openForm = (reward?: any) => {
  form.id = reward?.id || 0;
  form.name = reward?.name || '';
  form.description = reward?.description || '';
  form.type = reward?.type || 'virtual';
  form.pointsCost = reward?.pointsCost || 100;
  form.stock = reward?.stock ?? undefined;
  showForm.value = true;
};

const saveReward = async () => {
  if (!form.name || form.pointsCost <= 0 || saving.value) return;
  saving.value = true;
  try {
    const payload: any = {
      name: form.name,
      description: form.description,
      type: form.type,
      pointsCost: form.pointsCost,
      stock: form.stock ?? null,
    };
    if (form.id) {
      await rewardApi.updateReward(form.id, payload);
    } else {
      await rewardApi.createReward({ ...payload, familyId: authStore.user?.familyId });
    }
    showForm.value = false;
    await fetchRewards();
  } catch (error: any) {
    alert(error.response?.data?.error || '保存失败');
  } finally {
    saving.value = false;
  }
};

const removeReward = async (reward: any) => {
  if (!confirm(`确定下架「${reward.name}」吗？孩子将无法再兑换。`)) return;
  try {
    await rewardApi.deleteReward(reward.id);
    await fetchRewards();
  } catch (error: any) {
    alert(error.response?.data?.error || '操作失败');
  }
};

// ---- 审核 ----
const rejecting = ref(false);
const rejectReason = ref('');
const rejectTarget = ref<any>(null);

const review = (r: any, action: 'approve' | 'reject') => {
  if (action === 'approve') {
    approveRedemption(r);
  } else {
    rejectTarget.value = r;
    rejectReason.value = '';
    rejecting.value = true;
  }
};

const approveRedemption = async (r: any) => {
  try {
    await rewardApi.approveRedemption(r.id, { approvedBy: authStore.user?.id || 0 });
    await fetchRedemptions();
  } catch (error: any) {
    alert(error.response?.data?.error || '操作失败');
  }
};

const confirmReject = async () => {
  if (!rejectTarget.value) return;
  try {
    await rewardApi.rejectRedemption(rejectTarget.value.id, {
      approvedBy: authStore.user?.id || 0,
      note: rejectReason.value || undefined,
    });
    rejecting.value = false;
    rejectTarget.value = null;
    await Promise.all([fetchRedemptions(), fetchRewards()]);
  } catch (error: any) {
    alert(error.response?.data?.error || '操作失败');
  }
};

const completeRedemption = async (r: any) => {
  try {
    await rewardApi.completeRedemption(r.id, { approvedBy: authStore.user?.id || 0, note: '已兑现' });
    await fetchRedemptions();
  } catch (error: any) {
    alert(error.response?.data?.error || '操作失败');
  }
};

// ---- 数据 ----
const fetchRewards = async () => {
  try {
    const res = (await rewardApi.getRewards({ familyId: authStore.user?.familyId })) as any;
    rewards.value = res.rewards || [];
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
  }
};

const fetchRedemptions = async () => {
  try {
    const res = (await rewardApi.getRedemptions({ familyId: authStore.user?.familyId })) as any;
    redemptions.value = res.redemptions || [];
  } catch (error) {
    console.error('Failed to fetch redemptions:', error);
  }
};

const fetchFamilySettings = async () => {
  try {
    const res = (await familyApi.getFamily(authStore.user?.familyId || 0)) as any;
    cashRate.value = res.family?.cashExchangeRate || 100;
  } catch {
    cashRate.value = 100;
  }
};

const typeText = (type: string) => {
  const texts: Record<string, string> = {
    virtual: '虚拟奖励',
    physical: '实物奖励',
    activity: '活动奖励',
    cash: '零花钱',
  };
  return texts[type] || type;
};

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-p-warm/15 text-p-warm',
    approved: 'bg-p-accent/10 text-p-accent',
    completed: 'bg-p-green/10 text-p-green',
    rejected: 'bg-p-danger/10 text-p-danger',
  };
  return classes[status] || 'bg-ink/5 text-ink-2';
};

const statusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    completed: '已完成',
    rejected: '已驳回',
  };
  return texts[status] || status;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchRewards();
  fetchRedemptions();
  fetchFamilySettings();
});
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
