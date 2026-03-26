<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-xl">💾</span>
          数据备份
        </h1>
        <p class="text-slate-600 mt-2">管理家庭数据备份，支持手动备份和自动备份</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-blue-600">{{ stats.totalCount }}</div>
          <div class="text-sm text-slate-500 mt-1">总备份数</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-green-600">{{ stats.manualCount }}</div>
          <div class="text-sm text-slate-500 mt-1">手动备份</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-purple-600">{{ stats.autoCount }}</div>
          <div class="text-sm text-slate-500 mt-1">自动备份</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-orange-600">{{ formatSize(stats.totalSize) }}</div>
          <div class="text-sm text-slate-500 mt-1">总大小</div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex items-center gap-4">
            <select v-model="filterType" class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部类型</option>
              <option value="manual">手动备份</option>
              <option value="auto">自动备份</option>
            </select>
          </div>
          <button @click="showCreateModal = true" class="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2">
            <span>+</span>
            创建备份
          </button>
        </div>
      </div>

      <!-- 备份列表 -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">备份名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">类型</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">大小</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">记录数</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">创建时间</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="backup in filteredBackups" :key="backup.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3">
                  <div>
                    <p class="font-medium text-slate-800">{{ backup.name }}</p>
                    <p v-if="backup.description" class="text-sm text-slate-500">{{ backup.description }}</p>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span :class="backup.type === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ backup.type === 'manual' ? '手动' : '自动' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span :class="getStatusClass(backup.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusText(backup.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ formatSize(backup.dataSize) }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">
                  <span v-if="backup.recordCounts">{{ getTotalRecords(backup.recordCounts) }} 条</span>
                  <span v-else>-</span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ formatDateTime(backup.createdAt) }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="downloadBackup(backup.id)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="下载">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button @click="restoreBackup(backup.id)" :disabled="backup.status !== 'completed'" class="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="恢复">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button @click="deleteBackup(backup.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 空状态 -->
        <div v-if="backups.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">💾</div>
          <h3 class="text-xl font-bold text-slate-700 mb-2">暂无备份</h3>
          <p class="text-slate-500">点击上方按钮创建您的第一个备份</p>
        </div>
      </div>
    </div>

    <!-- 创建备份弹窗 -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showCreateModal = false">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md">
          <h3 class="text-xl font-bold text-slate-800 mb-4">创建备份</h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-2">备份名称</label>
            <input v-model="newBackup.name" type="text" placeholder="输入备份名称" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-2">描述（可选）</label>
            <textarea v-model="newBackup.description" rows="3" placeholder="输入备份描述" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>

          <div class="bg-blue-50 rounded-xl p-4 mb-4">
            <p class="text-sm text-blue-700">备份将包含以下数据：</p>
            <ul class="text-sm text-blue-600 mt-2 space-y-1">
              <li>• 积分规则和记录</li>
              <li>• 成就定义和用户成就</li>
              <li>• 奖励和兑换记录</li>
              <li>• 申诉和会议记录</li>
              <li>• 通知记录</li>
            </ul>
          </div>

          <div class="flex gap-3">
            <button @click="showCreateModal = false" class="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              取消
            </button>
            <button @click="createBackup" :disabled="!newBackup.name || creating" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ creating ? '创建中...' : '创建备份' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { backupApi } from '../../api';

const backups = ref<any[]>([]);
const stats = ref({
  totalCount: 0,
  manualCount: 0,
  autoCount: 0,
  totalSize: 0,
});
const filterType = ref('');
const showCreateModal = ref(false);
const creating = ref(false);

const newBackup = ref({
  name: '',
  description: '',
});

const filteredBackups = computed(() => {
  if (!filterType.value) return backups.value;
  return backups.value.filter(b => b.type === filterType.value);
});

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    restoring: 'bg-blue-100 text-blue-700',
  };
  return classes[status] || 'bg-slate-100 text-slate-700';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '进行中',
    completed: '已完成',
    failed: '失败',
    restoring: '恢复中',
  };
  return texts[status] || status;
};

const formatSize = (bytes: number) => {
  if (!bytes) return '-';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const getTotalRecords = (recordCounts: any) => {
  if (!recordCounts) return 0;
  return Object.values(recordCounts).reduce((sum: number, count: any) => sum + (count || 0), 0);
};

const fetchBackups = async () => {
  try {
    const res = await backupApi.getBackups();
    if (res.success) {
      backups.value = res.data;
    }
  } catch (error) {
    console.error('获取备份列表失败:', error);
  }
};

const fetchStats = async () => {
  try {
    const res = await backupApi.getBackupStats();
    if (res.success) {
      stats.value = res.data;
    }
  } catch (error) {
    console.error('获取备份统计失败:', error);
  }
};

const createBackup = async () => {
  creating.value = true;
  try {
    const res = await backupApi.createBackup(newBackup.value);
    if (res.success) {
      showCreateModal.value = false;
      newBackup.value = { name: '', description: '' };
      await fetchBackups();
      await fetchStats();
      alert('备份创建成功！');
    }
  } catch (error) {
    console.error('创建备份失败:', error);
    alert('创建备份失败');
  } finally {
    creating.value = false;
  }
};

const downloadBackup = async (id: number) => {
  try {
    const res = await backupApi.downloadBackup(id);
    const blob = new Blob([res], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('下载备份失败:', error);
    alert('下载失败');
  }
};

const restoreBackup = async (id: number) => {
  if (!confirm('确定要恢复这个备份吗？当前数据将被覆盖。')) return;
  
  try {
    const res = await backupApi.restoreBackup(id);
    if (res.success) {
      alert('备份恢复成功！');
      await fetchBackups();
    }
  } catch (error) {
    console.error('恢复备份失败:', error);
    alert('恢复失败');
  }
};

const deleteBackup = async (id: number) => {
  if (!confirm('确定要删除这个备份吗？此操作不可恢复。')) return;
  
  try {
    const res = await backupApi.deleteBackup(id);
    if (res.success) {
      await fetchBackups();
      await fetchStats();
      alert('删除成功');
    }
  } catch (error) {
    console.error('删除备份失败:', error);
    alert('删除失败');
  }
};

onMounted(() => {
  fetchBackups();
  fetchStats();
});
</script>
