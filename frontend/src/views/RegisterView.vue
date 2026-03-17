<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">创建账号</h1>
        <p class="text-gray-600">加入儿童行为管理系统</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            minlength="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="请输入用户名（至少3个字符）"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="请输入密码（至少6个字符）"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
          <input
            v-model="form.displayName"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            placeholder="请输入显示名称"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              @click="form.role = 'child'"
              :class="[
                'py-3 px-4 rounded-lg border-2 font-medium transition-all',
                form.role === 'child'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300'
              ]"
            >
              我是小孩
            </button>
            <button
              type="button"
              @click="form.role = 'parent'"
              :class="[
                'py-3 px-4 rounded-lg border-2 font-medium transition-all',
                form.role === 'parent'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300'
              ]"
            >
              我是家长
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-animate"
        >
          <span v-if="loading">注册中...</span>
          <span v-else>注册</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          已有账号？
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            立即登录
          </router-link>
        </p>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="mt-4 p-4 bg-danger-50 text-danger-700 rounded-lg">
        {{ error }}
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
  displayName: '',
  role: 'child' as 'child' | 'parent',
});

const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await authStore.register(form) as { user: { role: string } };
    
    // 根据角色跳转到不同页面
    if (response.user.role === 'child') {
      router.push('/child/dashboard');
    } else {
      router.push('/parent/dashboard');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || '注册失败，请重试';
  } finally {
    loading.value = false;
  }
};
</script>
