import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { achievements, userAchievements, users } from '../db/schema';
import type { Env } from '../index';

const achievementRoutes = new Hono<{ Bindings: Env }>();

// 获取成就列表
achievementRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const familyId = c.req.query('familyId');
    
    let query = db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true));
    
    if (familyId) {
      query = query.where(eq(achievements.familyId, parseInt(familyId)));
    }
    
    const list = await query;
    
    return c.json({ achievements: list });
  } catch (error) {
    console.error('Get achievements error:', error);
    return c.json({ error: 'Failed to get achievements' }, 500);
  }
});

// 获取成就模板
achievementRoutes.get('/templates', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const templates = await db
      .select()
      .from(achievements)
      .where(eq(achievements.isTemplate, true));
    
    return c.json({ templates });
  } catch (error) {
    console.error('Get achievement templates error:', error);
    return c.json({ error: 'Failed to get achievement templates' }, 500);
  }
});

// 创建成就
achievementRoutes.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    const result = await db.insert(achievements).values({
      familyId: data.familyId,
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      iconUrl: data.iconUrl,
      conditionType: data.conditionType,
      conditionValue: data.conditionValue,
      conditionUnit: data.conditionUnit,
      rewardPoints: data.rewardPoints,
      isTemplate: data.isTemplate || false,
    }).returning();
    
    return c.json({
      message: 'Achievement created successfully',
      achievement: result[0],
    }, 201);
  } catch (error) {
    console.error('Create achievement error:', error);
    return c.json({ error: 'Failed to create achievement' }, 500);
  }
});

// 赋予用户成就
achievementRoutes.post('/:id/assign', async (c) => {
  const db = drizzle(c.env.DB);
  const achievementId = parseInt(c.req.param('id'));
  
  try {
    const { userId, note } = await c.req.json();
    
    // 检查成就是否存在
    const achievement = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .get();
    
    if (!achievement) {
      return c.json({ error: 'Achievement not found' }, 404);
    }
    
    // 检查用户是否存在
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 检查是否已赋予
    const existing = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ))
      .get();
    
    if (existing) {
      return c.json({ error: 'Achievement already assigned to this user' }, 400);
    }
    
    // 创建用户成就记录
    const result = await db.insert(userAchievements).values({
      userId,
      achievementId,
      currentValue: achievement.conditionValue,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      note: note || null,
    }).returning();
    
    return c.json({
      message: 'Achievement assigned successfully',
      userAchievement: result[0],
    }, 201);
  } catch (error) {
    console.error('Assign achievement error:', error);
    return c.json({ error: 'Failed to assign achievement' }, 500);
  }
});

// 获取用户成就
achievementRoutes.get('/user/:userId', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = parseInt(c.req.param('userId'));
  
  try {
    const userAchievementsList = await db
      .select({
        userAchievement: userAchievements,
        achievement: achievements,
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
    
    return c.json({
      userAchievements: userAchievementsList.map(ua => ({
        ...ua.userAchievement,
        achievement: ua.achievement,
      })),
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    return c.json({ error: 'Failed to get user achievements' }, 500);
  }
});

export { achievementRoutes };
