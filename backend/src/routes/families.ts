import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { families, users } from '../db/schema';
import { authMiddleware, parentMiddleware } from '../middleware/auth';
import { generateInviteCode } from '../utils/helpers';
import type { Env } from '../index';

const familyRoutes = new Hono<{ Bindings: Env }>();

// 应用认证中间件
familyRoutes.use('*', authMiddleware);

// 获取当前用户家庭信息
familyRoutes.get('/me', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  
  try {
    // 获取当前用户信息
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();
    
    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 获取家庭信息
    const family = await db
      .select()
      .from(families)
      .where(eq(families.id, currentUser.familyId))
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
      .where(eq(users.familyId, family.id));
    
    return c.json({
      family,
      members,
    });
  } catch (error) {
    console.error('Get family error:', error);
    return c.json({ error: 'Failed to get family' }, 500);
  }
});

// 获取家庭信息（通过ID）
familyRoutes.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const familyId = parseInt(c.req.param('id'));
  const user = c.get('user');
  
  try {
    // 验证用户是否属于该家庭
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();
    
    if (!currentUser || currentUser.familyId !== familyId) {
      return c.json({ error: 'Forbidden - Not a family member' }, 403);
    }
    
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

// 创建家庭（需要家长权限）
familyRoutes.post('/', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  
  try {
    const data = await c.req.json();
    
    // 生成邀请码
    const inviteCode = generateInviteCode();
    
    // 创建家庭
    const result = await db.insert(families).values({
      name: data.name,
      inviteCode,
    }).returning();
    
    const family = result[0];
    
    // 更新创建者的家庭ID
    await db
      .update(users)
      .set({ familyId: family.id })
      .where(eq(users.id, user.userId));
    
    return c.json({
      message: 'Family created successfully',
      family,
    }, 201);
  } catch (error) {
    console.error('Create family error:', error);
    return c.json({ error: 'Failed to create family' }, 500);
  }
});

// 更新家庭信息（需要家长权限）
familyRoutes.put('/:id', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const familyId = parseInt(c.req.param('id'));
  const user = c.get('user');
  
  try {
    // 验证用户是否属于该家庭
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();
    
    if (!currentUser || currentUser.familyId !== familyId) {
      return c.json({ error: 'Forbidden - Not a family member' }, 403);
    }
    
    const data = await c.req.json();
    
    const result = await db
      .update(families)
      .set({
        name: data.name,
      })
      .where(eq(families.id, familyId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Family not found' }, 404);
    }
    
    return c.json({
      message: 'Family updated successfully',
      family: result[0],
    });
  } catch (error) {
    console.error('Update family error:', error);
    return c.json({ error: 'Failed to update family' }, 500);
  }
});

// 刷新邀请码（需要家长权限）
familyRoutes.post('/:id/refresh-code', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const familyId = parseInt(c.req.param('id'));
  const user = c.get('user');
  
  try {
    // 验证用户是否属于该家庭
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();
    
    if (!currentUser || currentUser.familyId !== familyId) {
      return c.json({ error: 'Forbidden - Not a family member' }, 403);
    }
    
    // 生成新的邀请码
    const newInviteCode = generateInviteCode();
    
    const result = await db
      .update(families)
      .set({ inviteCode: newInviteCode })
      .where(eq(families.id, familyId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Family not found' }, 404);
    }
    
    return c.json({
      message: 'Invite code refreshed successfully',
      inviteCode: newInviteCode,
    });
  } catch (error) {
    console.error('Refresh invite code error:', error);
    return c.json({ error: 'Failed to refresh invite code' }, 500);
  }
});

// 加入家庭
familyRoutes.post('/join', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  
  try {
    const { inviteCode } = await c.req.json();
    
    if (!inviteCode) {
      return c.json({ error: 'Invite code is required' }, 400);
    }
    
    // 验证邀请码
    const family = await db
      .select()
      .from(families)
      .where(eq(families.inviteCode, inviteCode.toUpperCase()))
      .get();
    
    if (!family) {
      return c.json({ error: 'Invalid invite code' }, 400);
    }
    
    // 更新用户的 familyId
    await db
      .update(users)
      .set({ familyId: family.id })
      .where(eq(users.id, user.userId));
    
    return c.json({
      message: 'Joined family successfully',
      family,
    });
  } catch (error) {
    console.error('Join family error:', error);
    return c.json({ error: 'Failed to join family' }, 500);
  }
});

// 离开家庭
familyRoutes.post('/leave', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  
  try {
    // 将用户移动到默认家庭（ID: 1）
    await db
      .update(users)
      .set({ familyId: 1 })
      .where(eq(users.id, user.userId));
    
    return c.json({
      message: 'Left family successfully',
    });
  } catch (error) {
    console.error('Leave family error:', error);
    return c.json({ error: 'Failed to leave family' }, 500);
  }
});

export { familyRoutes };
