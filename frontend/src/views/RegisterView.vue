<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-4">
    <div class="w-full max-w-md">
      <!-- Logo 区域 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">创建账号</h1>
        <p class="text-gray-500 mt-1">开始您的家庭教育之旅</p>
      </div>

      <!-- 注册卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-800">注册新账号</h2>
          <p class="text-sm text-gray-500 mt-1">填写以下信息完成注册</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="form.username"
                type="text"
                required
                minlength="3"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="至少3个字符"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3 3 0 00-3 3m3-3a3 3 0 013 3m-3 0v1m0-1a3 3 0 013-3m0 0h3m-3 0H9" />
                </svg>
              </div>
              <input
                v-model="form.displayName"
                type="text"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="例如：小明 / 妈妈"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="至少6个字符"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.role = 'child'"
                :class="[
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                  form.role === 'child'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                ]"
              >
                <span class="text-2xl mb-1">👶</span>
                <span class="font-medium text-gray-800">我是小孩</span>
                <span class="text-xs text-gray-500">使用邀请码加入</span>
              </button>
              <button
                type="button"
                @click="form.role = 'parent'"
                :class="[
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                  form.role === 'parent'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                ]"
              >
                <span class="text-2xl mb-1">👨‍👩‍👧</span>
                <span class="font-medium text-gray-800">我是家长</span>
                <span class="text-xs text-gray-500">创建家庭</span>
              </button>
            </div>
          </div>

          <div v-if="form.role === 'parent'" class="p-4 bg-green-50 rounded-xl border border-green-100">
            <label class="block text-sm font-medium text-gray-700 mb-2">家庭名称</label>
            <input
              v-model="form.familyName"
              type="text"
              required
              class="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
              placeholder="请输入家庭名称"
            />
            <p class="mt-2 text-xs text-gray-500">注册后会生成邀请码，方便孩子加入</p>
          </div>

          <div v-if="form.role === 'child'" class="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <label class="block text-sm font-medium text-gray-700 mb-2">家庭邀请码</label>
            <input
              v-model="form.inviteCode"
              type="text"
              required
              class="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              placeholder="请输入邀请码"
            />
            <p class="mt-2 text-xs text-gray-500">请向家长获取邀请码</p>
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              注册中...
            </span>
            <span v-else>创建账号</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            已有账号？
            <router-link to="/login" class="text-green-600 hover:text-green-700 font-medium">
              立即登录
            </router-link>
          </p>
        </div>
      </div>

      <!-- 底部信息 -->
      <p class="text-center text-gray-400 text-sm mt-8">
        © 2024 儿童行为管理系统
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

interface RegisterPayload {
  username: string;
  password: string;
  displayName: string;
  role: 'child' | 'parent';
  familyName?: string;
  inviteCode?: string;
}

interface RegisterResponse {
  user: {
    role: 'child' | 'parent';
  };
}

interface ViewError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
  displayName: '',
  role: 'child' as 'child' | 'parent',
  familyName: '',
  inviteCode: '',
});

const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  try {
    const requestData: RegisterPayload = {
      username: form.username,
      password: form.password,
      displayName: form.displayName,
      role: form.role,
    };

    if (form.role === 'parent') {
      requestData.familyName = form.familyName;
    } else {
      requestData.inviteCode = form.inviteCode;
    }

    const response = await authStore.register(requestData) as RegisterResponse;

    // 根据角色跳转到不同页面
    if (response.user.role === 'child') {
      router.push('/child/dashboard');
    } else {
      router.push('/parent/dashboard');
    }
  } catch (err) {
    const viewError = err as ViewError;
    error.value = viewError.response?.data?.error || viewError.message || '注册失败，请检查网络连接后重试';
  } finally {
    loading.value = false;
  }
};
</script>
