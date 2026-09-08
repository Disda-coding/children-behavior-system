<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { NavItem } from '@/config/nav';

defineProps<{
  items: NavItem[];
}>();

const route = useRoute();

const isActive = (to: string) => route.path.startsWith(to);
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
  >
    <div class="mx-auto grid max-w-md grid-cols-4">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors"
        :class="isActive(item.to) ? 'text-accent' : 'text-ink-2'"
      >
        <component :is="item.icon" :size="22" :stroke-width="isActive(item.to) ? 2.4 : 1.8" />
        <span>{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>
