<template>
  <div
    class="achievement-badge-container"
    :class="{ 'animate': isAnimating, 'completed': isCompleted }"
    @click="handleClick"
  >
    <!-- 外圈光环 -->
    <div class="badge-glow"></div>
    
    <!-- 主徽章 -->
    <div class="badge-main">
      <!-- 进度圆环 -->
      <svg class="progress-ring" viewBox="0 0 120 120">
        <!-- 背景圆环 -->
        <circle
          class="progress-ring-bg"
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke-width="8"
        />
        <!-- 进度圆环 -->
        <circle
          class="progress-ring-fill"
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke-width="8"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round"
        />
      </svg>
      
      <!-- 徽章内容 -->
      <div class="badge-content">
        <div class="badge-icon">
          <slot name="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </slot>
        </div>
        <div v-if="!isCompleted" class="badge-progress">
          {{ Math.round(progress) }}%
        </div>
      </div>
    </div>
    
    <!-- 粒子效果 -->
    <div v-if="isAnimating" class="particles">
      <div v-for="n in 12" :key="n" class="particle" :style="getParticleStyle(n)"></div>
    </div>
    
    <!-- 徽章信息 -->
    <div class="badge-info">
      <h3 class="badge-name">{{ name }}</h3>
      <p class="badge-description">{{ description }}</p>
      <div v-if="!isCompleted" class="badge-status">
        进度: {{ currentValue }} / {{ targetValue }} {{ unit }}
      </div>
      <div v-else class="badge-status completed">
        已完成！
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  name: string;
  description: string;
  icon?: string;
  currentValue: number;
  targetValue: number;
  unit?: string;
  isCompleted?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  isCompleted: false,
  size: 120,
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'completed'): void;
}>();

const isAnimating = ref(false);
const wasCompleted = ref(props.isCompleted);

// 圆环周长
const circumference = 2 * Math.PI * 54;

// 计算进度
const progress = computed(() => {
  if (props.isCompleted) return 100;
  return Math.min((props.currentValue / props.targetValue) * 100, 100);
});

// 计算 stroke-dashoffset
const strokeDashoffset = computed(() => {
  return circumference - (progress.value / 100) * circumference;
});

// 监听完成状态变化
watch(() => props.isCompleted, (newVal, oldVal) => {
  if (newVal && !oldVal && !wasCompleted.value) {
    isAnimating.value = true;
    wasCompleted.value = true;
    emit('completed');
    
    // 动画结束后重置
    setTimeout(() => {
      isAnimating.value = false;
    }, 2000);
  }
});

// 生成粒子样式
const getParticleStyle = (index: number) => {
  const angle = (index - 1) * 30;
  const delay = (index - 1) * 0.05;
  return {
    transform: `rotate(${angle}deg) translateY(-60px)`,
    animationDelay: `${delay}s`,
  };
};

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.achievement-badge-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.achievement-badge-container:hover {
  transform: scale(1.02);
}

.achievement-badge-container.completed {
  animation: badge-completed 0.6s ease;
}

/* 光环效果 */
.badge-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.achievement-badge-container:hover .badge-glow,
.achievement-badge-container.completed .badge-glow {
  opacity: 1;
  animation: pulse-glow 2s infinite;
}

/* 主徽章 */
.badge-main {
  position: relative;
  width: 120px;
  height: 120px;
}

/* 进度圆环 */
.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: #e5e7eb;
}

.progress-ring-fill {
  stroke: #3b82f6;
  transition: stroke-dashoffset 0.5s ease;
}

.achievement-badge-container.completed .progress-ring-fill {
  stroke: #10b981;
}

/* 徽章内容 */
.badge-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.achievement-badge-container.completed .badge-content {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.badge-icon {
  width: 40px;
  height: 40px;
  color: #3b82f6;
}

.achievement-badge-container.completed .badge-icon {
  color: #10b981;
  animation: icon-bounce 0.6s ease;
}

.badge-icon svg {
  width: 100%;
  height: 100%;
}

.badge-progress {
  margin-top: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #6b7280;
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  margin-left: -3px;
  margin-top: -3px;
  animation: particle-explode 1s ease-out forwards;
}

/* 徽章信息 */
.badge-info {
  margin-top: 16px;
  text-align: center;
}

.badge-name {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.badge-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px 0;
  max-width: 200px;
}

.badge-status {
  font-size: 12px;
  color: #9ca3af;
}

.badge-status.completed {
  color: #10b981;
  font-weight: bold;
  animation: status-pulse 1s ease infinite;
}

/* 动画定义 */
@keyframes badge-completed {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}

@keyframes icon-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes particle-explode {
  0% {
    opacity: 1;
    transform: rotate(var(--rotation, 0deg)) translateY(-60px) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--rotation, 0deg)) translateY(-100px) scale(0);
  }
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .badge-name {
    color: #f9fafb;
  }
  
  .badge-description {
    color: #9ca3af;
  }
  
  .badge-content {
    background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
  }
  
  .achievement-badge-container.completed .badge-content {
    background: linear-gradient(135deg, #064e3b 0%, #059669 100%);
  }
  
  .progress-ring-bg {
    stroke: #374151;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .badge-main {
    width: 100px;
    height: 100px;
  }
  
  .badge-content {
    width: 75px;
    height: 75px;
  }
  
  .badge-icon {
    width: 32px;
    height: 32px;
  }
  
  .badge-name {
    font-size: 14px;
  }
  
  .badge-description {
    font-size: 12px;
  }
}
</style>
