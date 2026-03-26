import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// 导入路由
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { familyRoutes } from './routes/families';
import { pointRoutes } from './routes/points';
import { achievementRoutes } from './routes/achievements';
import { rewardRoutes } from './routes/rewards';
import { appealRoutes } from './routes/appeals';
import { meetingRoutes } from './routes/meetings';
import { statsRoutes } from './routes/stats';
import { uploadRoutes } from './routes/upload';
import notificationRoutes from './routes/notifications';
import { logRoutes } from './routes/logs';
import { backupRoutes } from './routes/backups';
import { autoBackup } from './cron/backup';

// 定义环境变量类型
export type Env = {
  DB: D1Database;
  PPT_STORAGE: KVNamespace;
  JWT_SECRET: string;
};

// 创建 Hono 应用
const app = new Hono<{ Bindings: Env }>();

// 中间件
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 健康检查
app.get('/', (c) => {
  return c.json({
    message: 'Children Behavior Management System API',
    version: '1.0.0',
    status: 'running',
  });
});

// API 路由
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/families', familyRoutes);
app.route('/api/points', pointRoutes);
app.route('/api/achievements', achievementRoutes);
app.route('/api/rewards', rewardRoutes);
app.route('/api/appeals', appealRoutes);
app.route('/api/meetings', meetingRoutes);
app.route('/api/stats', statsRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/logs', logRoutes);
app.route('/api/backups', backupRoutes);

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
  }, 500);
});

// 导出默认应用
export default {
  // HTTP 请求处理
  fetch: app.fetch,

  // 定时任务处理
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    switch (event.cron) {
      case '0 2 * * *':
        // 每天凌晨2点执行自动备份
        console.log('Running scheduled backup task...');
        ctx.waitUntil(autoBackup(env));
        break;
      default:
        console.log('Unknown cron trigger:', event.cron);
    }
  },
};
