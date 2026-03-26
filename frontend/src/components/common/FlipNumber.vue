<template>
  <div class="flip-number-container" :style="containerStyle">
    <div
      v-for="(digit, index) in displayDigits"
      :key="index"
      class="flip-digit"
      :class="{ 
        'animate': animatingIndices.has(index),
        'increasing': changeType === 'increase',
        'decreasing': changeType === 'decrease'
      }"
      :style="digitStyle"
    >
      <div class="flip-digit-inner" :style="innerStyle">
        <!-- 上半部分 -->
        <div class="flip-digit-top" :style="topStyle">
          <span class="digit-text">{{ digit }}</span>
        </div>
        <!-- 下半部分 -->
        <div class="flip-digit-bottom" :style="bottomStyle">
          <span class="digit-text">{{ digit }}</span>
        </div>
        <!-- 动画翻转的上半部分 -->
        <div 
          class="flip-digit-flip-top" 
          :style="flipTopStyle"
          :class="{ 'flipping': animatingIndices.has(index) }"
        >
          <span class="digit-text">{{ previousDigits[index] || '0' }}</span>
        </div>
        <!-- 动画翻转的下半部分 -->
        <div 
          class="flip-digit-flip-bottom" 
          :style="flipBottomStyle"
          :class="{ 'flipping': animatingIndices.has(index) }"
        >
          <span class="digit-text">{{ digit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';

interface Props {
  value: number;
  size?: number;
  duration?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  duration: 800,
  color: 'inherit',
});

const emit = defineEmits<{
  (e: 'change', change: number): void;
}>();

const previousValue = ref(props.value);
const displayValue = ref(props.value);
const animatingIndices = ref(new Set<number>());
const changeType = ref<'increase' | 'decrease' | null>(null);

// 样式计算
const containerStyle = computed(() => ({
  fontSize: `${props.size}px`,
  color: props.color,
}));

const digitStyle = computed(() => ({
  width: `${props.size * 0.7}px`,
  height: `${props.size * 1.2}px`,
}));

const innerStyle = computed(() => ({
  fontSize: `${props.size}px`,
  lineHeight: `${props.size * 1.2}px`,
}));

const topStyle = computed(() => ({
  height: `${props.size * 0.6}px`,
  lineHeight: `${props.size * 1.2}px`,
  borderRadius: `${props.size * 0.15}px ${props.size * 0.15}px 0 0`,
}));

const bottomStyle = computed(() => ({
  height: `${props.size * 0.6}px`,
  lineHeight: `${props.size * 1.2}px`,
  top: `${props.size * 0.6}px`,
  borderRadius: `0 0 ${props.size * 0.15}px ${props.size * 0.15}px`,
}));

const flipTopStyle = computed(() => ({
  height: `${props.size * 0.6}px`,
  lineHeight: `${props.size * 1.2}px`,
  borderRadius: `${props.size * 0.15}px ${props.size * 0.15}px 0 0`,
  transformOrigin: 'bottom',
  transitionDuration: `${props.duration}ms`,
}));

const flipBottomStyle = computed(() => ({
  height: `${props.size * 0.6}px`,
  lineHeight: `${props.size * 1.2}px`,
  top: `${props.size * 0.6}px`,
  borderRadius: `0 0 ${props.size * 0.15}px ${props.size * 0.15}px`,
  transformOrigin: 'top',
  transitionDuration: `${props.duration}ms`,
}));

// 将数字转换为数字数组，保持位数一致
const displayDigits = computed(() => {
  return displayValue.value.toString().padStart(previousValue.value.toString().length, '0').split('').map(Number);
});

const previousDigits = computed(() => {
  return previousValue.value.toString().padStart(displayValue.value.toString().length, '0').split('').map(Number);
});

// 监听数值变化
watch(() => props.value, async (newVal, oldVal) => {
  if (newVal === oldVal || oldVal === undefined) {
    displayValue.value = newVal;
    previousValue.value = newVal;
    return;
  }

  // 确定变化类型
  changeType.value = newVal > oldVal ? 'increase' : 'decrease';
  
  const newDigits = newVal.toString().split('');
  const oldDigits = oldVal.toString().split('');
  
  // 找出变化的位数
  const maxLen = Math.max(newDigits.length, oldDigits.length);
  const changedIndices = new Set<number>();
  
  for (let i = 0; i < maxLen; i++) {
    const newIdx = newDigits.length - 1 - i;
    const oldIdx = oldDigits.length - 1 - i;
    const newDigit = newIdx >= 0 ? newDigits[newIdx] : '0';
    const oldDigit = oldIdx >= 0 ? oldDigits[oldIdx] : '0';
    
    if (newDigit !== oldDigit) {
      changedIndices.add(maxLen - 1 - i);
    }
  }
  
  // 先显示旧值
  displayValue.value = oldVal;
  
  // 等待 DOM 更新
  await nextTick();
  
  // 触发动画
  animatingIndices.value = changedIndices;
  
  // 在动画中途更新显示值
  setTimeout(() => {
    displayValue.value = newVal;
  }, props.duration / 2);
  
  // 动画结束后清除状态
  setTimeout(() => {
    animatingIndices.value = new Set();
    previousValue.value = newVal;
    changeType.value = null;
    emit('change', newVal - oldVal);
  }, props.duration);
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
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

.flip-digit-inner {
  position: relative;
  width: 100%;
  height: 100%;
  font-weight: bold;
  color: #333;
}

.digit-text {
  display: block;
  text-align: center;
}

/* 上半部分 */
.flip-digit-top {
  position: absolute;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.flip-digit-top .digit-text {
  transform: translateY(0);
}

/* 下半部分 */
.flip-digit-bottom {
  position: absolute;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #e9ecef 0%, #dee2e6 100%);
}

.flip-digit-bottom .digit-text {
  transform: translateY(-50%);
}

/* 翻转的上半部分 */
.flip-digit-flip-top {
  position: absolute;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  backface-visibility: hidden;
  z-index: 2;
}

.flip-digit-flip-top .digit-text {
  transform: translateY(0);
}

.flip-digit-flip-top.flipping {
  animation: flip-top var(--duration, 800ms) ease-in forwards;
}

/* 翻转的下半部分 */
.flip-digit-flip-bottom {
  position: absolute;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #e9ecef 0%, #dee2e6 100%);
  backface-visibility: hidden;
  transform: rotateX(90deg);
  z-index: 1;
}

.flip-digit-flip-bottom .digit-text {
  transform: translateY(-50%);
}

.flip-digit-flip-bottom.flipping {
  animation: flip-bottom var(--duration, 800ms) ease-out forwards;
}

/* 增加动画 */
@keyframes flip-top {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-90deg);
  }
}

@keyframes flip-bottom {
  0% {
    transform: rotateX(90deg);
  }
  50% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}

/* 增加状态的颜色变化 */
.flip-digit.increasing {
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 0 10px rgba(34, 197, 94, 0.3);
}

.flip-digit.decreasing {
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 0 10px rgba(239, 68, 68, 0.3);
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .flip-digit {
    background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .flip-digit-inner {
    color: #e2e8f0;
  }
  
  .flip-digit-top {
    background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .flip-digit-bottom {
    background: linear-gradient(180deg, #1a202c 0%, #171923 100%);
  }
  
  .flip-digit-flip-top {
    background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .flip-digit-flip-bottom {
    background: linear-gradient(180deg, #1a202c 0%, #171923 100%);
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
