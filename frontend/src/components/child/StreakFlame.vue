<template>
  <div
    class="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors"
    :class="hot ? 'bg-honey/15' : 'bg-ink/5'"
    :title="`连续打卡 ${streak} 天${freezeCards > 0 ? `，冻结卡 x${freezeCards}` : ''}`"
  >
    <Flame
      class="transition-all"
      :class="[hot ? 'h-6 w-6 text-honey' : 'h-5 w-5 text-ink-2']"
      :stroke-width="hot ? 2.4 : 2"
    />
    <span
      class="font-display font-extrabold leading-none"
      :class="hot ? 'text-xl text-honey' : 'text-base text-ink-2'"
    >
      {{ streak }}
    </span>
    <span class="text-xs text-ink-2">天</span>
    <span v-if="freezeCards > 0" class="ml-0.5 flex items-center gap-0.5 text-xs text-sky">
      <Snowflake class="h-3.5 w-3.5" />
      {{ freezeCards }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Flame, Snowflake } from 'lucide-vue-next';

const props = defineProps<{
  streak: number;
  freezeCards: number;
}>();

const hot = computed(() => props.streak >= 7);
</script>
