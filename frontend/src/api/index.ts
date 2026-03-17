import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8787',
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
  }) => api.post('/api/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login', data),
};

// 用户相关 API
export const userApi = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    api.put('/api/users/me', data),
};

// 家庭相关 API
export const familyApi = {
  getFamily: (id: number) => api.get(`/api/families/${id}`),
  getMyFamily: () => api.get('/api/families/me'),
  createFamily: (data: { name: string }) => api.post('/api/families', data),
  joinFamily: (data: { inviteCode: string }) =>
    api.post('/api/families/join', data),
  leaveFamily: () => api.post('/api/families/leave'),
  refreshInviteCode: (id: number) =>
    api.post(`/api/families/${id}/refresh-code`),
};

// 积分相关 API
export const pointApi = {
  getRules: () => api.get('/api/points/rules'),
  createRule: (data: {
    familyId: number;
    name: string;
    description?: string;
    type: 'earn' | 'deduct';
    points: number;
    category?: string;
  }) => api.post('/api/points/rules', data),
  getRecords: (params?: { userId?: number; type?: string }) =>
    api.get('/api/points/records', { params }),
  createRecord: (data: {
    userId: number;
    type: 'earn' | 'deduct' | 'redeem' | 'convert';
    amount: number;
    reason: string;
    ruleId?: number;
    createdBy?: number;
  }) => api.post('/api/points/records', data),
  getStats: (params: { userId: number }) =>
    api.get('/api/points/stats', { params }),
};

// 成就相关 API
export const achievementApi = {
  getAchievements: (params?: { familyId?: number }) =>
    api.get('/api/achievements', { params }),
  getTemplates: () => api.get('/api/achievements/templates'),
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
  }) => api.post('/api/achievements', data),
  getUserAchievements: (userId: number) =>
    api.get(`/api/achievements/user/${userId}`),
};

// 奖励相关 API
export const rewardApi = {
  getRewards: (params?: { familyId?: number }) =>
    api.get('/api/rewards', { params }),
  createReward: (data: {
    familyId: number;
    name: string;
    description?: string;
    type: 'physical' | 'virtual' | 'activity' | 'cash';
    pointsCost: number;
    iconUrl?: string;
    stock?: number;
    config?: Record<string, any>;
  }) => api.post('/api/rewards', data),
  redeemReward: (
    id: number,
    data: { userId: number; hours?: number; note?: string }
  ) => api.post(`/api/rewards/${id}/redeem`, data),
  getRedemptions: (params?: { userId?: number }) =>
    api.get('/api/rewards/redemptions', { params }),
};

// 申诉相关 API
export const appealApi = {
  getAppeals: (params?: { userId?: number; status?: string }) =>
    api.get('/api/appeals', { params }),
  createAppeal: (data: {
    userId: number;
    pointRecordId: number;
    reason: string;
  }) => api.post('/api/appeals', data),
  updateAppeal: (
    id: number,
    data: { status: 'approved' | 'rejected'; response?: string; handledBy?: number }
  ) => api.put(`/api/appeals/${id}`, data),
};

// 会议相关 API
export const meetingApi = {
  getMeetings: (params?: { familyId?: number; childId?: number }) =>
    api.get('/api/meetings', { params }),
  createMeeting: (data: {
    familyId: number;
    childId: number;
    title: string;
    description?: string;
    pptUrl?: string;
    scheduledAt?: string;
  }) => api.post('/api/meetings', data),
  updateMeeting: (
    id: number,
    data: {
      title?: string;
      description?: string;
      pptUrl?: string;
      status?: string;
      scheduledAt?: string;
    }
  ) => api.put(`/api/meetings/${id}`, data),
  scoreMeeting: (
    id: number,
    data: { score: number; scoreNote?: string }
  ) => api.post(`/api/meetings/${id}/score`, data),
};

// 统计相关 API
export const statsApi = {
  getPointStats: (params: { userId: number; days?: number }) =>
    api.get('/api/stats/points', { params }),
  getAchievementStats: (params: { userId: number }) =>
    api.get('/api/stats/achievements', { params }),
  exportData: (params: { type: string; familyId?: number }) =>
    api.get('/api/stats/export', { params }),
};

// 文件上传 API
export const uploadApi = {
  // 获取预签名上传 URL
  getPresignUrl: (data: { filename: string; contentType: string }) =>
    api.post('/api/upload/ppt/presign', data),
  
  // 直接上传文件
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload/ppt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 获取文件列表
  getFileList: () => api.get('/api/upload/ppt/list'),
  
  // 删除文件
  deleteFile: (key: string) => api.delete(`/api/upload/ppt/${key}`),
  
  // 获取文件 URL
  getFileUrl: (key: string) => `${api.defaults.baseURL}/api/upload/ppt/${key}`,
};

export default api;
