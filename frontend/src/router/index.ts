import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 公共页面
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

// 儿童端页面
import ChildDashboard from '@/views/child/Dashboard.vue';
import ChildAchievements from '@/views/child/Achievements.vue';
import ChildRewards from '@/views/child/Rewards.vue';
import ChildAppeals from '@/views/child/Appeals.vue';
import ChildMeetings from '@/views/child/Meetings.vue';

// 家长端页面
import ParentDashboard from '@/views/parent/Dashboard.vue';
import ParentPoints from '@/views/parent/Points.vue';
import ParentAchievements from '@/views/parent/Achievements.vue';
import ParentRewards from '@/views/parent/Rewards.vue';
import ParentStatistics from '@/views/parent/Statistics.vue';
import ParentAppeals from '@/views/parent/Appeals.vue';
import ParentMeetings from '@/views/parent/Meetings.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { public: true },
    },
    // 儿童端路由
    {
      path: '/child',
      name: 'child',
      redirect: '/child/dashboard',
      meta: { requiresAuth: true, role: 'child' },
      children: [
        {
          path: 'dashboard',
          name: 'child-dashboard',
          component: ChildDashboard,
        },
        {
          path: 'achievements',
          name: 'child-achievements',
          component: ChildAchievements,
        },
        {
          path: 'rewards',
          name: 'child-rewards',
          component: ChildRewards,
        },
        {
          path: 'appeals',
          name: 'child-appeals',
          component: ChildAppeals,
        },
        {
          path: 'meetings',
          name: 'child-meetings',
          component: ChildMeetings,
        },
      ],
    },
    // 家长端路由
    {
      path: '/parent',
      name: 'parent',
      redirect: '/parent/dashboard',
      meta: { requiresAuth: true, role: 'parent' },
      children: [
        {
          path: 'dashboard',
          name: 'parent-dashboard',
          component: ParentDashboard,
        },
        {
          path: 'points',
          name: 'parent-points',
          component: ParentPoints,
        },
        {
          path: 'achievements',
          name: 'parent-achievements',
          component: ParentAchievements,
        },
        {
          path: 'rewards',
          name: 'parent-rewards',
          component: ParentRewards,
        },
        {
          path: 'statistics',
          name: 'parent-statistics',
          component: ParentStatistics,
        },
        {
          path: 'appeals',
          name: 'parent-appeals',
          component: ParentAppeals,
        },
        {
          path: 'meetings',
          name: 'parent-meetings',
          component: ParentMeetings,
        },
      ],
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  // 检查角色权限
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    // 如果角色不匹配，重定向到对应角色的首页
    if (authStore.user?.role === 'child') {
      next('/child/dashboard');
    } else if (authStore.user?.role === 'parent') {
      next('/parent/dashboard');
    } else {
      next('/login');
    }
    return;
  }
  
  // 已登录用户访问登录页，重定向到对应首页
  if (to.meta.public && authStore.isAuthenticated) {
    if (authStore.user?.role === 'child') {
      next('/child/dashboard');
    } else {
      next('/parent/dashboard');
    }
    return;
  }
  
  next();
});

export default router;
