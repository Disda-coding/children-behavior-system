<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ChevronRight, LogOut, Settings2, Users } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { familyApi } from '@/api';
import { parentNavGroups } from '@/config/nav';

const authStore = useAuthStore();

// ---- 家庭设置 ----
const settings = reactive({
  name: '',
  inviteCode: '',
  members: [] as any[],
  ringTargetPoints: 20,
  ringTargetCount: 3,
  cashExchangeRate: 100,
});
const saving = ref(false);
const savedTip = ref(false);

const fetchFamily = async () => {
  try {
    const res = (await familyApi.getMyFamily()) as any;
    settings.name = res.family?.name || '';
    settings.inviteCode = res.family?.inviteCode || '';
    settings.members = res.members || [];
    settings.ringTargetPoints = res.family?.ringTargetPoints || 20;
    settings.ringTargetCount = res.family?.ringTargetCount || 3;
    settings.cashExchangeRate = res.family?.cashExchangeRate || 100;
  } catch (error) {
    console.error('Failed to fetch family:', error);
  }
};

const saveSettings = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await familyApi.updateFamily(authStore.user?.familyId || 0, {
      name: settings.name,
      ringTargetPoints: settings.ringTargetPoints,
      ringTargetCount: settings.ringTargetCount,
      cashExchangeRate: settings.cashExchangeRate,
    });
    savedTip.value = true;
    setTimeout(() => (savedTip.value = false), 2000);
  } catch (error: any) {
    alert(error.response?.data?.error || '保存失败');
  } finally {
    saving.value = false;
  }
};

onMounted(fetchFamily);
</script>

<template>
  <div class="space-y-5">
    <!-- 家庭设置 -->
    <div class="card p-5">
      <div class="mb-4 flex items-center gap-2">
        <Settings2 :size="18" class="text-accent" />
        <h3 class="font-semibold text-ink">家庭设置</h3>
      </div>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-xs font-medium text-ink-2">家庭名称</label>
          <input v-model.trim="settings.name" type="text" class="input" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-ink-2">每日积分目标</label>
            <input v-model.number="settings.ringTargetPoints" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-ink-2">每日行为次数目标</label>
            <input v-model.number="settings.ringTargetCount" type="number" min="1" class="input" />
          </div>
        </div>
        <p class="-mt-2 text-xs text-ink-2">三环目标：影响孩子首页「今日三环」的完成标准</p>

        <div>
          <label class="mb-1 block text-xs font-medium text-ink-2">零花钱汇率（积分 / 元）</label>
          <input v-model.number="settings.cashExchangeRate" type="number" min="1" class="input" />
        </div>

        <div class="flex items-center justify-between rounded-xl bg-base px-4 py-3">
          <div>
            <p class="text-xs text-ink-2">家庭邀请码</p>
            <p class="font-display text-lg font-bold tracking-[0.2em] text-ink">{{ settings.inviteCode }}</p>
          </div>
          <button
            class="text-xs font-medium text-accent hover:opacity-80"
            @click="familyApi.refreshInviteCode(authStore.user?.familyId || 0).then(fetchFamily)"
          >
            换一个
          </button>
        </div>

        <button class="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold" :disabled="saving" @click="saveSettings">
          {{ saving ? '保存中…' : savedTip ? '✓ 已保存' : '保存设置' }}
        </button>
      </div>
    </div>

    <!-- 家庭成员 -->
    <div class="card p-5">
      <div class="mb-3 flex items-center gap-2">
        <Users :size="18" class="text-accent" />
        <h3 class="font-semibold text-ink">家庭成员</h3>
      </div>
      <div class="divide-y divide-line">
        <div v-for="m in settings.members" :key="m.id" class="flex items-center gap-3 py-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
            {{ m.displayName?.charAt(0) }}
          </span>
          <span class="flex-1 text-sm font-medium text-ink">{{ m.displayName }}</span>
          <span class="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] text-ink-2">
            {{ m.role === 'parent' ? '家长' : '孩子' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 导航分组 -->
    <div
      v-for="group in parentNavGroups"
      :key="group.title"
      class="overflow-hidden rounded-2xl border border-line bg-card"
    >
      <p class="border-b border-line bg-base px-4 py-2.5 text-xs font-semibold tracking-wider text-ink-2">
        {{ group.title }}
      </p>
      <router-link
        v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-4 border-b border-line p-4 transition-colors last:border-b-0 hover:bg-base"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <component :is="item.icon" :size="20" />
        </div>
        <span class="flex-1 font-medium text-ink">{{ item.label }}</span>
        <ChevronRight :size="18" class="text-ink-2" />
      </router-link>
    </div>

    <button
      class="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-card p-4 text-sm font-medium text-danger transition-colors hover:bg-base"
      @click="authStore.logout"
    >
      <LogOut :size="16" />
      退出登录
    </button>
  </div>
</template>
