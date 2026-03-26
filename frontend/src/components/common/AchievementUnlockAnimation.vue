<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="shouldShow" class="achievement-unlock-overlay" @click="close">
        <!-- 背景光环 -->
        <div class="glow-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>

        <!-- 粒子爆炸效果 -->
        <div class="particles-container">
          <div
            v-for="n in 30"
            :key="n"
            class="particle"
            :style="getParticleStyle(n)"
          ></div>
        </div>

        <!-- 主内容 -->
        <div class="achievement-content" @click.stop>
          <!-- 徽章容器 -->
          <div class="badge-container" :class="{ 'animate': isAnimating }">
            <!-- 外圈光环 -->
            <div class="outer-glow"></div>
            
            <!-- 主徽章 -->
            <div class="main-badge">
              <!-- 旋转的光环 -->
              <svg class="rotating-ring" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fbbf24" />
                    <stop offset="50%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#d97706" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#gradient)"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-dasharray="20 10"
                />
              </svg>

              <!-- 徽章背景 -->
              <div class="badge-bg">
                <div class="badge-icon">{{ currentAchievement?.icon || currentAchievement?.iconUrl || '🏆' }}</div>
              </div>

              <!-- 星星装饰 -->
              <div class="stars">
                <span v-for="n in 6" :key="n" class="star" :style="getStarStyle(n)">✨</span>
              </div>
            </div>
          </div>

          <!-- 文字内容 -->
          <div class="text-content" :class="{ 'animate': isAnimating }">
            <h2 class="unlock-title">恭喜获得成就！</h2>
            <h3 class="achievement-name">{{ currentAchievement?.name }}</h3>
            <p class="achievement-description">{{ currentAchievement?.description }}</p>
            <div v-if="currentAchievement?.rewardPoints" class="reward-points">
              <span class="points-icon">💎</span>
              <span class="points-value">+{{ currentAchievement.rewardPoints }}</span>
              <span class="points-label">积分</span>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button class="close-btn" @click="close">
            <span>太棒了！</span>
          </button>
        </div>

        <!-- 彩带效果 -->
        <div class="confetti-container">
          <div
            v-for="n in 50"
            :key="`confetti-${n}`"
            class="confetti"
            :style="getConfettiStyle(n)"
          ></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';

interface Achievement {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  rewardPoints?: number;
}

interface Props {
  show?: boolean;
  achievement?: Achievement | null;
  achievements?: Achievement[];
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

const currentAchievement = computed(() => {
  if (props.achievement) return props.achievement;
  if (props.achievements && props.achievements.length > 0) return props.achievements[0];
  return null;
});

const shouldShow = computed(() => {
  return props.show || (props.achievements && props.achievements.length > 0);
});

watch(shouldShow, async (newVal) => {
  if (newVal) {
    isAnimating.value = false;
    await nextTick();
    setTimeout(() => {
      isAnimating.value = true;
    }, 50);
  } else {
    isAnimating.value = false;
  }
});

// 生成粒子样式
const getParticleStyle = (index: number) => {
  const angle = (index - 1) * (360 / 30);
  const size = 4 + Math.random() * 8;
  const delay = Math.random() * 0.5;
  const duration = 1 + Math.random() * 1;
  const colors = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fbbf24'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    width: `${size}px`,
    height: `${size}px`,
    background: color,
    boxShadow: `0 0 ${size * 2}px ${color}`,
    transform: `rotate(${angle}deg) translateY(0)`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
};

// 生成星星样式
const getStarStyle = (index: number) => {
  const angle = (index - 1) * 60;
  const distance = 120;
  const delay = 0.5 + index * 0.1;

  return {
    transform: `rotate(${angle}deg) translateY(-${distance}px)`,
    animationDelay: `${delay}s`,
  };
};

// 生成彩带样式
const getConfettiStyle = (index: number) => {
  const colors = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#ef4444', '#22c55e', '#3b82f6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 2;
  const size = 6 + Math.random() * 6;

  return {
    left: `${left}%`,
    backgroundColor: color,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.achievement-unlock-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  overflow: hidden;
}

/* 背景光环 */
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
  border: 2px solid rgba(251, 191, 36, 0.3);
}

.ring-1 {
  width: 300px;
  height: 300px;
  animation: pulse-ring 2s ease-out infinite;
}

.ring-2 {
  width: 400px;
  height: 400px;
  animation: pulse-ring 2s ease-out infinite 0.3s;
}

.ring-3 {
  width: 500px;
  height: 500px;
  animation: pulse-ring 2s ease-out infinite 0.6s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 粒子效果 */
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
    transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--rotation, 0deg)) translateY(-200px) scale(0);
  }
}

/* 主内容 */
.achievement-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

/* 徽章容器 */
.badge-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 40px;
  transform: scale(0);
  opacity: 0;
}

.badge-container.animate {
  animation: badge-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes badge-entrance {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  70% {
    transform: scale(0.9) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 外圈光环 */
.outer-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 主徽章 */
.main-badge {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 旋转光环 */
.rotating-ring {
  position: absolute;
  inset: 0;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 徽章背景 */
.badge-bg {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 10px 40px rgba(251, 191, 36, 0.5),
    inset 0 -5px 20px rgba(0, 0, 0, 0.2),
    inset 0 5px 20px rgba(255, 255, 255, 0.3);
  animation: badge-shine 3s ease-in-out infinite;
}

@keyframes badge-shine {
  0%, 100% {
    box-shadow: 
      0 10px 40px rgba(251, 191, 36, 0.5),
      inset 0 -5px 20px rgba(0, 0, 0, 0.2),
      inset 0 5px 20px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 
      0 20px 60px rgba(251, 191, 36, 0.7),
      inset 0 -5px 20px rgba(0, 0, 0, 0.2),
      inset 0 5px 20px rgba(255, 255, 255, 0.5);
  }
}

.badge-icon {
  font-size: 80px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: icon-bounce 2s ease-in-out infinite;
}

@keyframes icon-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 星星装饰 */
.stars {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star {
  position: absolute;
  font-size: 24px;
  opacity: 0;
  animation: star-appear 0.5s ease-out forwards;
}

@keyframes star-appear {
  0% {
    opacity: 0;
    transform: rotate(var(--rotation, 0deg)) translateY(-80px) scale(0);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--rotation, 0deg)) translateY(-120px) scale(1);
  }
}

/* 文字内容 */
.text-content {
  opacity: 0;
  transform: translateY(30px);
}

.text-content.animate {
  animation: text-entrance 0.6s ease-out 0.5s forwards;
}

@keyframes text-entrance {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.unlock-title {
  font-size: 28px;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 16px;
  text-shadow: 0 2px 10px rgba(251, 191, 36, 0.5);
}

.achievement-name {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
}

.achievement-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
  line-height: 1.5;
}

/* 奖励积分 */
.reward-points {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  padding: 12px 24px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
  animation: points-pulse 2s ease-in-out infinite;
}

@keyframes points-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(34, 197, 94, 0.6);
  }
}

.points-icon {
  font-size: 24px;
}

.points-value {
  font-size: 28px;
  font-weight: bold;
  color: white;
}

.points-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

/* 关闭按钮 */
.close-btn {
  margin-top: 40px;
  padding: 16px 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: button-entrance 0.5s ease-out 1s forwards;
}

@keyframes button-entrance {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.6);
}

.close-btn:active {
  transform: translateY(0) scale(0.98);
}

/* 彩带效果 */
.confetti-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

/* 过渡动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}

.fade-scale-enter-from .achievement-content,
.fade-scale-leave-to .achievement-content {
  transform: scale(0.8);
}

/* 响应式 */
@media (max-width: 640px) {
  .badge-container {
    width: 150px;
    height: 150px;
  }

  .badge-icon {
    font-size: 60px;
  }

  .unlock-title {
    font-size: 24px;
  }

  .achievement-name {
    font-size: 20px;
  }

  .achievement-description {
    font-size: 14px;
  }

  .points-value {
    font-size: 24px;
  }
}
</style>