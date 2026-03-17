import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api';

interface User {
  id: number;
  username: string;
  role: 'child' | 'parent';
  displayName: string;
  avatarUrl?: string;
  familyId?: number;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isChild = computed(() => user.value?.role === 'child');
  const isParent = computed(() => user.value?.role === 'parent');

  // Actions
  const setUser = (userData: User | null) => {
    user.value = userData;
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const setToken = (newToken: string | null) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  const login = async (username: string, password: string) => {
    loading.value = true;
    try {
      const response = await authApi.login({ username, password }) as { user: User; token: string };
      setUser(response.user);
      setToken(response.token);
      return response;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: {
    username: string;
    password: string;
    role: 'child' | 'parent';
    displayName: string;
    familyId?: number;
    familyName?: string;
  }) => {
    loading.value = true;
    try {
      const response = await authApi.register(data) as { user: User; token: string };
      setUser(response.user);
      setToken(response.token);
      return response;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const init = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser);
      token.value = storedToken;
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isChild,
    isParent,
    login,
    register,
    logout,
    init,
    setUser,
    setToken,
  };
});
