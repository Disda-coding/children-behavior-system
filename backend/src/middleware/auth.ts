import type { Context, Next } from 'hono';
import type { Env } from '../index';
import { verifyJWT } from '../routes/auth';

// 扩展 Context 类型
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      userId: number;
      username: string;
      role: 'child' | 'parent';
    };
  }
}

// JWT 认证中间件
export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    
    // 将用户信息存储在 context 中
    c.set('user', {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    });
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
};

// 家长权限中间件
export const parentMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  if (user.role !== 'parent') {
    return c.json({ error: 'Forbidden - Parent access required' }, 403);
  }
  
  await next();
};

// 儿童权限中间件
export const childMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  if (user.role !== 'child') {
    return c.json({ error: 'Forbidden - Child access required' }, 403);
  }
  
  await next();
};
