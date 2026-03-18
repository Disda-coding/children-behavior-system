<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/parent/dashboard" class="text-gray-600 hover:text-gray-800 mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">积分管理</h1>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 积分规则管理 -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">积分规则</h2>
          <button
            @click="showAddRuleModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加规则
          </button>
        </div>

        <div v-if="rules.length === 0" class="text-center py-8 text-gray-500">
          暂无积分规则，点击上方按钮添加
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="rule in rules"
            :key="rule.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div>
              <h3 class="font-medium text-gray-800">{{ rule.name }}</h3>
              <p class="text-sm text-gray-500">{{ rule.description }}</p>
              <span
                :class="[
                  'inline-block px-2 py-1 text-xs rounded mt-2',
                  rule.type === 'earn' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]"
              >
                {{ rule.type === 'earn' ? '奖励' : '扣除' }} {{ rule.points }} 分
              </span>
            </div>
            <button
              @click="deleteRule(rule.id)"
              class="text-red-600 hover:text-red-700"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 积分记录 -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">积分记录</h2>
          <button
            @click="showAddRecordModal = true"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            添加记录
          </button>
        </div>

        <div v-if="records.length === 0" class="text-center py-8 text-gray-500">
          暂无积分记录
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="record in records"
            :key="record.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div>
              <p class="font-medium text-gray-800">{{ record.reason }}</p>
              <p class="text-sm text-gray-500">
                {{ record.displayName }} · {{ formatDate(record.createdAt) }}
              </p>
            </div>
            <span
              :class="[
                'font-bold',
                record.type === 'earn' ? 'text-green-600' : 'text-red-600'
              ]"
            >
              {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
            </span>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加规则弹窗 -->
    <div v-if="showAddRuleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">添加积分规则</h3>
        <form @submit.prevent="addRule" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
            <input
              v-model="newRule.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如：按时完成作业"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <input
              v-model="newRule.description"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              v-model="newRule.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="earn">奖励积分</option>
              <option value="deduct">扣除积分</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">积分</label>
            <input
              v-model.number="newRule.points"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如：10"
            />
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showAddRuleModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加记录弹窗 -->
    <div v-if="showAddRecordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4">添加积分记录</h3>
        <form @submit.prevent="addRecord" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">选择孩子</label>
            <select
              v-model="newRecord.userId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="child in children" :key="child.id" :value="child.id">
                {{ child.displayName }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              v-model="newRecord.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="earn">奖励</option>
              <option value="deduct">扣除</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">积分</label>
            <input
              v-model.number="newRecord.amount"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">原因</label>
            <input
              v-model="newRecord.reason"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如：按时完成作业"
            />
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showAddRecordModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { pointApi, familyApi } from '@/api';

const authStore = useAuthStore();

const rules = ref<any[]>([]);
const records = ref<any[]>([]);
const children = ref<any[]>([]);
const showAddRuleModal = ref(false);
const showAddRecordModal = ref(false);

const newRule = ref({
  name: '',
  description: '',
  type: 'earn' as 'earn' | 'deduct',
  points: 10,
});

const newRecord = ref({
  userId: 0,
  type: 'earn' as 'earn' | 'deduct',
  amount: 10,
  reason: '',
});

const fetchRules = async () => {
  try {
    const response = await pointApi.getRules() as any;
    rules.value = response.rules || [];
  } catch (error) {
    console.error('Failed to fetch rules:', error);
  }
};

const fetchRecords = async () => {
  try {
    const response = await pointApi.getRecords() as any;
    records.value = response.records || [];
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
};

const fetchChildren = async () => {
  try {
    if (authStore.user?.familyId) {
      const response = await familyApi.getFamily(authStore.user.familyId) as any;
      children.value = (response.members || []).filter((m: any) => m.role === 'child');
      if (children.value.length > 0 && !newRecord.value.userId) {
        newRecord.value.userId = children.value[0].id;
      }
    }
  } catch (error) {
    console.error('Failed to fetch children:', error);
  }
};

const addRule = async () => {
  try {
    await pointApi.createRule({
      familyId: authStore.user?.familyId || 0,
      name: newRule.value.name,
      description: newRule.value.description,
      type: newRule.value.type,
      points: newRule.value.points,
    });
    showAddRuleModal.value = false;
    newRule.value = { name: '', description: '', type: 'earn', points: 10 };
    fetchRules();
  } catch (error) {
    console.error('Failed to add rule:', error);
    alert('添加规则失败');
  }
};

const deleteRule = async (id: number) => {
  if (!confirm('确定要删除这个规则吗？')) return;
  try {
    // TODO: 添加删除规则 API
    alert('删除功能开发中');
  } catch (error) {
    console.error('Failed to delete rule:', error);
  }
};

const addRecord = async () => {
  try {
    await pointApi.createRecord({
      userId: newRecord.value.userId,
      type: newRecord.value.type,
      amount: newRecord.value.amount,
      reason: newRecord.value.reason,
      createdBy: authStore.user?.id,
    });
    showAddRecordModal.value = false;
    newRecord.value = { userId: children.value[0]?.id || 0, type: 'earn', amount: 10, reason: '' };
    fetchRecords();
  } catch (error) {
    console.error('Failed to add record:', error);
    alert('添加记录失败');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchRules();
  fetchRecords();
  fetchChildren();
});
</script>
