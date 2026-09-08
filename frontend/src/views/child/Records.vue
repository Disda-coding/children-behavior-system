<template>
  <div class="space-y-4">
    <!-- 汇总条 -->
    <div class="grid grid-cols-3 gap-3">
      <div class="card p-4 text-center">
        <p class="text-xs text-ink-2">当前余额</p>
        <p class="font-display text-2xl font-extrabold text-coral">{{ stats.totalBalance }}</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-xs text-ink-2">累计获得</p>
        <p class="font-display text-2xl font-extrabold text-sprout">+{{ stats.totalEarned }}</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-xs text-ink-2">累计支出</p>
        <p class="font-display text-2xl font-extrabold text-ink-2">-{{ stats.totalSpent }}</p>
      </div>
    </div>

    <!-- 按日分组流水 -->
    <div v-if="groups.length === 0" class="card py-14 text-center text-ink-2">
      还没有积分记录哦
    </div>
    <div v-for="group in groups" :key="group.date" class="card overflow-hidden">
      <div class="flex items-center justify-between border-b border-line bg-ink/[0.015] px-5 py-2.5">
        <span class="text-sm font-semibold text-ink">{{ group.dateLabel }}</span>
        <span class="font-display text-sm font-bold" :class="group.net >= 0 ? 'text-sprout' : 'text-coral'">
          {{ group.net >= 0 ? '+' : '' }}{{ group.net }}
        </span>
      </div>
      <div class="divide-y divide-line">
        <div v-for="record in group.records" :key="record.id" class="flex items-center justify-between px-5 py-3">
          <div class="flex items-center gap-3">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full"
              :class="record.type === 'earn' ? 'bg-sprout/15' : 'bg-coral/10'"
            >
              <CirclePlus v-if="record.type === 'earn'" class="h-4.5 w-4.5 text-sprout" />
              <CircleMinus v-else class="h-4.5 w-4.5 text-coral" />
            </span>
            <div>
              <p class="text-sm font-medium text-ink">{{ record.reason }}</p>
              <p class="text-xs text-ink-2">{{ formatTime(record.createdAt) }}</p>
            </div>
          </div>
          <div class="text-right">
            <span
              class="font-display text-base font-bold"
              :class="record.type === 'earn' ? 'text-sprout' : 'text-coral'"
            >
              {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
            </span>
            <p class="text-[11px] text-ink-2">余额 {{ record.balanceAfter }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CircleMinus, CirclePlus } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { pointApi } from '@/api';

const authStore = useAuthStore();

const records = ref<any[]>([]);
const stats = ref({ totalBalance: 0, totalEarned: 0, totalSpent: 0 });

const groups = computed(() => {
  const map = new Map<string, any[]>();
  for (const record of records.value) {
    const date = (record.createdAt || '').slice(0, 10);
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(record);
  }
  return Array.from(map.entries()).map(([date, list]) => ({
    date,
    dateLabel: new Date(date + 'T12:00:00').toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }),
    records: list,
    net: list.reduce((sum, r) => sum + (r.type === 'earn' ? r.amount : -r.amount), 0),
  }));
});

const loadData = async () => {
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const recordsRes = (await pointApi.getRecords({ userId })) as any;
    records.value = recordsRes.records || [];

    const statsRes = (await pointApi.getStats({ userId })) as any;
    const s = statsRes.stats || {};
    stats.value = {
      totalBalance: s.totalBalance || 0,
      totalEarned: s.totalEarned || 0,
      totalSpent: s.totalSpent || 0,
    };
  } catch (error) {
    console.error('Failed to load records:', error);
  }
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

onMounted(loadData);
</script>
