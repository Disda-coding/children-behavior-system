<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface DataPoint {
  date: string;
  earned: number;
  deducted: number;
}

interface Props {
  data: DataPoint[];
  width?: number;
  height?: number;
  type?: 'bar' | 'line';
}

const props = withDefaults(defineProps<Props>(), {
  width: 600,
  height: 300,
  type: 'bar'
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);

const drawChart = () => {
  if (!chartCanvas.value) return;
  
  const canvas = chartCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = canvas.width - padding.left - padding.right;
  const chartHeight = canvas.height - padding.top - padding.bottom;
  
  // 计算最大值
  const maxValue = Math.max(
    ...props.data.map(d => Math.max(d.earned, d.deducted)),
    10
  );
  
  // 绘制坐标轴
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  
  // Y轴
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, canvas.height - padding.bottom);
  ctx.stroke();
  
  // X轴
  ctx.beginPath();
  ctx.moveTo(padding.left, canvas.height - padding.bottom);
  ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
  ctx.stroke();
  
  // 绘制Y轴刻度和标签
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const y = padding.top + (chartHeight / ySteps) * i;
    const value = Math.round(maxValue - (maxValue / ySteps) * i);
    
    ctx.fillText(value.toString(), padding.left - 10, y + 4);
    
    // 网格线
    if (i > 0) {
      ctx.strokeStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();
    }
  }
  
  // 绘制数据
  const barWidth = chartWidth / props.data.length * 0.6;
  const barSpacing = chartWidth / props.data.length;
  
  props.data.forEach((item, index) => {
    const x = padding.left + barSpacing * index + barSpacing * 0.2;
    
    // 绘制获得积分（绿色）
    const earnedHeight = (item.earned / maxValue) * chartHeight;
    const earnedY = canvas.height - padding.bottom - earnedHeight;
    
    ctx.fillStyle = '#10b981';
    if (props.type === 'bar') {
      ctx.fillRect(x, earnedY, barWidth / 2 - 2, earnedHeight);
    } else {
      // 线条图
      if (index === 0) {
        ctx.beginPath();
        ctx.moveTo(x + barWidth / 4, earnedY);
      } else {
        const prevX = padding.left + barSpacing * (index - 1) + barSpacing * 0.2 + barWidth / 4;
        const prevHeight = ((props.data[index - 1]?.earned || 0) / maxValue) * chartHeight;
        const prevY = canvas.height - padding.bottom - prevHeight;
        ctx.lineTo(x + barWidth / 4, earnedY);
      }
    }
    
    // 绘制扣除积分（红色）
    const deductedHeight = (item.deducted / maxValue) * chartHeight;
    const deductedY = canvas.height - padding.bottom - deductedHeight;
    
    ctx.fillStyle = '#ef4444';
    if (props.type === 'bar') {
      ctx.fillRect(x + barWidth / 2 + 2, deductedY, barWidth / 2 - 2, deductedHeight);
    }
    
    // X轴标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    const date = new Date(item.date);
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    ctx.fillText(label, x + barWidth / 2, canvas.height - padding.bottom + 20);
  });
  
  // 绘制线条（如果是线条图）
  if (props.type === 'line') {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // 绘制图例
  const legendY = 20;
  
  // 获得积分图例
  ctx.fillStyle = '#10b981';
  ctx.fillRect(canvas.width - 150, legendY - 8, 12, 12);
  ctx.fillStyle = '#374151';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('获得积分', canvas.width - 135, legendY);
  
  // 扣除积分图例
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(canvas.width - 150, legendY + 12, 12, 12);
  ctx.fillStyle = '#374151';
  ctx.fillText('扣除积分', canvas.width - 135, legendY + 20);
  
  // 标题
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('积分变化趋势', canvas.width / 2, 20);
};

onMounted(() => {
  drawChart();
});

watch(() => props.data, () => {
  drawChart();
}, { deep: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
  overflow-x: auto;
}

canvas {
  max-width: 100%;
}
</style>
