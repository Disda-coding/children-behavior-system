<template>
  <div class="app-shell min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- 导航栏 -->
    <nav class="app-nav bg-white shadow-sm">
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

    <!-- 主内容区域 -->
    <main class="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 积分规则管理 -->
      <div class="page-section">
        <div class="flex items-center justify-between mb-6">
          <h2 class="section-title mb-0">积分规则</h2>
          <div class="flex items-center gap-2">
            <button
              @click="exportRules"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出
            </button>
            <button
              @click="showImportModal = true"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              导入
            </button>
            <button
              @click="showAddRuleModal = true"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加规则
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div v-if="rules.length === 0" class="text-center py-12 text-gray-500">
            暂无积分规则，点击上方按钮添加
          </div>

          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="rule in rules"
              :key="rule.id"
              class="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :class="rule.type === 'earn' ? 'bg-green-100' : 'bg-red-100'"
                >
                  <span class="text-xl">{{ rule.type === 'earn' ? '💰' : '💸' }}</span>
                </div>
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
              </div>
              <button
                @click="deleteRule(rule.id)"
                class="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速添加积分 -->
      <div class="page-section">
        <h2 class="section-title">快速添加积分</h2>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <form @submit.prevent="quickAddRecord" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择孩子</label>
              <select
                v-model="quickRecord.userId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="child in children" :key="child.id" :value="child.id">
                  {{ child.displayName }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择规则</label>
              <select
                v-model="quickRecord.ruleId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="rule in rules" :key="rule.id" :value="rule.id">
                  {{ rule.name }} ({{ rule.type === 'earn' ? '+' : '-' }}{{ rule.points }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
              <input
                v-model="quickRecord.reason"
                type="text"
                placeholder="可选备注"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="flex items-end">
              <button
                type="submit"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加记录
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 积分记录 -->
      <div class="page-section">
        <h2 class="section-title">积分记录</h2>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div v-if="records.length === 0" class="text-center py-12 text-gray-500">
            暂无积分记录
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="record in records"
              :key="record.id"
              class="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="record.type === 'earn' ? 'bg-green-100' : 'bg-red-100'"
                >
                  <span v-if="record.type === 'earn'">💰</span>
                  <span v-else>💸</span>
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ record.reason }}</p>
                  <p class="text-sm text-gray-500">
                    {{ record.userName }} · {{ formatDate(record.createdAt) }}
                  </p>
                </div>
              </div>
              <span
                :class="[
                  'text-lg font-bold',
                  record.type === 'earn' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加规则弹窗 -->
    <Teleport to="body">
      <div v-if="showAddRuleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showAddRuleModal = false">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md">
          <h3 class="text-xl font-bold text-gray-800 mb-4">添加积分规则</h3>
          <form @submit.prevent="addRule">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">规则名称</label>
                <input
                  v-model="newRule.name"
                  type="text"
                  required
                  placeholder="例如：完成作业"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <input
                  v-model="newRule.description"
                  type="text"
                  placeholder="可选描述"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">类型</label>
                <select
                  v-model="newRule.type"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="earn">奖励积分</option>
                  <option value="deduct">扣除积分</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">积分</label>
                <input
                  v-model.number="newRule.points"
                  type="number"
                  required
                  min="1"
                  placeholder="积分数量"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button
                type="button"
                @click="showAddRuleModal = false"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
    </Teleport>

    <!-- 导入规则弹窗 -->
    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showImportModal = false">
        <div class="bg-white rounded-2xl p-6 w-full max-w-lg">
          <h3 class="text-xl font-bold text-gray-800 mb-4">导入积分规则</h3>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择JSON文件</label>
            <input
              type="file"
              accept=".json"
              @change="onFileChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="text-sm text-gray-500 mt-1">支持从其他家庭导出的积分规则文件</p>
          </div>

          <div v-if="importPreview" class="mb-4">
            <h4 class="font-medium text-gray-800 mb-2">预览</h4>
            <div class="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p class="text-sm text-gray-600">导出日期: {{ importPreview.exportDate }}</p>
              <p class="text-sm text-gray-600">导出家庭: {{ importPreview.familyName || '未知' }}</p>
              <p class="text-sm text-gray-600">规则数量: {{ importPreview.rules?.length || 0 }}</p>
              <div v-if="importPreview.rules" class="mt-2 space-y-1">
                <div v-for="(rule, index) in importPreview.rules.slice(0, 5)" :key="index" class="text-sm">
                  {{ rule.name }} ({{ rule.type === 'earn' ? '+' : '-' }}{{ rule.points }})
                </div>
                <p v-if="importPreview.rules.length > 5" class="text-sm text-gray-500">...还有 {{ importPreview.rules.length - 5 }} 条规则</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showImportModal = false"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmImport"
              :disabled="!importPreview || importLoading"
              class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ importLoading ? '导入中...' : '确认导入' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { pointApi, familyApi, pointRuleConfigApi } from '@/api';

const authStore = useAuthStore();

const rules = ref<any[]>([]);
const records = ref<any[]>([]);
const children = ref<any[]>([]);

const showAddRuleModal = ref(false);
const showImportModal = ref(false);
const importFile = ref<File | null>(null);
const importPreview = ref<any>(null);
const importLoading = ref(false);

const newRule = ref<{
  name: string;
  description: string;
  type: 'earn' | 'deduct';
  points: number;
}>({
  name: '',
  description: '',
  type: 'earn',
  points: 10,
});

const quickRecord = ref({
  userId: null as number | null,
  ruleId: null as number | null,
  reason: '',
});

const fetchRules = async () => {
  try {
    const res = await pointApi.getRules() as any;
    rules.value = res.rules || [];
  } catch (error) {
    console.error('Failed to fetch rules:', error);
  }
};

const fetchRecords = async () => {
  try {
    const res = await pointApi.getRecords() as any;
    records.value = (res.records || []).slice(0, 20);
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
};

const fetchChildren = async () => {
  try {
    const familyId = authStore.user?.familyId;
    if (!familyId) return;

    const res = await familyApi.getFamily(familyId) as any;
    children.value = (res.members || []).filter((m: any) => m.role === 'child');
  } catch (error) {
    console.error('Failed to fetch children:', error);
  }
};

const addRule = async () => {
  try {
    const familyId = authStore.user?.familyId;
    if (!familyId) return;

    await pointApi.createRule({
      familyId,
      ...newRule.value,
    });

    showAddRuleModal.value = false;
    newRule.value = { name: '', description: '', type: 'earn', points: 10 };
    fetchRules();
  } catch (error) {
    console.error('Failed to add rule:', error);
    alert('添加失败');
  }
};

const deleteRule = async (id: number) => {
  if (!confirm('确定要删除这个规则吗？')) return;

  try {
    await pointApi.deleteRule(id);
    fetchRules();
  } catch (error) {
    console.error('Failed to delete rule:', error);
    alert('删除失败');
  }
};

const quickAddRecord = async () => {
  if (!quickRecord.value.userId || !quickRecord.value.ruleId) return;

  try {
    const rule = rules.value.find(r => r.id === quickRecord.value.ruleId);
    if (!rule) return;

    await pointApi.createRecord({
      userId: quickRecord.value.userId,
      type: rule.type,
      amount: rule.points,
      reason: quickRecord.value.reason || rule.name,
      ruleId: rule.id,
    });

    quickRecord.value = { userId: null, ruleId: null, reason: '' };
    fetchRecords();
    alert('添加成功！');
  } catch (error) {
    console.error('Failed to add record:', error);
    alert('添加失败');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const exportRules = async () => {
  try {
    const response = await pointRuleConfigApi.exportRules();
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `point-rules-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    alert('导出成功！');
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出失败');
  }
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    importFile.value = target.files[0];
    previewImportFile();
  }
};

const previewImportFile = () => {
  if (!importFile.value) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target?.result as string);
      importPreview.value = content;
    } catch (error) {
      alert('文件格式错误，请上传有效的JSON文件');
      importFile.value = null;
      importPreview.value = null;
    }
  };
  reader.readAsText(importFile.value);
};

const confirmImport = async () => {
  if (!importPreview.value) return;

  importLoading.value = true;
  try {
    const res = await pointRuleConfigApi.importRules(importPreview.value);
    if (res.success) {
      alert(`成功导入 ${res.importedCount} 条规则`);
      showImportModal.value = false;
      importFile.value = null;
      importPreview.value = null;
      fetchRules();
    } else {
      alert(res.error || '导入失败');
    }
  } catch (error) {
    console.error('导入失败:', error);
    alert('导入失败');
  } finally {
    importLoading.value = false;
  }
};

onMounted(() => {
  fetchRules();
  fetchRecords();
  fetchChildren();
});
</script>
