<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.2),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.28),_transparent_25%),linear-gradient(145deg,_#0f172a,_#111827_50%,_#1e293b)]"></div>
    <div class="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/92 shadow-2xl backdrop-blur md:grid-cols-[1fr_1.05fr]">
        <section class="relative hidden overflow-hidden bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 px-10 py-12 text-white md:flex md:flex-col md:justify-between">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.35),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.2),_transparent_26%)]"></div>
          <div class="relative">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm">
              🚀 5 分钟完成首次配置
            </div>
            <h1 class="mt-6 text-4xl font-bold leading-tight">创建家庭成长系统，从今天开始</h1>
            <p class="mt-4 max-w-lg text-sm leading-7 text-cyan-50">
              支持家长创建家庭、孩子使用邀请码加入，快速建立积分激励、成就奖励与家庭会议机制。
            </p>
          </div>

          <div class="relative space-y-4">
            <div class="rounded-2xl border border-white/20 bg-white/15 p-4">
              <p class="text-sm font-semibold">家长端</p>
              <p class="mt-1 text-sm text-cyan-50">创建家庭、设置规则、审核奖励与查看统计。</p>
            </div>
            <div class="rounded-2xl border border-white/20 bg-white/15 p-4">
              <p class="text-sm font-semibold">孩子端</p>
              <p class="mt-1 text-sm text-cyan-50">查看积分变化、完成成就、发起会议和奖励兑换。</p>
            </div>
          </div>
        </section>

        <section class="px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div class="mx-auto w-full max-w-lg">
            <div class="mb-8">
              <p class="text-sm font-medium text-blue-600">开始使用</p>
              <h2 class="mt-2 text-3xl font-bold text-slate-900">创建你的账号</h2>
              <p class="mt-3 text-sm leading-6 text-slate-500">
                选择家长或孩子身份后，系统会自动引导你创建家庭或加入已有家庭。
              </p>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-5">
              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">用户名</label>
                  <input
                    v-model="form.username"
                    type="text"
                    required
                    minlength="3"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="至少 3 个字符"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">显示名称</label>
                  <input
                    v-model="form.displayName"
                    type="text"
                    required
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="例如：小明 / 妈妈"
                  />
                </div>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">密码</label>
                <input
                  v-model="form.password"
                  type="password"
                  required
                  minlength="6"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="至少 6 个字符"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">角色</label>
                <div class="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    @click="form.role = 'child'"
                    :class="[
                      'rounded-2xl border px-4 py-3 text-left transition-all',
                      form.role === 'child'
                        ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white'
                    ]"
                  >
                    <p class="font-semibold text-slate-900">我是小孩</p>
                    <p class="mt-1 text-xs text-slate-500">使用邀请码加入家庭</p>
                  </button>
                  <button
                    type="button"
                    @click="form.role = 'parent'"
                    :class="[
                      'rounded-2xl border px-4 py-3 text-left transition-all',
                      form.role === 'parent'
                        ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white'
                    ]"
                  >
                    <p class="font-semibold text-slate-900">我是家长</p>
                    <p class="mt-1 text-xs text-slate-500">创建并管理家庭规则</p>
                  </button>
                </div>
              </div>

              <div v-if="form.role === 'parent'" class="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <label class="mb-2 block text-sm font-medium text-slate-700">家庭名称</label>
                <input
                  v-model="form.familyName"
                  type="text"
                  required
                  class="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="请输入家庭名称"
                />
                <p class="mt-2 text-xs text-slate-500">注册后系统会生成邀请码，方便孩子加入。</p>
              </div>

              <div v-if="form.role === 'child'" class="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <label class="mb-2 block text-sm font-medium text-slate-700">家庭邀请码</label>
                <input
                  v-model="form.inviteCode"
                  type="text"
                  required
                  class="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="请输入邀请码"
                />
                <p class="mt-2 text-xs text-slate-500">请向家长获取邀请码后再完成注册。</p>
              </div>

              <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p class="font-medium">注册失败</p>
                <p>{{ error }}</p>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 btn-animate"
              >
                <span v-if="loading">注册中...</span>
                <span v-else>创建账号并进入系统</span>
              </button>
            </form>

            <div class="mt-8 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              已有账号？
              <router-link to="/login" class="font-semibold text-blue-600 hover:text-blue-700">
                立即登录
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

    console.log('Register request:', requestData);

    const response = await authStore.register(requestData) as RegisterResponse;

    // 根据角色跳转到不同页面
    if (response.user.role === 'child') {
      router.push('/child/dashboard');
    } else {
      router.push('/parent/dashboard');
    }
  } catch (err) {
    const viewError = err as ViewError;
    console.error('Register error:', err);
    error.value = viewError.response?.data?.error || viewError.message || '注册失败，请检查网络连接后重试';
  } finally {
    loading.value = false;
  }
};
</script>
