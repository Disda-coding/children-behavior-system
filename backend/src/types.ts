import type { Env } from './index';

/**
 * 统一的 Hono 环境类型：所有路由使用此类型，
 * 使 c.get('user') 在 authMiddleware 之后获得正确类型。
 */
export type AppEnv = {
  Bindings: Env;
  Variables: {
    user: {
      userId: number;
      username: string;
      role: 'child' | 'parent';
    };
  };
};
