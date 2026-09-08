<script setup lang="ts">
import { computed, watchEffect, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useCelebrationStore } from '@/stores/celebration';
import { childTabs, parentTabs } from '@/config/nav';
import TabBar from './TabBar.vue';
import SideNav from './SideNav.vue';
import NotificationCenter from '@/components/common/NotificationCenter.vue';
import AchievementUnlockAnimation from '@/components/common/AchievementUnlockAnimation.vue';

const authStore = useAuthStore();
const celebrationStore = useCelebrationStore();
const route = useRoute();

const role = computed(() => authStore.user?.role ?? 'parent');
const isChild = computed(() => role.value === 'child');
const theme = computed(() => (isChild.value ? 'child' : 'parent'));
const tabs = computed(() => (isChild.value ? childTabs : parentTabs));
const title = computed(() => (route.meta.title as string) || '');

/* 主题挂到 <html> 上，弹窗/Toast 等浮层也能吃到主题变量 */
watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
});

/* 儿童端：全局成就庆祝轮询 */
onMounted(() => {
  if (isChild.value) celebrationStore.start();
});

onUnmounted(() => {
  celebrationStore.stop();
});

const initial = computed(() => authStore.user?.displayName?.charAt(0) || '?');
</script>

<template>
  <div class="min-h-screen" :data-theme="theme" style="background: var(--page-bg)">
    <!-- 桌面端侧边导航 -->
    <SideNav :rail="isChild" class="hidden lg:flex" />

    <!-- 内容区：桌面端让出侧边栏宽度 -->
    <div :class="isChild ? 'lg:pl-20' : 'lg:pl-60'">
      <!-- 顶栏 -->
      <header
        class="sticky top-0 z-30 border-b border-line bg-card/90 backdrop-blur"
      >
        <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-16">
          <h1 class="text-lg font-bold text-ink">{{ title }}</h1>
          <div class="flex items-center gap-2 sm:gap-3">
            <NotificationCenter />
            <div class="flex items-center gap-2 rounded-full bg-base px-3 py-1.5">
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-card"
              >
                {{ initial }}
              </div>
              <span class="hidden text-sm font-medium text-ink sm:inline">
                {{ authStore.user?.displayName }}
              </span>
            </div>
            <button
              class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-2 transition-colors hover:bg-base hover:text-danger"
              title="退出登录"
              @click="authStore.logout"
            >
              <LogOut :size="16" />
              <span class="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:pb-10 lg:pt-8">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 移动端底部 Tab -->
    <TabBar :items="tabs" class="lg:hidden" />

    <!-- 全屏成就解锁动画（儿童端，任何页面都会触发） -->
    <AchievementUnlockAnimation
      v-if="isChild"
      :achievements="celebrationStore.queue"
      @close="celebrationStore.dismiss()"
    />
  </div>
</template>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
}
</style>
