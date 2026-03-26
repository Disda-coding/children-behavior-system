<template>
  <div class="relative">
    <!-- 通知图标按钮 -->
    <button
      @click="togglePanel"
      class="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
    >
      <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <!-- 未读数量徽章 -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- 通知面板 -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50"
        @click.self="isOpen = false"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/20" @click="isOpen = false"></div>

        <!-- 通知面板 -->
        <div
          class="absolute right-4 top-16 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          :class="{ 'left-4': isMobile, 'right-4': !isMobile }"
        >
          <!-- 头部 -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 class="font-bold text-slate-800">通知中心</h3>
            <div class="flex items-center gap-2">
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                全部已读
              </button>
              <button
                @click="isOpen = false"
                class="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 通知列表 -->
          <div class="max-h-[60vh] overflow-y-auto">
            <div v-if="loading" class="py-8 text-center text-slate-500">
              <div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              加载中...
            </div>

            <div v-else-if="notifications.length === 0" class="py-12 text-center">
              <div class="text-4xl mb-2">📭</div>
              <p class="text-slate-500">暂无通知</p>
            </div>

            <div v-else class="divide-y divide-slate-100">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                :class="{ 'bg-blue-50/50': !notification.isRead }"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start gap-3">
                  <!-- 图标 -->
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    :class="getIconBgClass(notification.type)"
                  >
                    {{ getIcon(notification.type) }}
                  </div>

                  <!-- 内容 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                      <h4 class="font-medium text-slate-800 text-sm">{{ notification.title }}</h4>
                      <span class="text-xs text-slate-400 whitespace-nowrap">{{ formatTime(notification.createdAt) }}</span>
                    </div>
                    <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ notification.content }}</p>

                    <!-- 未读标记 -->
                    <div v-if="!notification.isRead" class="mt-2">
                      <span class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    </div>
                  </div>

                  <!-- 删除按钮 -->
                  <button
                    @click.stop="deleteNotification(notification.id)"
                    class="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    :class="{ 'opacity-100': true }"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div v-if="notifications.length > 0" class="px-4 py-2 border-t border-slate-100 bg-slate-50">
            <button
              @click="deleteReadNotifications"
              class="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              清除已读通知
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { notificationApi } from '../../api';

const isOpen = ref(false);
const loading = ref(false);
const notifications = ref<any[]>([]);
const unreadCount = ref(0);
const isMobile = ref(window.innerWidth < 640);

let pollInterval: number | null = null;

// 通知类型图标映射
const iconMap: Record<string, string> = {
  achievement_unlocked: '🏆',
  points_earned: '💰',
  points_deducted: '💸',
  appeal_approved: '✅',
  appeal_rejected: '❌',
  reward_approved: '🎁',
  reward_rejected: '🚫',
  meeting_scheduled: '📅',
  meeting_cancelled: '🚫',
  meeting_scored: '⭐',
  system: '📢',
};

// 通知类型背景色映射
const iconBgMap: Record<string, string> = {
  achievement_unlocked: 'bg-yellow-100',
  points_earned: 'bg-green-100',
  points_deducted: 'bg-red-100',
  appeal_approved: 'bg-green-100',
  appeal_rejected: 'bg-red-100',
  reward_approved: 'bg-purple-100',
  reward_rejected: 'bg-red-100',
  meeting_scheduled: 'bg-blue-100',
  meeting_cancelled: 'bg-gray-100',
  meeting_scored: 'bg-yellow-100',
  system: 'bg-blue-100',
};

const getIcon = (type: string) => iconMap[type] || '📢';
const getIconBgClass = (type: string) => iconBgMap[type] || 'bg-slate-100';

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) return '刚刚';
  // 小于1小时
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  // 小于24小时
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  // 小于7天
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

// 切换面板
const togglePanel = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    fetchNotifications();
  }
};

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await notificationApi.getNotifications({ limit: 20 });
    if (res.success) {
      notifications.value = res.data || [];
      unreadCount.value = res.unreadCount || 0;
    }
  } catch (error) {
    console.error('获取通知失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取未读数量
const fetchUnreadCount = async () => {
  try {
    const res = await notificationApi.getUnreadCount();
    if (res.success) {
      unreadCount.value = res.count || 0;
    }
  } catch (error) {
    console.error('获取未读数量失败:', error);
  }
};

// 处理通知点击
const handleNotificationClick = async (notification: any) => {
  if (!notification.isRead) {
    try {
      await notificationApi.markAsRead(notification.id);
      notification.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }

  // 根据通知类型跳转
  if (notification.relatedType && notification.relatedId) {
    // 可以在这里添加跳转逻辑
    console.log('跳转到:', notification.relatedType, notification.relatedId);
  }
};

// 标记全部已读
const markAllAsRead = async () => {
  try {
    await notificationApi.markAllAsRead();
    notifications.value.forEach(n => n.isRead = true);
    unreadCount.value = 0;
  } catch (error) {
    console.error('标记全部已读失败:', error);
  }
};

// 删除通知
const deleteNotification = async (id: number) => {
  try {
    await notificationApi.deleteNotification(id);
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      const notification = notifications.value[index];
      if (!notification.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
      notifications.value.splice(index, 1);
    }
  } catch (error) {
    console.error('删除通知失败:', error);
  }
};

// 删除已读通知
const deleteReadNotifications = async () => {
  try {
    await notificationApi.deleteReadNotifications();
    notifications.value = notifications.value.filter(n => !n.isRead);
  } catch (error) {
    console.error('删除已读通知失败:', error);
  }
};

// 处理窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};

// 轮询获取未读数量
const startPolling = () => {
  pollInterval = window.setInterval(() => {
    if (!isOpen.value) {
      fetchUnreadCount();
    }
  }, 30000); // 30秒轮询一次
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

onMounted(() => {
  fetchUnreadCount();
  startPolling();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  stopPolling();
  window.removeEventListener('resize', handleResize);
});
</script>
