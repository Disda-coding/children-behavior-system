import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:8787',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关 API
export const authApi = {
  register: (data: {
    username: string;
    password: string;
    role: 'child' | 'parent';
    displayName: string;
    familyId?: number;
    familyName?: string;
  }) => api.post('/api/auth/register', data) as Promise<any>,

  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login', data) as Promise<any>,
};

// 用户相关 API
export const userApi = {
  getMe: () => api.get('/api/users/me') as Promise<any>,
  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    api.put('/api/users/me', data) as Promise<any>,
};

// 家庭相关 API
export const familyApi = {
  getFamily: (id: number) => api.get(`/api/families/${id}`) as Promise<any>,
  getMyFamily: () => api.get('/api/families/me') as Promise<any>,
  createFamily: (data: { name: string }) => api.post('/api/families', data) as Promise<any>,
  joinFamily: (data: { inviteCode: string }) =>
    api.post('/api/families/join', data) as Promise<any>,
  leaveFamily: () => api.post('/api/families/leave') as Promise<any>,
  refreshInviteCode: (id: number) =>
    api.post(`/api/families/${id}/refresh-code`) as Promise<any>,
};

// 积分相关 API
export const pointApi = {
  getRules: () => api.get('/api/points/rules') as Promise<any>,
  createRule: (data: {
    familyId: number;
    name: string;
    description?: string;
    type: 'earn' | 'deduct';
    points: number;
    category?: string;
  }) => api.post('/api/points/rules', data) as Promise<any>,
  deleteRule: (id: number) => api.delete(`/api/points/rules/${id}`) as Promise<any>,
  getRecords: (params?: { userId?: number; type?: string }) =>
    api.get('/api/points/records', { params }) as Promise<any>,
  createRecord: (data: {
    userId: number;
    type: 'earn' | 'deduct' | 'redeem' | 'convert';
    amount: number;
    reason: string;
    ruleId?: number;
    createdBy?: number;
  }) => api.post('/api/points/records', data) as Promise<any>,
  getStats: (params: { userId: number }) =>
    api.get('/api/points/stats', { params }) as Promise<any>,
};

// 成就相关 API
export const achievementApi = {
  getAchievements: (params?: { familyId?: number }) =>
    api.get('/api/achievements', { params }) as Promise<any>,
  getTemplates: () => api.get('/api/achievements/templates') as Promise<any>,
  createAchievement: (data: {
    familyId?: number;
    templateId?: number;
    name: string;
    description?: string;
    iconUrl?: string;
    conditionType: 'consecutive' | 'count' | 'accumulate';
    conditionValue: number;
    conditionUnit?: string;
    rewardPoints?: number;
    isTemplate?: boolean;
  }) => api.post('/api/achievements', data) as Promise<any>,
  getUserAchievements: (userId: number, includeRevoked?: boolean) =>
    api.get(`/api/achievements/user/${userId}`, { params: { includeRevoked } }) as Promise<any>,
  assignAchievement: (id: number, data: { userId: number; note?: string }) =>
    api.post(`/api/achievements/${id}/assign`, data) as Promise<any>,
  // 撤销成就
  revokeAchievement: (userAchievementId: number, data: { revokedBy: number; reason?: string }) =>
    api.post(`/api/achievements/user-achievements/${userAchievementId}/revoke`, data) as Promise<any>,
  // 恢复已撤销的成就
  restoreAchievement: (userAchievementId: number, data: { restoredBy: number }) =>
    api.post(`/api/achievements/user-achievements/${userAchievementId}/restore`, data) as Promise<any>,
  // 获取家庭所有孩子的成就（包含撤销记录）
  getFamilyChildrenAchievements: (familyId: number) =>
    api.get(`/api/achievements/family/${familyId}/children-achievements`) as Promise<any>,
};

// 奖励相关 API
export const rewardApi = {
  getRewards: (params?: { familyId?: number }) =>
    api.get('/api/rewards', { params }) as Promise<any>,
  createReward: (data: {
    familyId: number;
    name: string;
    description?: string;
    type: 'physical' | 'virtual' | 'activity' | 'cash';
    pointsCost: number;
    iconUrl?: string;
    stock?: number;
    config?: Record<string, any>;
  }) => api.post('/api/rewards', data) as Promise<any>,
  updateReward: (id: number, data: {
    name?: string;
    description?: string;
    type?: 'physical' | 'virtual' | 'activity' | 'cash';
    pointsCost?: number;
    iconUrl?: string;
    stock?: number;
    config?: Record<string, any>;
    isActive?: boolean;
  }) => api.put(`/api/rewards/${id}`, data) as Promise<any>,
  deleteReward: (id: number) => api.delete(`/api/rewards/${id}`) as Promise<any>,
  redeemReward: (
    id: number,
    data: { userId: number; hours?: number; note?: string }
  ) => api.post(`/api/rewards/${id}/redeem`, data) as Promise<any>,
  getRedemptions: (params?: { userId?: number; familyId?: number; status?: string }) =>
    api.get('/api/rewards/redemptions', { params }) as Promise<any>,
  approveRedemption: (id: number, data: { approvedBy: number; note?: string }) =>
    api.put(`/api/rewards/redemptions/${id}/approve`, data) as Promise<any>,
  rejectRedemption: (id: number, data: { approvedBy: number; note?: string }) =>
    api.put(`/api/rewards/redemptions/${id}/reject`, data) as Promise<any>,
  completeRedemption: (id: number, data: { approvedBy: number; note?: string }) =>
    api.put(`/api/rewards/redemptions/${id}/complete`, data) as Promise<any>,
  getGameTimeHistory: (params: { userId: number; rewardId: number }) =>
    api.get('/api/rewards/game-time-history', { params }) as Promise<any>,
};

// 申诉相关 API
export const appealApi = {
  getAppeals: (params?: { userId?: number; familyId?: number; status?: string }) =>
    api.get('/api/appeals', { params }) as Promise<any>,
  getAppealStats: (params?: { familyId?: number }) =>
    api.get('/api/appeals/stats', { params }) as Promise<any>,
  createAppeal: (data: {
    userId: number;
    pointRecordId: number;
    reason: string;
  }) => api.post('/api/appeals', data) as Promise<any>,
  approveAppeal: (id: number, data: { handledBy: number; response?: string }) =>
    api.put(`/api/appeals/${id}/approve`, data) as Promise<any>,
  rejectAppeal: (id: number, data: { handledBy: number; response?: string }) =>
    api.put(`/api/appeals/${id}/reject`, data) as Promise<any>,
  deleteAppeal: (id: number) => api.delete(`/api/appeals/${id}`) as Promise<any>,
};

// 会议相关 API
export const meetingApi = {
  getMeetings: (params?: { familyId?: number; childId?: number }) =>
    api.get('/api/meetings', { params }) as Promise<any>,
  getMeetingStats: (params?: { familyId?: number; childId?: number }) =>
    api.get('/api/meetings/stats', { params }) as Promise<any>,
  createMeeting: (data: {
    familyId: number;
    childId: number;
    title: string;
    description?: string;
    pptUrl?: string;
    scheduledAt?: string;
  }) => api.post('/api/meetings', data) as Promise<any>,
  updateMeeting: (
    id: number,
    data: {
      title?: string;
      description?: string;
      pptUrl?: string;
      status?: string;
      scheduledAt?: string;
    }
  ) => api.put(`/api/meetings/${id}`, data) as Promise<any>,
  // 安排会议时间
  scheduleMeeting: (
    id: number,
    data: { scheduledAt: string; scheduledBy: number }
  ) => api.post(`/api/meetings/${id}/schedule`, data) as Promise<any>,
  // 取消会议
  cancelMeeting: (
    id: number,
    data: { cancelledBy: number; reason?: string }
  ) => api.post(`/api/meetings/${id}/cancel`, data) as Promise<any>,
  // 评分会议
  scoreMeeting: (
    id: number,
    data: { score: number; scoreNote?: string }
  ) => api.post(`/api/meetings/${id}/score`, data) as Promise<any>,
  // 删除会议
  deleteMeeting: (id: number) => api.delete(`/api/meetings/${id}`) as Promise<any>,
};

// 通知相关 API
export const notificationApi = {
  getNotifications: (params?: { unreadOnly?: boolean; limit?: number; offset?: number }) =>
    api.get('/api/notifications', { params }) as Promise<any>,
  getUnreadCount: () => api.get('/api/notifications/unread-count') as Promise<any>,
  markAsRead: (id: number) => api.put(`/api/notifications/${id}/read`) as Promise<any>,
  markAllAsRead: () => api.put('/api/notifications/read-all') as Promise<any>,
  deleteNotification: (id: number) => api.delete(`/api/notifications/${id}`) as Promise<any>,
  deleteReadNotifications: () => api.delete('/api/notifications/read') as Promise<any>,
};

// 统计相关 API
export const statsApi = {
  getPointStats: (params: { userId: number; days?: number }) =>
    api.get('/api/stats/points', { params }) as Promise<any>,
  getAchievementStats: (params: { userId: number }) =>
    api.get('/api/stats/achievements', { params }) as Promise<any>,
  exportData: (params: { type: string; familyId?: number }) =>
    api.get('/api/stats/export', { params }) as Promise<any>,
};

// 日志相关 API
export const logApi = {
  getLogs: (params?: { userId?: number; action?: string; entityType?: string; startDate?: string; endDate?: string; search?: string; limit?: number; offset?: number }) =>
    api.get('/api/logs', { params }) as Promise<any>,
  getLogStats: (params?: { days?: number }) =>
    api.get('/api/logs/stats', { params }) as Promise<any>,
  getLogActions: () =>
    api.get('/api/logs/actions') as Promise<any>,
  getLogDetail: (id: number) =>
    api.get(`/api/logs/${id}`) as Promise<any>,
  deleteLog: (id: number) =>
    api.delete(`/api/logs/${id}`) as Promise<any>,
  cleanupOldLogs: () =>
    api.delete('/api/logs/cleanup/old') as Promise<any>,
};

// 积分规则导出导入 API
export const pointRuleConfigApi = {
  exportRules: () =>
    api.get('/api/points/rules/export', { responseType: 'blob' }) as Promise<any>,
  importRules: (data: any) =>
    api.post('/api/points/rules/import', data) as Promise<any>,
};

// 备份相关 API
export const backupApi = {
  getBackups: (params?: { type?: string; limit?: number; offset?: number }) =>
    api.get('/api/backups', { params }) as Promise<any>,
  getBackupStats: () =>
    api.get('/api/backups/stats/overview') as Promise<any>,
  createBackup: (data: { name: string; description?: string }) =>
    api.post('/api/backups', data) as Promise<any>,
  downloadBackup: (id: number) =>
    api.get(`/api/backups/${id}/download`, { responseType: 'blob' }) as Promise<any>,
  restoreBackup: (id: number) =>
    api.post(`/api/backups/${id}/restore`) as Promise<any>,
  deleteBackup: (id: number) =>
    api.delete(`/api/backups/${id}`) as Promise<any>,
};

// 文件上传 API
export const uploadApi = {
  // 获取预签名上传 URL
  getPresignUrl: (data: { filename: string; contentType: string }) =>
    api.post('/api/upload/ppt/presign', data) as Promise<any>,

  // 直接上传文件
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload/ppt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as Promise<any>;
  },

  // 获取文件列表
  getFileList: () => api.get('/api/upload/ppt/list') as Promise<any>,

  // 删除文件
  deleteFile: (key: string) => api.delete(`/api/upload/ppt/${key}`) as Promise<any>,

  // 获取文件 URL
  getFileUrl: (key: string) => `${api.defaults.baseURL}/api/upload/ppt/file/${encodeURIComponent(key)}`,
};

// 成就配置导出导入 API
export const achievementConfigApi = {
  exportAchievements: (familyId?: number) =>
    api.get('/api/achievements/export', { params: { familyId } }) as Promise<any>,
  importAchievements: (data: { achievements: any[]; familyId: number }) =>
    api.post('/api/achievements/import', data) as Promise<any>,
};

export default api;
