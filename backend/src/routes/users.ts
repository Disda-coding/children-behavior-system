import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../index';

const userRoutes = new Hono<{ Bindings: Env }>();

// 应用认证中间件
userRoutes.use('*', authMiddleware);

// 获取当前用户信息
userRoutes.get('/me', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  
  try {
    const userData = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        familyId: users.familyId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .get();
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// 更新当前用户信息
userRoutes.put('/me', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  
  try {
    const data = await c.req.json();
    
    const result = await db
      .update(users)
      .set({
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.userId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      message: 'User updated successfully',
      user: result[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// 获取指定用户信息（需要是同家庭成员）
userRoutes.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const targetUserId = parseInt(c.req.param('id'));
  
  try {
    // 获取当前用户信息
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();
    
    if (!currentUser) {
      return c.json({ error: 'Current user not found' }, 404);
    }
    
    // 获取目标用户信息
    const targetUser = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        familyId: users.familyId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .get();
    
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 验证是否属于同一家庭
    if (currentUser.familyId !== targetUser.familyId) {
      return c.json({ error: 'Forbidden - Not in the same family' }, 403);
    }
    
    return c.json({ user: targetUser });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

export { userRoutes };
