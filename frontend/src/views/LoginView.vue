<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.26),_transparent_24%),linear-gradient(135deg,_#0f172a,_#1e293b_55%,_#111827)]"></div>
    <div class="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/90 shadow-2xl backdrop-blur md:grid-cols-[1.08fr_0.92fr]">
        <section class="relative hidden overflow-hidden bg-slate-900 px-10 py-12 text-white md:flex md:flex-col md:justify-between">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.45),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.28),_transparent_30%)]"></div>
          <div class="relative">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-blue-100">
              🌟 儿童行为管理与激励系统
            </div>
            <h1 class="mt-6 text-4xl font-bold leading-tight">让每一次好习惯，都被认真看见</h1>
            <p class="mt-4 max-w-lg text-sm leading-7 text-slate-200">
              通过积分、成就和奖励兑换，把家庭教育变成更轻松、更有参与感的成长旅程。
            </p>
          </div>

          <div class="relative grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p class="text-xs uppercase tracking-[0.28em] text-slate-300">实时</p>
              <p class="mt-2 text-lg font-semibold">积分反馈</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p class="text-xs uppercase tracking-[0.28em] text-slate-300">趣味</p>
              <p class="mt-2 text-lg font-semibold">成就动画</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p class="text-xs uppercase tracking-[0.28em] text-slate-300">协作</p>
              <p class="mt-2 text-lg font-semibold">家庭共育</p>
            </div>
          </div>
        </section>

        <section class="px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div class="mx-auto w-full max-w-md">
            <div class="mb-8">
              <p class="text-sm font-medium text-blue-600">欢迎回来</p>
              <h2 class="mt-2 text-3xl font-bold text-slate-900">登录你的成长空间</h2>
              <p class="mt-3 text-sm leading-6 text-slate-500">
                家长可管理规则和奖励，孩子可查看积分、成就与家庭会议安排。
              </p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-5">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">用户名</label>
                <input
                  v-model="form.username"
                  type="text"
                  required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="请输入用户名"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">密码</label>
                <input
                  v-model="form.password"
                  type="password"
                  required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="请输入密码"
                />
              </div>

              <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ error }}
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 btn-animate"
              >
                <span v-if="loading">登录中...</span>
                <span v-else>进入系统</span>
              </button>
            </form>

            <div class="mt-8 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              还没有账号？
              <router-link to="/register" class="font-semibold text-blue-600 hover:text-blue-700">
                立即注册
              </router-link>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

interface LoginResponse {
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
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await authStore.login(form.username, form.password) as LoginResponse;
    
    // 根据角色跳转到不同页面
    if (response.user.role === 'child') {
      router.push('/child/dashboard');
    } else {
      router.push('/parent/dashboard');
    }
  } catch (err) {
    const viewError = err as ViewError;
    error.value = viewError.response?.data?.error || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
};
</script>
