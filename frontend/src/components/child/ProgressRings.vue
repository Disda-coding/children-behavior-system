<template>
  <div class="relative select-none" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="-rotate-90">
      <!-- 底环 -->
      <circle
        v-for="(ring, i) in rings"
        :key="`bg-${i}`"
        :cx="center"
        :cy="center"
        :r="ring.r"
        fill="none"
        :stroke="ring.trackColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- 进度环 -->
      <circle
        v-for="(ring, i) in rings"
        :key="`fg-${i}`"
        :cx="center"
        :cy="center"
        :r="ring.r"
        fill="none"
        :stroke="ring.color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        class="ring-progress"
        :style="{ transitionDelay: `${i * 120}ms` }"
        :stroke-dasharray="ring.circumference"
        :stroke-dashoffset="ring.offset"
      />
    </svg>

    <!-- 中心内容 -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div v-if="allComplete" class="flex items-center gap-1 rounded-full bg-honey/15 px-3 py-1">
        <Star class="h-4 w-4 fill-honey text-honey" />
        <span class="font-display text-xs font-bold text-honey">完美一天</span>
      </div>
      <div v-else class="text-center">
        <p class="font-display text-3xl font-extrabold leading-none text-ink">{{ points.value }}</p>
        <p class="mt-0.5 text-xs text-ink-2">今日积分 / {{ points.target }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Star } from 'lucide-vue-next';

const props = defineProps<{
  points: { value: number; target: number };
  habits: { value: number; target: number };
  persist: { value: number; target: number };
  allComplete: boolean;
  size?: number;
}>();

const size = computed(() => props.size ?? 200);
const center = computed(() => size.value / 2);
const strokeWidth = computed(() => Math.max(12, size.value / 14));
const mounted = ref(false);
onMounted(() => {
  requestAnimationFrame(() => (mounted.value = true));
});

const rings = computed(() => {
  const gap = strokeWidth.value * 1.9;
  const defs = [
    { color: '#ff5a5f', trackColor: 'rgba(255,90,95,0.12)', value: props.points, r: center.value - strokeWidth.value / 2 },
    { color: '#7cd93f', trackColor: 'rgba(124,217,63,0.12)', value: props.habits, r: center.value - strokeWidth.value / 2 - gap },
    { color: '#22c3e6', trackColor: 'rgba(34,195,230,0.12)', value: props.persist, r: center.value - strokeWidth.value / 2 - gap * 2 },
  ];
  return defs.map((d) => {
    const circumference = 2 * Math.PI * d.r;
    const ratio = Math.min(1, d.value.target > 0 ? d.value.value / d.value.target : 0);
    return {
      ...d,
      circumference,
      offset: mounted.value ? circumference * (1 - ratio) : circumference,
    };
  });
});
</script>

<style scoped>
.ring-progress {
  transition: stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
