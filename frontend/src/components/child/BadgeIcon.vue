<template>
  <div class="badge-icon" :class="{ 'badge-icon--locked': locked }">
    <svg :width="size" :height="size" viewBox="0 0 100 100">
      <defs>
        <linearGradient :id="`bg-${tier}-${uid}`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="palette.light" />
          <stop offset="55%" :stop-color="palette.base" />
          <stop offset="100%" :stop-color="palette.dark" />
        </linearGradient>
        <linearGradient :id="`shine-${tier}-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.65)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <!-- 缎带 -->
      <path
        d="M 35 62 L 28 92 L 42 84 L 50 92 L 58 84 L 72 92 L 65 62 Z"
        :fill="`url(#bg-${tier}-${uid})`"
      />
      <!-- 徽章主体 -->
      <circle cx="50" cy="42" r="30" :fill="`url(#bg-${tier}-${uid})`" />
      <circle cx="50" cy="42" r="30" fill="none" :stroke="palette.dark" stroke-width="2.5" />
      <!-- 内环 -->
      <circle cx="50" cy="42" r="24" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" />
      <!-- 上半高光 -->
      <path d="M 24 36 A 30 30 0 0 1 76 36 A 30 30 0 0 0 24 36 Z" :fill="`url(#shine-${tier}-${uid})`" />

      <!-- 星标（按档次叠加星数） -->
      <g v-for="(star, i) in starOffsets" :key="i" :transform="`translate(${star.x} ${star.y}) scale(0.42)`">
        <path
          d="M 0 -12 L 3.5 -4 L 12 -4 L 5.5 1.5 L 8 10 L 0 5 L -8 10 L -5.5 1.5 L -12 -4 L -3.5 -4 Z"
          fill="rgba(255,255,255,0.92)"
          stroke="rgba(0,0,0,0.12)"
          stroke-width="1"
        />
      </g>

      <!-- 锁定遮罩 -->
      <g v-if="locked">
        <circle cx="50" cy="42" r="30" fill="rgba(245,245,247,0.82)" />
        <g transform="translate(50 44)">
          <rect x="-9" y="-2" width="18" height="14" rx="3" fill="#a9a9b0" />
          <path d="M -5 -2 v-4 a 5 5 0 0 1 10 0 v 4" fill="none" stroke="#a9a9b0" stroke-width="3" />
          <circle cx="0" cy="4.5" r="2" fill="#fff" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
export type Tier = 'copper' | 'silver' | 'gold' | 'platinum';
</script>

<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    tier?: Tier;
    locked?: boolean;
    size?: number;
  }>(),
  { tier: 'copper', locked: false, size: 88 }
);

// 组件实例唯一 id，避免同页多实例 SVG 渐变 id 冲突
const uid = Math.random().toString(36).slice(2, 8);

const PALETTES: Record<Tier, { light: string; base: string; dark: string }> = {
  copper: { light: '#f0b08a', base: '#c97b4e', dark: '#96522c' },
  silver: { light: '#f4f6f8', base: '#b9c2cc', dark: '#7f8a96' },
  gold: { light: '#ffe28a', base: '#f2b73c', dark: '#c08a12' },
  platinum: { light: '#e8d8ff', base: '#a98ae0', dark: '#6f4fb5' },
};

const palette = PALETTES[props.tier];

// 星数：铜0 银1 金2 铂3（排布在内环上部）
const starOffsets =
  props.tier === 'platinum'
    ? [{ x: 38, y: 36 }, { x: 50, y: 30 }, { x: 62, y: 36 }]
    : props.tier === 'gold'
      ? [{ x: 42, y: 33 }, { x: 58, y: 33 }]
      : props.tier === 'silver'
        ? [{ x: 50, y: 33 }]
        : [];
</script>

<style scoped>
.badge-icon {
  display: inline-flex;
  filter: drop-shadow(0 4px 8px rgb(28 28 30 / 18%));
  transition: transform 0.2s;
}

.badge-icon--locked {
  filter: none;
  opacity: 0.9;
}
</style>
