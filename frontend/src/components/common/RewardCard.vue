<template>
  <div
    class="reward-card"
    :class="{ 'insufficient': !canAfford, 'redeemed': isRedeemed }"
    @click="handleClick"
  >
    <!-- 奖励图标 -->
    <div class="reward-icon" :class="typeClass">
      <slot name="icon">
        <svg v-if="type === 'physical'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <svg v-else-if="type === 'virtual'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <svg v-else-if="type === 'activity'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </slot>
    </div>

    <!-- 奖励信息 -->
    <div class="reward-info">
      <h3 class="reward-name">{{ name }}</h3>
      <p class="reward-description">{{ description }}</p>
      
      <!-- 积分消耗 -->
      <div class="reward-cost">
        <span class="points">{{ pointsCost }}</span>
        <span class="label">积分</span>
      </div>

      <!-- 阶梯价格提示（游戏时间） -->
      <div v-if="tieredPricing" class="tiered-pricing">
        <p class="tiered-hint">连续兑换价格递增</p>
        <div class="tier-list">
          <div v-for="(cost, hours) in tieredPricing" :key="hours" class="tier-item">
            <span class="hours">{{ hours }}小时</span>
            <span class="cost">{{ cost }}分</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 兑换按钮 -->
    <button
      class="redeem-btn"
      :disabled="!canAfford || isRedeemed"
      @click.stop="handleRedeem"
    >
      <span v-if="isRedeemed">已兑换</span>
      <span v-else-if="!canAfford">积分不足</span>
      <span v-else>立即兑换</span>
    </button>

    <!-- 库存提示 -->
    <div v-if="stock !== undefined && stock !== null" class="stock-hint">
      剩余: {{ stock }}个
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name: string;
  description: string;
  type: 'physical' | 'virtual' | 'activity' | 'cash';
  pointsCost: number;
  userPoints: number;
  stock?: number;
  tieredPricing?: Record<string, number>;
  isRedeemed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  stock: undefined,
  tieredPricing: undefined,
  isRedeemed: false,
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'redeem'): void;
}>();

// 计算是否可以兑换
const canAfford = computed(() => {
  return props.userPoints >= props.pointsCost;
});

// 根据类型返回样式类
const typeClass = computed(() => {
  return `type-${props.type}`;
});

const handleClick = () => {
  emit('click');
};

const handleRedeem = () => {
  if (canAfford.value && !props.isRedeemed) {
    emit('redeem');
  }
};
</script>

<style scoped>
.reward-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.reward-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.reward-card.insufficient {
  opacity: 0.7;
}

.reward-card.redeemed {
  background: #f0fdf4;
  border: 2px solid #86efac;
}

/* 奖励图标 */
.reward-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.reward-icon svg {
  width: 32px;
  height: 32px;
}

.type-physical {
  background: #dbeafe;
  color: #2563eb;
}

.type-virtual {
  background: #fce7f3;
  color: #db2777;
}

.type-activity {
  background: #d1fae5;
  color: #059669;
}

.type-cash {
  background: #fef3c7;
  color: #d97706;
}

/* 奖励信息 */
.reward-info {
  margin-bottom: 16px;
}

.reward-name {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.reward-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

/* 积分消耗 */
.reward-cost {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.reward-cost .points {
  font-size: 24px;
  font-weight: bold;
  color: #f59e0b;
}

.reward-cost .label {
  font-size: 14px;
  color: #9ca3af;
}

/* 阶梯价格 */
.tiered-pricing {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
}

.tiered-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 8px 0;
}

.tier-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tier-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 11px;
}

.tier-item .hours {
  color: #6b7280;
}

.tier-item .cost {
  color: #f59e0b;
  font-weight: bold;
}

/* 兑换按钮 */
.redeem-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.redeem-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: scale(1.02);
}

.redeem-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* 库存提示 */
.stock-hint {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .reward-card {
    background: #1f2937;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .reward-name {
    color: #f9fafb;
  }

  .reward-description {
    color: #9ca3af;
  }

  .tiered-pricing {
    border-top-color: #374151;
  }

  .tier-item {
    background: #374151;
  }

  .stock-hint {
    background: #374151;
    color: #9ca3af;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .reward-card {
    padding: 16px;
  }

  .reward-icon {
    width: 48px;
    height: 48px;
  }

  .reward-icon svg {
    width: 24px;
    height: 24px;
  }

  .reward-name {
    font-size: 16px;
  }

  .reward-description {
    font-size: 13px;
  }
}
</style>
