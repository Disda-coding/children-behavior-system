import type { FunctionalComponent } from 'vue';
import {
  Home,
  Trophy,
  Gift,
  UserRound,
  LayoutDashboard,
  ChartColumn,
  Coins,
  Flag,
  CalendarDays,
  ScrollText,
  DatabaseBackup,
  Ellipsis,
} from 'lucide-vue-next';

export interface NavItem {
  to: string;
  label: string;
  icon: FunctionalComponent;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/* 儿童端底部 Tab（移动端）与图标栏（桌面端） */
export const childTabs: NavItem[] = [
  { to: '/child/dashboard', label: '首页', icon: Home },
  { to: '/child/achievements', label: '成就', icon: Trophy },
  { to: '/child/rewards', label: '奖励', icon: Gift },
  { to: '/child/profile', label: '我的', icon: UserRound },
];

/* 家长端侧边栏分组导航（桌面端） */
export const parentNavGroups: NavGroup[] = [
  {
    title: '总览',
    items: [
      { to: '/parent/dashboard', label: '仪表盘', icon: LayoutDashboard },
      { to: '/parent/statistics', label: '数据统计', icon: ChartColumn },
    ],
  },
  {
    title: '激励',
    items: [
      { to: '/parent/points', label: '积分规则', icon: Coins },
      { to: '/parent/achievements', label: '成就管理', icon: Trophy },
      { to: '/parent/rewards', label: '奖励管理', icon: Gift },
    ],
  },
  {
    title: '事务',
    items: [
      { to: '/parent/appeals', label: '申诉审核', icon: Flag },
      { to: '/parent/meetings', label: '家庭会议', icon: CalendarDays },
    ],
  },
  {
    title: '系统',
    items: [
      { to: '/parent/logs', label: '系统日志', icon: ScrollText },
      { to: '/parent/backups', label: '数据备份', icon: DatabaseBackup },
    ],
  },
];

/* 家长端底部 Tab（移动端），"更多"进入全部功能列表 */
export const parentTabs: NavItem[] = [
  { to: '/parent/dashboard', label: '首页', icon: LayoutDashboard },
  { to: '/parent/points', label: '积分', icon: Coins },
  { to: '/parent/appeals', label: '审核', icon: Flag },
  { to: '/parent/more', label: '更多', icon: Ellipsis },
];
