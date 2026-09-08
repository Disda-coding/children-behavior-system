<template>
  <div class="min-w-[140px] flex-1">
    <div class="mb-1 flex items-baseline justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <Sprout class="h-4 w-4 text-sprout" />
        <span class="font-display text-sm font-bold text-ink">{{ level.name }}</span>
        <span class="rounded-full bg-ink/5 px-1.5 py-0.5 text-[10px] font-semibold text-ink-2">
          Lv.{{ level.level }}
        </span>
      </div>
      <span class="text-[11px] text-ink-2">
        {{ level.exp }}
        <template v-if="level.nextLevelExp">/ {{ level.nextLevelExp }} EXP</template>
        <template v-else>EXP · 满级</template>
      </span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-ink/5">
      <div
        class="h-full rounded-full bg-gradient-to-r from-sprout to-sky transition-[width] duration-700"
        :style="{ width: `${Math.round(level.progress * 100)}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sprout } from 'lucide-vue-next';

defineProps<{
  level: {
    level: number;
    name: string;
    exp: number;
    nextLevelExp: number | null;
    progress: number;
  };
}>();
</script>
