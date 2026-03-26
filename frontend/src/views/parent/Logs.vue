<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span class="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center text-white text-xl">📋</span>
          系统日志
        </h1>
        <p class="text-slate-600 mt-2">查看系统操作记录和审计日志</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
          <div class="text-sm text-slate-500 mt-1">总记录数</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-green-600">{{ stats.today }}</div>
          <div class="text-sm text-slate-500 mt-1">今日操作</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-purple-600">{{ stats.users }}</div>
          <div class="text-sm text-slate-500 mt-1">活跃用户</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="text-3xl font-bold text-orange-600">{{ stats.actions }}</div>
          <div class="text-sm text-slate-500 mt-1">操作类型</div>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-slate-700 mb-1">搜索</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="搜索操作描述..."
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">操作类型</label>
            <select
              v-model="filters.action"
              class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部类型</option>
              <option v-for="action in actionTypes" :key="action" :value="action">{{ getActionLabel(action) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">实体类型</label>
            <select
              v-model="filters.entityType"
              class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部实体</option>
              <option value="user">用户</option>
              <option value="point_record">积分记录</option>
              <option value="achievement">成就</option>
              <option value="reward">奖励</option>
              <option value="appeal">申诉</option>
              <option value="meeting">会议</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="fetchLogs"
              class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              查询
            </button>
            <button
              @click="resetFilters"
              class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 日志列表 -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">时间</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">用户</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">操作</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">描述</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">实体</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-slate-600">IP地址</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                  {{ formatDateTime(log.createdAt) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                      {{ log.user?.displayName?.charAt(0) || '?' }}
                    </div>
                    <span class="text-sm text-slate-700">{{ log.user?.displayName || '未知用户' }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span :class="getActionBadgeClass(log.action)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getActionLabel(log.action) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-700 max-w-xs truncate" :title="log.description">
                  {{ log.description }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">
                  {{ getEntityLabel(log.entityType) }}
                  <span v-if="log.entityId" class="text-slate-400">#{{ log.entityId }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-500 font-mono">
                  {{ log.ipAddress || '-' }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="viewDetail(log)"
                    class="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <div class="text-sm text-slate-500">
            共 {{ pagination.total }} 条记录
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="pagination.offset === 0"
              class="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span class="text-sm text-slate-600">
              第 {{ Math.floor(pagination.offset / pagination.limit) + 1 }} 页
            </span>
            <button
              @click="nextPage"
              :disabled="!pagination.hasMore"
              class="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <!-- 清理旧日志按钮 -->
      <div class="mt-6 flex justify-end">
        <button
          @click="cleanupOldLogs"
          class="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm"
        >
          清理90天前的日志
        </button>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Teleport to="body">
      <div v-if="selectedLog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="selectedLog = null">
        <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-slate-800">日志详情</h3>
            <button @click="selectedLog = null" class="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-slate-500">操作类型</label>
                <p class="font-medium text-slate-800">{{ getActionLabel(selectedLog.action) }}</p>
              </div>
              <div>
                <label class="text-sm text-slate-500">操作时间</label>
                <p class="font-medium text-slate-800">{{ formatDateTime(selectedLog.createdAt) }}</p>
              </div>
              <div>
                <label class="text-sm text-slate-500">操作用户</label>
                <p class="font-medium text-slate-800">{{ selectedLog.user?.displayName || '未知' }}</p>
              </div>
              <div>
                <label class="text-sm text-slate-500">IP地址</label>
                <p class="font-medium text-slate-800 font-mono">{{ selectedLog.ipAddress || '-' }}</p>
              </div>
            </div>

            <div>
              <label class="text-sm text-slate-500">操作描述</label>
              <p class="font-medium text-slate-800">{{ selectedLog.description }}</p>
            </div>

            <div v-if="selectedLog.oldValue">
              <label class="text-sm text-slate-500">修改前</label>
              <pre class="mt-1 p-3 bg-slate-50 rounded-lg text-sm font-mono text-slate-700 overflow-x-auto">{{ JSON.stringify(selectedLog.oldValue, null, 2) }}</pre>
            </div>

            <div v-if="selectedLog.newValue">
              <label class="text-sm text-slate-500">修改后</label>
              <pre class="mt-1 p-3 bg-slate-50 rounded-lg text-sm font-mono text-slate-700 overflow-x-auto">{{ JSON.stringify(selectedLog.newValue, null, 2) }}</pre>
            </div>

            <div v-if="selectedLog.userAgent">
              <label class="text-sm text-slate-500">User Agent</label>
              <p class="text-sm text-slate-600 break-all">{{ selectedLog.userAgent }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { logApi } from '../../api';

const logs = ref<any[]>([]);
const actionTypes = ref<string[]>([]);
const selectedLog = ref<any>(null);
const stats = ref({ total: 0, today: 0, users: 0, actions: 0 });

const filters = ref({
  search: '',
  action: '',
  entityType: '',
  startDate: '',
  endDate: '',
});

const pagination = ref({
  total: 0,
  limit: 20,
  offset: 0,
  hasMore: false,
});

// 操作类型标签映射
const actionLabels: Record<string, string> = {
  user_login: '用户登录',
  user_logout: '用户登出',
  user_register: '用户注册',
  point_create: '创建积分',
  point_update: '更新积分',
  point_delete: '删除积分',
  achievement_assign: '赋予成就',
  achievement_revoke: '撤销成就',
  achievement_restore: '恢复成就',
  reward_create: '创建奖励',
  reward_update: '更新奖励',
  reward_delete: '删除奖励',
  redemption_approve: '通过兑换',
  redemption_reject: '拒绝兑换',
  appeal_create: '创建申诉',
  appeal_approve: '通过申诉',
  appeal_reject: '驳回申诉',
  meeting_create: '创建会议',
  meeting_schedule: '安排会议',
  meeting_cancel: '取消会议',
  meeting_score: '会议评分',
  family_create: '创建家庭',
  family_join: '加入家庭',
  family_leave: '离开家庭',
  config_export: '导出配置',
  config_import: '导入配置',
};

// 实体类型标签映射
const entityLabels: Record<string, string> = {
  user: '用户',
  point_record: '积分记录',
  point_rule: '积分规则',
  achievement: '成就',
  user_achievement: '用户成就',
  reward: '奖励',
  redemption: '兑换',
  appeal: '申诉',
  meeting: '会议',
  family: '家庭',
  notification: '通知',
  system_config: '系统配置',
};

const getActionLabel = (action: string) => actionLabels[action] || action;
const getEntityLabel = (entityType: string) => entityLabels[entityType] || entityType;

const getActionBadgeClass = (action: string) => {
  if (action.includes('create') || action.includes('assign')) return 'bg-green-100 text-green-700';
  if (action.includes('update')) return 'bg-blue-100 text-blue-700';
  if (action.includes('delete') || action.includes('revoke')) return 'bg-red-100 text-red-700';
  if (action.includes('approve')) return 'bg-green-100 text-green-700';
  if (action.includes('reject')) return 'bg-red-100 text-red-700';
  if (action.includes('login') || action.includes('logout')) return 'bg-slate-100 text-slate-700';
  return 'bg-gray-100 text-gray-700';
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const fetchLogs = async () => {
  try {
    const params: any = {
      limit: pagination.value.limit,
      offset: pagination.value.offset,
    };

    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.action) params.action = filters.value.action;
    if (filters.value.entityType) params.entityType = filters.value.entityType;
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const res = await logApi.getLogs(params);
    if (res.success) {
      logs.value = res.data;
      pagination.value = res.pagination;
    }
  } catch (error) {
    console.error('获取日志失败:', error);
  }
};

const fetchActionTypes = async () => {
  try {
    const res = await logApi.getLogActions();
    if (res.success) {
      actionTypes.value = res.data.map((item: any) => item.action);
    }
  } catch (error) {
    console.error('获取操作类型失败:', error);
  }
};

const fetchStats = async () => {
  try {
    const res = await logApi.getLogStats({ days: '7' });
    if (res.success) {
      const { actionStats, dailyStats } = res.data;
      stats.value.total = actionStats.reduce((sum: number, item: any) => sum + item.count, 0);
      stats.value.today = dailyStats[dailyStats.length - 1]?.count || 0;
      stats.value.actions = actionStats.length;
    }
  } catch (error) {
    console.error('获取统计失败:', error);
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  };
  pagination.value.offset = 0;
  fetchLogs();
};

const prevPage = () => {
  if (pagination.value.offset > 0) {
    pagination.value.offset -= pagination.value.limit;
    fetchLogs();
  }
};

const nextPage = () => {
  if (pagination.value.hasMore) {
    pagination.value.offset += pagination.value.limit;
    fetchLogs();
  }
};

const viewDetail = (log: any) => {
  selectedLog.value = log;
};

const cleanupOldLogs = async () => {
  if (!confirm('确定要清理90天前的日志吗？此操作不可恢复。')) return;

  try {
    const res = await logApi.cleanupOldLogs();
    if (res.success) {
      alert(`成功清理 ${res.deletedCount} 条旧日志`);
      fetchLogs();
    }
  } catch (error) {
    console.error('清理日志失败:', error);
    alert('清理失败，请重试');
  }
};

onMounted(() => {
  fetchLogs();
  fetchActionTypes();
  fetchStats();
});
</script>
