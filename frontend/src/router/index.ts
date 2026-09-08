import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 布局
import AppShell from '@/components/layout/AppShell.vue';

// 公共页面
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

// 儿童端页面
import ChildDashboard from '@/views/child/Dashboard.vue';
import ChildAchievements from '@/views/child/Achievements.vue';
import ChildRewards from '@/views/child/Rewards.vue';
import ChildAppeals from '@/views/child/Appeals.vue';
import ChildMeetings from '@/views/child/Meetings.vue';
import ChildProfile from '@/views/child/Profile.vue';
import ChildRecords from '@/views/child/Records.vue';

// 家长端页面
import ParentDashboard from '@/views/parent/Dashboard.vue';
import ParentPoints from '@/views/parent/Points.vue';
import ParentAchievements from '@/views/parent/Achievements.vue';
import ParentRewards from '@/views/parent/Rewards.vue';
import ParentStatistics from '@/views/parent/Statistics.vue';
import ParentAppeals from '@/views/parent/Appeals.vue';
import ParentMeetings from '@/views/parent/Meetings.vue';
import ParentLogs from '@/views/parent/Logs.vue';
import ParentBackups from '@/views/parent/Backups.vue';
import ParentMore from '@/views/parent/More.vue';

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
    // 儿童端路由（AppShell 提供主题 + 导航骨架）
    {
      path: '/child',
      name: 'child',
      component: AppShell,
      redirect: '/child/dashboard',
      meta: { requiresAuth: true, role: 'child' },
      children: [
        {
          path: 'dashboard',
          name: 'child-dashboard',
          component: ChildDashboard,
          meta: { title: '我的成长' },
        },
        {
          path: 'achievements',
          name: 'child-achievements',
          component: ChildAchievements,
          meta: { title: '我的成就' },
        },
        {
          path: 'rewards',
          name: 'child-rewards',
          component: ChildRewards,
          meta: { title: '兑换奖励' },
        },
        {
          path: 'appeals',
          name: 'child-appeals',
          component: ChildAppeals,
          meta: { title: '申诉中心' },
        },
        {
          path: 'meetings',
          name: 'child-meetings',
          component: ChildMeetings,
          meta: { title: '家庭会议' },
        },
        {
          path: 'profile',
          name: 'child-profile',
          component: ChildProfile,
          meta: { title: '我的' },
        },
        {
          path: 'records',
          name: 'child-records',
          component: ChildRecords,
          meta: { title: '积分记录' },
        },
      ],
    },
    // 家长端路由
    {
      path: '/parent',
      name: 'parent',
      component: AppShell,
      redirect: '/parent/dashboard',
      meta: { requiresAuth: true, role: 'parent' },
      children: [
        {
          path: 'dashboard',
          name: 'parent-dashboard',
          component: ParentDashboard,
          meta: { title: '仪表盘' },
        },
        {
          path: 'points',
          name: 'parent-points',
          component: ParentPoints,
          meta: { title: '积分规则' },
        },
        {
          path: 'achievements',
          name: 'parent-achievements',
          component: ParentAchievements,
          meta: { title: '成就管理' },
        },
        {
          path: 'rewards',
          name: 'parent-rewards',
          component: ParentRewards,
          meta: { title: '奖励管理' },
        },
        {
          path: 'statistics',
          name: 'parent-statistics',
          component: ParentStatistics,
          meta: { title: '数据统计' },
        },
        {
          path: 'appeals',
          name: 'parent-appeals',
          component: ParentAppeals,
          meta: { title: '申诉审核' },
        },
        {
          path: 'meetings',
          name: 'parent-meetings',
          component: ParentMeetings,
          meta: { title: '家庭会议' },
        },
        {
          path: 'logs',
          name: 'parent-logs',
          component: ParentLogs,
          meta: { title: '系统日志' },
        },
        {
          path: 'backups',
          name: 'parent-backups',
          component: ParentBackups,
          meta: { title: '数据备份' },
        },
        {
          path: 'more',
          name: 'parent-more',
          component: ParentMore,
          meta: { title: '更多' },
        },
      ],
    },
    // 404 兜底：未匹配路由按角色回首页，避免空白页
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: () => {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) return '/login';
        return authStore.user?.role === 'child' ? '/child/dashboard' : '/parent/dashboard';
      },
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

  // 检查角色权限（匹配父级路由的 role 配置）
  const requiredRole = to.matched.find((r) => r.meta.role)?.meta.role;
  if (requiredRole && authStore.user?.role !== requiredRole) {
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
