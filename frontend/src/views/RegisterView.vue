<template>
  <div class="auth-page">
    <div class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sprout/10 blur-2xl"></div>
    <div class="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-sky/10 blur-3xl"></div>

    <div class="relative w-full max-w-md px-4 py-10">
      <!-- 品牌区 -->
      <div class="mb-6 text-center">
        <div class="auth-logo mx-auto mb-4">
          <Sprout class="h-9 w-9 text-white" :stroke-width="2.2" />
        </div>
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-ink">创建账号</h1>
        <p class="mt-1.5 text-[15px] text-ink-2">开始你们的家庭成长之旅</p>
      </div>

      <!-- 注册卡片 -->
      <div class="auth-card">
        <form class="space-y-4" @submit.prevent="handleRegister">
          <!-- 角色选择（卡片式） -->
          <div>
            <span class="auth-label">我是…</span>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                :class="['role-card', form.role === 'child' && 'role-card--active']"
                @click="form.role = 'child'"
              >
                <Baby class="h-6 w-6" />
                <span class="text-sm font-semibold">我是小孩</span>
                <span class="text-[11px] text-ink-2">用邀请码加入家庭</span>
              </button>
              <button
                type="button"
                :class="['role-card', form.role === 'parent' && 'role-card--active']"
                @click="form.role = 'parent'"
              >
                <UsersRound class="h-6 w-6" />
                <span class="text-sm font-semibold">我是家长</span>
                <span class="text-[11px] text-ink-2">创建家庭并管理</span>
              </button>
            </div>
          </div>

          <label class="auth-field">
            <span class="auth-label">用户名</span>
            <span class="auth-input-wrap">
              <UserRound class="auth-input-icon" />
              <input
                v-model.trim="form.username"
                type="text"
                required
                minlength="3"
                maxlength="50"
                autocomplete="username"
                class="auth-input"
                placeholder="至少 3 个字符，如 xiaoming"
              />
            </span>
          </label>

          <label class="auth-field">
            <span class="auth-label">昵称</span>
            <span class="auth-input-wrap">
              <Smile class="auth-input-icon" />
              <input
                v-model.trim="form.displayName"
                type="text"
                required
                maxlength="50"
                class="auth-input"
                placeholder="例如：小明 / 妈妈"
              />
            </span>
          </label>

          <!-- 密码 + 规则实时清单 -->
          <div class="auth-field">
            <span class="auth-label">密码</span>
            <span class="auth-input-wrap">
              <Lock class="auth-input-icon" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                class="auth-input pr-11"
                placeholder="请设置密码"
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
            <ul class="mt-2.5 space-y-1.5">
              <li
                v-for="rule in passwordRules"
                :key="rule.label"
                :class="['flex items-center gap-1.5 text-xs transition-colors', rule.pass ? 'text-p-green' : 'text-ink-2']"
              >
                <span
                  :class="[
                    'flex h-4 w-4 items-center justify-center rounded-full transition-colors',
                    rule.pass ? 'bg-p-green/15' : 'bg-ink/5'
                  ]"
                >
                  <Check v-if="rule.pass" class="h-3 w-3" :stroke-width="3" />
                  <X v-else class="h-2.5 w-2.5" :stroke-width="3" />
                </span>
                {{ rule.label }}
              </li>
            </ul>
          </div>

          <!-- 家长：家庭名 -->
          <div v-if="form.role === 'parent'" class="rounded-xl border border-coral/20 bg-coral/5 p-3.5">
            <label class="auth-field">
              <span class="auth-label">家庭名称</span>
              <span class="auth-input-wrap">
                <Home class="auth-input-icon" />
                <input
                  v-model.trim="form.familyName"
                  type="text"
                  required
                  class="auth-input !bg-white"
                  placeholder="例如：我们的一家"
                />
              </span>
            </label>
            <p class="mt-2 text-xs text-ink-2">注册后自动生成邀请码，孩子凭码加入</p>
          </div>

          <!-- 孩子：邀请码 -->
          <div v-else class="rounded-xl border border-sky/25 bg-sky/5 p-3.5">
            <label class="auth-field">
              <span class="auth-label">家庭邀请码</span>
              <span class="auth-input-wrap">
                <KeyRound class="auth-input-icon" />
                <input
                  v-model.trim="form.inviteCode"
                  type="text"
                  required
                  class="auth-input font-display !bg-white !tracking-[0.2em] uppercase"
                  placeholder="请向家长获取"
                />
              </span>
            </label>
          </div>

          <Transition name="fade">
            <div
              v-if="error"
              class="flex items-start gap-2 rounded-xl border border-danger/15 bg-danger/5 p-3 text-sm text-danger"
            >
              <CircleAlert class="mt-0.5 h-4 w-4 shrink-0" />
              <span>{{ error }}</span>
            </div>
          </Transition>

          <button type="submit" :disabled="loading || !allRulesPass" class="auth-submit">
            <Loader2 v-if="loading" class="h-5 w-5 animate-spin" />
            <span>{{ loading ? '创建中…' : '创建账号' }}</span>
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-ink-2">
          已有账号？
          <RouterLink to="/login" class="font-semibold text-coral transition-opacity hover:opacity-80">
            立即登录
          </RouterLink>
        </p>
      </div>

      <p class="mt-8 text-center text-xs text-ink-2/60">© 2026 星芽成长 · 家庭习惯养成</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
  Baby,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  Loader2,
  Lock,
  Smile,
  Sprout,
  UserRound,
  UsersRound,
  X,
} from 'lucide-vue-next';
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
  user: { role: 'child' | 'parent' };
}

interface ViewError {
  response?: { data?: { error?: string } };
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
const showPassword = ref(false);

/* 与后端 validatePasswordStrength（auth.ts）完全对齐的 5 条规则 */
const passwordRules = computed(() => [
  { label: '至少 8 位字符', pass: form.password.length >= 8 },
  { label: '包含大写字母', pass: /[A-Z]/.test(form.password) },
  { label: '包含小写字母', pass: /[a-z]/.test(form.password) },
  { label: '包含数字', pass: /[0-9]/.test(form.password) },
  { label: '包含特殊字符（如 !@#）', pass: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password) },
]);

const allRulesPass = computed(() => passwordRules.value.every((r) => r.pass));

const handleRegister = async () => {
  if (loading.value) return;
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

    const response = (await authStore.register(requestData)) as RegisterResponse;
    router.push(response.user.role === 'child' ? '/child/dashboard' : '/parent/dashboard');
  } catch (err) {
    const viewError = err as ViewError;
    error.value =
      viewError.response?.data?.error || viewError.message || '注册失败，请检查网络连接后重试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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
  text-transform: none;
  letter-spacing: normal;
}

.auth-input:focus {
  outline: none;
  background: #fff;
  border-color: var(--color-coral);
  box-shadow: 0 0 0 3.5px rgb(255 90 95 / 14%);
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 0.5rem;
  border-radius: 1rem;
  border: 1.5px solid var(--color-line);
  background: #fafafa;
  color: var(--color-ink);
  transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
}

.role-card:hover {
  border-color: #ffc9cb;
  transform: translateY(-1px);
}

.role-card--active {
  border-color: var(--color-coral);
  background: #fff1f2;
  box-shadow: 0 6px 16px -6px rgb(255 90 95 / 35%);
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
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s, opacity 0.2s;
}

.auth-submit:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-1px);
}

.auth-submit:disabled {
  opacity: 0.55;
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
