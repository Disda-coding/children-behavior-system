import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import type { Env } from '../index';

const userRoutes = new Hono<{ Bindings: Env }>();

// 获取当前用户信息
userRoutes.get('/me', async (c) => {
  const db = drizzle(c.env.DB);
  
  // TODO: 从 JWT 中获取用户ID
  const userId = 1;
  
  try {
    const user = await db
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
      .where(eq(users.id, userId))
      .get();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// 更新用户信息
userRoutes.put('/me', async (c) => {
  const db = drizzle(c.env.DB);
  
  // TODO: 从 JWT 中获取用户ID
  const userId = 1;
  
  try {
    const data = await c.req.json();
    
    const result = await db
      .update(users)
      .set({
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
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

export { userRoutes };
