<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 py-8">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md my-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
        <p class="text-gray-600">登录儿童行为管理系统</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="请输入用户名"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="请输入密码"
          />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {{ error }}
        </div>

        <div class="pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-animate"
          >
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </div>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          还没有账号？
          <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-medium">
            立即注册
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await authStore.login(form.username, form.password) as { user: { role: string } };
    
    // 根据角色跳转到不同页面
    if (response.user.role === 'child') {
      router.push('/child/dashboard');
    } else {
      router.push('/parent/dashboard');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
};
</script>
