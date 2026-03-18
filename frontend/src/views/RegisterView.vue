<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 py-8">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md my-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">创建账号</h1>
        <p class="text-gray-600">加入儿童行为管理系统</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            minlength="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="请输入密码（至少6个字符）"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
          <input
            v-model="form.displayName"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
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
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
              ]"
            >
              我是家长
            </button>
          </div>
        </div>

        <!-- 家长角色：创建新家庭 -->
        <div v-if="form.role === 'parent'">
          <label class="block text-sm font-medium text-gray-700 mb-2">家庭名称</label>
          <input
            v-model="form.familyName"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="请输入家庭名称"
          />
          <p class="text-xs text-gray-500 mt-1">创建家庭后您将获得邀请码，用于邀请孩子加入</p>
        </div>

        <!-- 儿童角色：输入邀请码 -->
        <div v-if="form.role === 'child'">
          <label class="block text-sm font-medium text-gray-700 mb-2">家庭邀请码</label>
          <input
            v-model="form.inviteCode"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="请输入邀请码"
          />
          <p class="text-xs text-gray-500 mt-1">请向家长获取邀请码</p>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          <p class="font-medium">注册失败</p>
          <p>{{ error }}</p>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-animate"
          >
            <span v-if="loading">注册中...</span>
            <span v-else>注册</span>
          </button>
        </div>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          已有账号？
          <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            立即登录
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
    // 构建请求数据
    const requestData: any = {
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

    console.log('Register request:', requestData);

    const response = await authStore.register(requestData) as { user: { role: string } };

    // 根据角色跳转到不同页面
    if (response.user.role === 'child') {
      router.push('/child/dashboard');
    } else {
      router.push('/parent/dashboard');
    }
  } catch (err: any) {
    console.error('Register error:', err);
    error.value = err.response?.data?.error || err.message || '注册失败，请检查网络连接后重试';
  } finally {
    loading.value = false;
  }
};
</script>
