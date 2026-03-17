import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, desc } from 'drizzle-orm';
import { pointRecords, achievements, userAchievements } from '../db/schema';
import type { Env } from '../index';

const statsRoutes = new Hono<{ Bindings: Env }>();

// 获取积分统计
statsRoutes.get('/points', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    const days = parseInt(c.req.query('days') || '30');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    
    const userIdNum = parseInt(userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // 获取历史积分记录
    const records = await db
      .select()
      .from(pointRecords)
      .where(and(
        eq(pointRecords.userId, userIdNum),
        gte(pointRecords.createdAt, startDateStr)
      ))
      .orderBy(desc(pointRecords.createdAt));
    
    // 按日期分组统计
    const dailyStats: Record<string, { earned: number; deducted: number }> = {};
    
    records.forEach(record => {
      const date = record.createdAt.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { earned: 0, deducted: 0 };
      }
      
      if (record.type === 'earn') {
        dailyStats[date].earned += record.amount;
      } else if (record.type === 'deduct') {
        dailyStats[date].deducted += record.amount;
      }
    });
    
    return c.json({
      dailyStats,
      totalRecords: records.length,
    });
  } catch (error) {
    console.error('Get point stats error:', error);
    return c.json({ error: 'Failed to get point stats' }, 500);
  }
});

// 获取成就统计
statsRoutes.get('/achievements', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    
    const userIdNum = parseInt(userId);
    
    // 获取用户成就统计
    const userAchievementsList = await db
      .select({
        userAchievement: userAchievements,
        achievement: achievements,
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userIdNum));
    
    const completed = userAchievementsList.filter(ua => ua.userAchievement.isCompleted);
    const inProgress = userAchievementsList.filter(ua => !ua.userAchievement.isCompleted);
    
    return c.json({
      total: userAchievementsList.length,
      completed: completed.length,
      inProgress: inProgress.length,
      completedAchievements: completed.map(ca => ca.achievement),
    });
  } catch (error) {
    console.error('Get achievement stats error:', error);
    return c.json({ error: 'Failed to get achievement stats' }, 500);
  }
});

// 导出数据
statsRoutes.get('/export', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const type = c.req.query('type');
    const familyId = c.req.query('familyId');
    
    if (type === 'achievements') {
      const data = await db
        .select()
        .from(achievements)
        .where(eq(achievements.familyId, parseInt(familyId || '0')));
      
      return c.json({
        type: 'achievements',
        data,
        exportedAt: new Date().toISOString(),
      });
    }
    
    if (type === 'point-rules') {
      const data = await db
        .select()
        .from(pointRecords)
        .where(eq(pointRecords.familyId, parseInt(familyId || '0')));
      
      return c.json({
        type: 'point-rules',
        data,
        exportedAt: new Date().toISOString(),
      });
    }
    
    return c.json({ error: 'Invalid export type' }, 400);
  } catch (error) {
    console.error('Export data error:', error);
    return c.json({ error: 'Failed to export data' }, 500);
  }
});

export { statsRoutes };
