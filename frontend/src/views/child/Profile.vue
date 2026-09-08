<script setup lang="ts">
import { computed } from 'vue';
import { ChevronRight, Flag, CalendarDays, LogOut, ScrollText } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const initial = computed(() => authStore.user?.displayName?.charAt(0) || '?');

const menus = [
  { to: '/child/appeals', label: '申诉中心', desc: '对扣分记录提出异议', icon: Flag },
  { to: '/child/meetings', label: '家庭会议', desc: '申请会议，分享你的想法', icon: CalendarDays },
  { to: '/child/dashboard', label: '积分记录', desc: '在首页查看最新动态', icon: ScrollText },
];
</script>

<template>
  <div>
    <!-- 用户卡片 -->
    <div class="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-card p-6">
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-card"
      >
        {{ initial }}
      </div>
      <div>
        <h2 class="text-xl font-bold text-ink">{{ authStore.user?.displayName }}</h2>
        <p class="text-sm text-ink-2">继续努力，点亮更多徽章！</p>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="overflow-hidden rounded-2xl border border-line bg-card">
      <router-link
        v-for="menu in menus"
        :key="menu.to"
        :to="menu.to"
        class="flex items-center gap-4 border-b border-line p-4 transition-colors last:border-b-0 hover:bg-base"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <component :is="menu.icon" :size="20" />
        </div>
        <div class="flex-1">
          <p class="font-medium text-ink">{{ menu.label }}</p>
          <p class="text-xs text-ink-2">{{ menu.desc }}</p>
        </div>
        <ChevronRight :size="18" class="text-ink-2" />
      </router-link>
    </div>

    <!-- 退出登录 -->
    <button
      class="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-card p-4 text-sm font-medium text-danger transition-colors hover:bg-base"
      @click="authStore.logout"
    >
      <LogOut :size="16" />
      退出登录
    </button>
  </div>
</template>
