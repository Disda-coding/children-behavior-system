import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { families, users } from '../db/schema';
import type { Env } from '../index';

const familyRoutes = new Hono<{ Bindings: Env }>();

// 获取家庭信息
familyRoutes.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const familyId = parseInt(c.req.param('id'));
  
  try {
    const family = await db
      .select()
      .from(families)
      .where(eq(families.id, familyId))
      .get();
    
    if (!family) {
      return c.json({ error: 'Family not found' }, 404);
    }
    
    // 获取家庭成员
    const members = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.familyId, familyId));
    
    return c.json({
      family,
      members,
    });
  } catch (error) {
    console.error('Get family error:', error);
    return c.json({ error: 'Failed to get family' }, 500);
  }
});

// 创建家庭
familyRoutes.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    // 生成邀请码
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const result = await db.insert(families).values({
      name: data.name,
      inviteCode,
    }).returning();
    
    return c.json({
      message: 'Family created successfully',
      family: result[0],
    }, 201);
  } catch (error) {
    console.error('Create family error:', error);
    return c.json({ error: 'Failed to create family' }, 500);
  }
});

// 加入家庭
familyRoutes.post('/:id/join', async (c) => {
  const db = drizzle(c.env.DB);
  const familyId = parseInt(c.req.param('id'));
  
  try {
    const { inviteCode } = await c.req.json();
    
    // 验证邀请码
    const family = await db
      .select()
      .from(families)
      .where(eq(families.id, familyId))
      .get();
    
    if (!family) {
      return c.json({ error: 'Family not found' }, 404);
    }
    
    if (family.inviteCode !== inviteCode) {
      return c.json({ error: 'Invalid invite code' }, 400);
    }
    
    // TODO: 更新用户的 familyId
    
    return c.json({
      message: 'Joined family successfully',
      family,
    });
  } catch (error) {
    console.error('Join family error:', error);
    return c.json({ error: 'Failed to join family' }, 500);
  }
});

export { familyRoutes };
