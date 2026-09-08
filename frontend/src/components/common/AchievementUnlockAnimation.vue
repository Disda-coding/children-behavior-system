<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div
        v-if="shouldShow"
        class="unlock-overlay"
        :style="{ '--tier-glow': palette.glow, '--tier-color': palette.main }"
        @click="close"
      >
        <!-- 背景光环 -->
        <div class="glow-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>

        <!-- 放射粒子 -->
        <div class="particles-container">
          <div v-for="n in 32" :key="n" class="particle" :style="getParticleStyle(n)"></div>
        </div>

        <!-- 彩带 -->
        <div class="confetti-container">
          <div
            v-for="n in 24"
            :key="`confetti-${n}`"
            class="confetti"
            :style="getConfettiStyle()"
          ></div>
        </div>

        <!-- 主内容 -->
        <div class="achievement-content" @click.stop>
          <div class="badge-container" :class="{ animate: isAnimating }">
            <div class="outer-glow"></div>

            <div class="main-badge">
              <!-- 旋转虚线光环 -->
              <svg class="rotating-ring" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" :stop-color="palette.light" />
                    <stop offset="100%" :stop-color="palette.dark" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="none"
                  stroke="url(#ring-gradient)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-dasharray="18 12"
                />
              </svg>

              <!-- 徽章：复用四档质感 SVG 徽章组件 -->
              <div class="badge-core">
                <BadgeIcon :tier="tier" :size="128" />
              </div>

              <!-- 星星装饰 -->
              <div class="stars">
                <span v-for="n in 6" :key="n" class="star" :style="getStarStyle(n)">✦</span>
              </div>
            </div>
          </div>

          <div class="text-content" :class="{ animate: isAnimating }">
            <h2 class="unlock-title">{{ currentItem?.title || '恭喜获得成就！' }}</h2>
            <h3 class="achievement-name">{{ currentItem?.name }}</h3>
            <p v-if="currentItem?.description" class="achievement-description">
              {{ currentItem.description }}
            </p>
            <div v-if="currentItem?.points" class="reward-points">
              <span class="points-value">+{{ currentItem.points }}</span>
              <span class="points-label">积分</span>
            </div>
          </div>

          <button class="close-btn" :class="{ animate: isAnimating }" @click="close">
            <span>太棒了！</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import BadgeIcon, { type Tier } from '@/components/child/BadgeIcon.vue';

interface CelebrationItem {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  points?: number;
  rewardPoints?: number;
  title?: string;
  tier?: Tier;
}

interface Props {
  show?: boolean;
  achievement?: CelebrationItem | null;
  achievements?: CelebrationItem[];
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  achievement: null,
  achievements: () => [],
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isAnimating = ref(false);

const currentItem = computed<CelebrationItem | null>(() => {
  if (props.achievement) return props.achievement;
  if (props.achievements && props.achievements.length > 0) return props.achievements[0] ?? null;
  return null;
});

const tier = computed<Tier>(() => currentItem.value?.tier || 'gold');

/** 档次色系：光环、标题、旋转环配色随徽章档次变化 */
const TIER_PALETTES: Record<Tier, { main: string; light: string; dark: string; glow: string }> = {
  copper: { main: '#e89a6a', light: '#f7c9a8', dark: '#a05a30', glow: 'rgba(232, 154, 106, 0.45)' },
  silver: { main: '#c3ccd6', light: '#eef2f6', dark: '#8894a2', glow: 'rgba(195, 204, 214, 0.45)' },
  gold: { main: '#ffd24d', light: '#ffe9a3', dark: '#d9a40e', glow: 'rgba(255, 210, 77, 0.45)' },
  platinum: { main: '#b99af0', light: '#e2d2ff', dark: '#7c55c4', glow: 'rgba(185, 154, 240, 0.5)' },
};

const palette = computed(() => TIER_PALETTES[tier.value]);

const shouldShow = computed(() => {
  return props.show || (props.achievements && props.achievements.length > 0);
});

watch(shouldShow, async (newVal) => {
  if (newVal) {
    isAnimating.value = false;
    await nextTick();
    setTimeout(() => {
      isAnimating.value = true;
    }, 60);
  } else {
    isAnimating.value = false;
  }
});

/**
 * 放射粒子：通过 CSS 变量 --rotation 控制方向（内联 transform 会与
 * keyframe 冲突导致全部直线上升，旧实现即踩了这个坑）
 */
const getParticleStyle = (index: number) => {
  const angle = (index - 1) * (360 / 32) + Math.random() * 10;
  const size = 4 + Math.random() * 8;
  const delay = Math.random() * 0.4;
  const duration = 1 + Math.random() * 1;
  const distance = 140 + Math.random() * 120;
  const colors = [palette.value.main, palette.value.light, '#ffffff', palette.value.dark];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    width: `${size}px`,
    height: `${size}px`,
    background: color,
    boxShadow: `0 0 ${size * 2}px ${color}`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    '--rotation': `${angle}deg`,
    '--distance': `${distance}px`,
  } as Record<string, string>;
};

const getStarStyle = (index: number) => {
  const angle = (index - 1) * 60;
  const distance = 115 + (index % 2) * 14;
  const delay = 0.55 + index * 0.09;

  return {
    animationDelay: `${delay}s`,
    '--rotation': `${angle}deg`,
    '--distance': `${distance}px`,
  } as Record<string, string>;
};

const getConfettiStyle = () => {
  const colors = [palette.value.main, palette.value.light, palette.value.dark, '#ffffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const delay = Math.random() * 1.2;
  const duration = 2.4 + Math.random() * 1.6;
  const width = 6 + Math.random() * 5;
  const rotate = Math.random() * 360;

  return {
    left: `${left}%`,
    backgroundColor: color,
    width: `${width}px`,
    height: `${width * 0.45}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    transform: `rotate(${rotate}deg)`,
    borderRadius: '2px',
  } as Record<string, string>;
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.unlock-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(12, 10, 16, 0.88) 0%, rgba(12, 10, 16, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  overflow: hidden;
}

/* ---------- 背景光环 ---------- */
.glow-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid var(--tier-glow, rgba(255, 210, 77, 0.3));
}

.ring-1 {
  width: 300px;
  height: 300px;
  animation: pulse-ring 2.2s ease-out infinite;
}

.ring-2 {
  width: 400px;
  height: 400px;
  animation: pulse-ring 2.2s ease-out infinite 0.35s;
}

.ring-3 {
  width: 500px;
  height: 500px;
  animation: pulse-ring 2.2s ease-out infinite 0.7s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.75);
    opacity: 1;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

/* ---------- 放射粒子 ---------- */
.particles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  top: 0;
  left: 0;
  animation: particle-explode ease-out forwards;
}

@keyframes particle-explode {
  0% {
    opacity: 1;
    transform: rotate(var(--rotation)) translateY(0) scale(1);
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--rotation)) translateY(calc(var(--distance) * -1)) scale(0.2);
  }
}

/* ---------- 彩带 ---------- */
.confetti-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: -12px;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(105vh) rotate(720deg);
  }
}

/* ---------- 主内容 ---------- */
.achievement-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.badge-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 36px;
  transform: scale(0);
  opacity: 0;
}

.badge-container.animate {
  animation: badge-entrance 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes badge-entrance {
  0% {
    transform: scale(0) rotate(-160deg);
    opacity: 0;
  }
  55% {
    transform: scale(1.18) rotate(8deg);
  }
  72% {
    transform: scale(0.92) rotate(-4deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.outer-glow {
  position: absolute;
  inset: -24px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--tier-glow) 0%, transparent 70%);
  animation: glow-pulse 2.2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}

.main-badge {
  position: relative;
  width: 100%;
  height: 100%;
}

.rotating-ring {
  position: absolute;
  inset: 0;
  animation: rotate 12s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.badge-core {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: core-breathe 2.4s ease-in-out infinite;
}

@keyframes core-breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.stars {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star {
  position: absolute;
  font-size: 20px;
  color: var(--tier-color, #ffd24d);
  text-shadow: 0 0 8px var(--tier-glow);
  opacity: 0;
  animation: star-appear 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes star-appear {
  0% {
    opacity: 0;
    transform: rotate(var(--rotation)) translateY(-70px) scale(0);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--rotation)) translateY(calc(var(--distance) * -1)) scale(1);
  }
}

/* ---------- 文字 ---------- */
.text-content {
  opacity: 0;
  transform: translateY(28px);
}

.text-content.animate {
  animation: text-entrance 0.55s ease-out 0.45s forwards;
}

@keyframes text-entrance {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.unlock-title {
  font-size: 27px;
  font-weight: 800;
  color: var(--tier-color, #ffd24d);
  margin-bottom: 14px;
  text-shadow: 0 2px 12px var(--tier-glow);
  letter-spacing: 0.02em;
}

.achievement-name {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
}

.achievement-description {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 22px;
  line-height: 1.55;
}

.reward-points {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  padding: 10px 24px;
  border-radius: 50px;
  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.45);
  animation: points-pulse 2s ease-in-out infinite;
}

.points-value {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.points-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

@keyframes points-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

/* ---------- 关闭按钮 ---------- */
.close-btn {
  margin-top: 30px;
  padding: 13px 46px;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, var(--tier-color, #ffd24d) 0%, var(--tier-glow, #ffd24d) 100%);
  color: #1c1206;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 22px var(--tier-glow);
  transition:
    transform 0.15s,
    box-shadow 0.2s;
  opacity: 0;
}

.close-btn.animate {
  animation: text-entrance 0.5s ease-out 0.9s forwards;
}

.close-btn:hover {
  transform: translateY(-2px) scale(1.03);
}

.close-btn:active {
  transform: scale(0.97);
}

/* ---------- 弹层过渡 ---------- */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}

/* ---------- 无障碍：减少动效 ---------- */
@media (prefers-reduced-motion: reduce) {
  .ring,
  .particle,
  .confetti,
  .outer-glow,
  .rotating-ring,
  .core-breathe,
  .reward-points,
  .star {
    animation: none !important;
  }

  .particle,
  .confetti,
  .star {
    display: none;
  }

  .badge-container.animate,
  .text-content.animate,
  .close-btn.animate {
    animation-duration: 0.01s !important;
    animation-delay: 0s !important;
  }
}
</style>
