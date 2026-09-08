<template>
  <div class="auth-page">
    <!-- 装饰圆 -->
    <div class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-coral/10 blur-2xl"></div>
    <div class="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-honey/15 blur-3xl"></div>

    <div class="relative w-full max-w-md px-4">
      <!-- 品牌区 -->
      <div class="mb-8 text-center">
        <div class="auth-logo mx-auto mb-4">
          <Sprout class="h-9 w-9 text-white" :stroke-width="2.2" />
        </div>
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-ink">星芽成长</h1>
        <p class="mt-1.5 text-[15px] text-ink-2">让每一次好习惯都被看见</p>
      </div>

      <!-- 登录卡片 -->
      <div class="auth-card">
        <h2 class="text-lg font-semibold text-ink">欢迎回来</h2>
        <p class="mb-6 mt-0.5 text-sm text-ink-2">登录你的账号，继续成长</p>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <label class="auth-field">
            <span class="auth-label">用户名</span>
            <span class="auth-input-wrap">
              <UserRound class="auth-input-icon" />
              <input
                v-model.trim="form.username"
                type="text"
                required
                autocomplete="username"
                class="auth-input"
                placeholder="请输入用户名"
              />
            </span>
          </label>

          <label class="auth-field">
            <span class="auth-label">密码</span>
            <span class="auth-input-wrap">
              <Lock class="auth-input-icon" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="auth-input pr-11"
                placeholder="请输入密码"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 transition-colors hover:text-ink"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-[18px] w-[18px]" />
                <Eye v-else class="h-[18px] w-[18px]" />
              </button>
            </span>
          </label>

          <Transition name="fade">
            <div
              v-if="error"
              class="flex items-start gap-2 rounded-xl border border-danger/15 bg-danger/5 p-3 text-sm text-danger"
            >
              <CircleAlert class="mt-0.5 h-4 w-4 shrink-0" />
              <span>{{ error }}</span>
            </div>
          </Transition>

          <button type="submit" :disabled="loading" class="auth-submit">
            <Loader2 v-if="loading" class="h-5 w-5 animate-spin" />
            <span>{{ loading ? '登录中…' : '登录' }}</span>
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-2">
          还没有账号？
          <RouterLink to="/register" class="font-semibold text-coral transition-opacity hover:opacity-80">
            立即注册
          </RouterLink>
        </p>
      </div>

      <p class="mt-8 text-center text-xs text-ink-2/60">© 2026 星芽成长 · 家庭习惯养成</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { CircleAlert, Eye, EyeOff, Loader2, Lock, Sprout, UserRound } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

interface LoginResponse {
  user: { role: 'child' | 'parent' };
}

interface ViewError {
  response?: { data?: { error?: string } };
  message?: string;
}

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({ username: '', password: '' });
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';

  try {
    const response = (await authStore.login(form.username, form.password)) as LoginResponse;
    router.push(response.user.role === 'child' ? '/child/dashboard' : '/parent/dashboard');
  } catch (err) {
    const viewError = err as ViewError;
    error.value = viewError.response?.data?.error || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 登录/注册共用基底 —— 儿童端奶油调 */
.auth-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(160deg, #fff9f0 0%, #fff1f2 55%, #fef3e2 100%);
}

.auth-logo {
  display: flex;
  height: 4.25rem;
  width: 4.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 1.5rem;
  background: linear-gradient(135deg, var(--color-coral), var(--color-honey));
  box-shadow: 0 10px 24px rgb(255 90 95 / 28%);
}

.auth-card {
  background: var(--color-card);
  border-radius: 1.5rem;
  padding: 1.75rem 1.5rem 1.5rem;
  box-shadow:
    0 1px 2px rgb(28 28 30 / 4%),
    0 16px 40px -12px rgb(28 28 30 / 12%);
}

.auth-field {
  display: block;
}

.auth-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
}

.auth-input-wrap {
  position: relative;
  display: block;
}

.auth-input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1.125rem;
  width: 1.125rem;
  color: var(--color-ink-2);
  pointer-events: none;
}

.auth-input {
  width: 100%;
  border-radius: 0.875rem;
  border: 1px solid var(--color-line);
  background: #fafafa;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.auth-input::placeholder {
  color: #b0b0b5;
}

.auth-input:focus {
  outline: none;
  background: #fff;
  border-color: var(--color-coral);
  box-shadow: 0 0 0 3.5px rgb(255 90 95 / 14%);
}

.auth-submit {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.875rem;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--color-coral) 0%, #ff7a45 100%);
  box-shadow: 0 8px 20px -6px rgb(255 90 95 / 45%);
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
}

.auth-submit:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-1px);
}

.auth-submit:active:not(:disabled) {
  transform: translateY(0);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
