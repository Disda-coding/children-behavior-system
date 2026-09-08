<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Sprout } from 'lucide-vue-next';
import { childTabs, parentNavGroups } from '@/config/nav';

const props = withDefaults(
  defineProps<{
    /** 图标栏模式（儿童端桌面） */
    rail?: boolean;
  }>(),
  { rail: false },
);

const route = useRoute();
const isActive = (to: string) => route.path.startsWith(to);
</script>

<template>
  <!-- 图标栏模式：儿童端桌面导航 -->
  <aside
    v-if="props.rail"
    class="fixed left-0 top-0 z-40 flex h-screen w-20 flex-col items-center border-r border-line bg-card py-6"
  >
    <div class="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-card">
      <Sprout :size="24" />
    </div>
    <nav class="flex flex-col gap-2">
      <router-link
        v-for="item in childTabs"
        :key="item.to"
        :to="item.to"
        class="flex h-12 w-12 items-center justify-center rounded-2xl transition-all"
        :class="
          isActive(item.to)
            ? 'bg-accent text-card shadow-md'
            : 'text-ink-2 hover:bg-base'
        "
        :title="item.label"
      >
        <component :is="item.icon" :size="22" :stroke-width="isActive(item.to) ? 2.4 : 1.8" />
      </router-link>
    </nav>
  </aside>

  <!-- 完整侧边栏：家长端桌面导航 -->
  <aside
    v-else
    class="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-line bg-card px-4 py-6"
  >
    <div class="mb-8 flex items-center gap-2.5 px-2">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-card">
        <Sprout :size="20" />
      </div>
      <span class="text-base font-bold text-ink">星芽成长</span>
    </div>

    <nav class="flex-1 space-y-6 overflow-y-auto">
      <div v-for="group in parentNavGroups" :key="group.title">
        <p class="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-ink-2/70">
          {{ group.title }}
        </p>
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          :class="
            isActive(item.to)
              ? 'bg-accent/10 font-medium text-accent'
              : 'text-ink-2 hover:bg-base hover:text-ink'
          "
        >
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>
