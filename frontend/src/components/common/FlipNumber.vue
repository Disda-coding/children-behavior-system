<template>
  <div class="flip-number-container" :style="{ fontSize: size + 'px' }">
    <div
      v-for="(digit, index) in digits"
      :key="index"
      class="flip-digit"
      :class="{ 'animate': animatingIndices.has(index) }"
    >
      <div class="flip-digit-inner">
        <div class="flip-digit-front">{{ digit }}</div>
        <div class="flip-digit-back">{{ previousDigits[index] || '0' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Props {
  value: number;
  size?: number;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  duration: 600,
});

const previousValue = ref(props.value);
const animatingIndices = ref(new Set<number>());

// 将数字转换为数字数组
const digits = computed(() => {
  return props.value.toString().split('').map(Number);
});

const previousDigits = computed(() => {
  return previousValue.value.toString().split('').map(Number);
});

// 监听数值变化
watch(() => props.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    const newDigits = newVal.toString().split('');
    const oldDigits = oldVal.toString().split('');
    
    // 找出变化的位数
    const maxLen = Math.max(newDigits.length, oldDigits.length);
    const changedIndices = new Set<number>();
    
    for (let i = 0; i < maxLen; i++) {
      const newDigit = newDigits[newDigits.length - 1 - i];
      const oldDigit = oldDigits[oldDigits.length - 1 - i];
      
      if (newDigit !== oldDigit) {
        changedIndices.add(maxLen - 1 - i);
      }
    }
    
    // 触发动画
    animatingIndices.value = changedIndices;
    
    // 动画结束后清除状态
    setTimeout(() => {
      animatingIndices.value = new Set();
      previousValue.value = newVal;
    }, props.duration);
  }
}, { immediate: true });
</script>

<style scoped>
.flip-number-container {
  display: inline-flex;
  gap: 4px;
  perspective: 1000px;
}

.flip-digit {
  position: relative;
  width: 1em;
  height: 1.4em;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

.flip-digit-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #333;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-digit.animate .flip-digit-inner {
  animation: flip-animation 0.6s ease-in-out;
}

.flip-digit-front,
.flip-digit-back {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
}

.flip-digit-back {
  transform: rotateX(180deg);
}

@keyframes flip-animation {
  0% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(-90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .flip-digit {
    background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .flip-digit-front,
  .flip-digit-back {
    background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
    color: #e2e8f0;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .flip-number-container {
    gap: 2px;
  }
  
  .flip-digit {
    border-radius: 4px;
  }
}
</style>
