import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { pointRecords, pointRules } from '../db/schema';
import type { Env } from '../index';

const pointRoutes = new Hono<{ Bindings: Env }>();

// 获取积分规则列表
pointRoutes.get('/rules', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const rules = await db
      .select()
      .from(pointRules)
      .where(eq(pointRules.isActive, true));
    
    return c.json({ rules });
  } catch (error) {
    console.error('Get point rules error:', error);
    return c.json({ error: 'Failed to get point rules' }, 500);
  }
});

// 创建积分规则
pointRoutes.post('/rules', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    const result = await db.insert(pointRules).values({
      familyId: data.familyId,
      name: data.name,
      description: data.description,
      type: data.type,
      points: data.points,
      category: data.category,
    }).returning();
    
    return c.json({
      message: 'Point rule created successfully',
      rule: result[0],
    }, 201);
  } catch (error) {
    console.error('Create point rule error:', error);
    return c.json({ error: 'Failed to create point rule' }, 500);
  }
});

// 获取积分记录
pointRoutes.get('/records', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    const type = c.req.query('type');
    
    let query = db.select().from(pointRecords);
    
    if (userId) {
      query = query.where(eq(pointRecords.userId, parseInt(userId)));
    }
    
    if (type) {
      query = query.where(eq(pointRecords.type, type));
    }
    
    const records = await query.orderBy(desc(pointRecords.createdAt));
    
    return c.json({ records });
  } catch (error) {
    console.error('Get point records error:', error);
    return c.json({ error: 'Failed to get point records' }, 500);
  }
});

// 创建积分记录
pointRoutes.post('/records', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    // 计算新的余额
    const lastRecord = await db
      .select({ balanceAfter: pointRecords.balanceAfter })
      .from(pointRecords)
      .where(eq(pointRecords.userId, data.userId))
      .orderBy(desc(pointRecords.createdAt))
      .limit(1)
      .get();
    
    const currentBalance = lastRecord?.balanceAfter || 0;
    let newBalance = currentBalance;
    
    if (data.type === 'earn') {
      newBalance = currentBalance + data.amount;
    } else if (data.type === 'deduct' || data.type === 'redeem') {
      newBalance = currentBalance - data.amount;
    }
    
    const result = await db.insert(pointRecords).values({
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      balanceAfter: newBalance,
      reason: data.reason,
      ruleId: data.ruleId,
      createdBy: data.createdBy,
    }).returning();
    
    return c.json({
      message: 'Point record created successfully',
      record: result[0],
    }, 201);
  } catch (error) {
    console.error('Create point record error:', error);
    return c.json({ error: 'Failed to create point record' }, 500);
  }
});

// 获取积分统计
pointRoutes.get('/stats', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    
    const userIdNum = parseInt(userId);
    
    // 获取最新余额
    const lastRecord = await db
      .select({ balanceAfter: pointRecords.balanceAfter })
      .from(pointRecords)
      .where(eq(pointRecords.userId, userIdNum))
      .orderBy(desc(pointRecords.createdAt))
      .limit(1)
      .get();
    
    const totalBalance = lastRecord?.balanceAfter || 0;
    
    // 获取今日积分
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = await db
      .select()
      .from(pointRecords)
      .where(and(
        eq(pointRecords.userId, userIdNum),
        gte(pointRecords.createdAt, today)
      ));
    
    const todayEarned = todayRecords
      .filter(r => r.type === 'earn')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const todayDeducted = todayRecords
      .filter(r => r.type === 'deduct')
      .reduce((sum, r) => sum + r.amount, 0);
    
    // 获取本周积分
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const weekRecords = await db
      .select()
      .from(pointRecords)
      .where(and(
        eq(pointRecords.userId, userIdNum),
        gte(pointRecords.createdAt, weekStartStr)
      ));
    
    const weekEarned = weekRecords
      .filter(r => r.type === 'earn')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const weekDeducted = weekRecords
      .filter(r => r.type === 'deduct')
      .reduce((sum, r) => sum + r.amount, 0);
    
    return c.json({
      stats: {
        todayEarned,
        todayDeducted,
        weekEarned,
        weekDeducted,
        totalBalance,
      },
    });
  } catch (error) {
    console.error('Get point stats error:', error);
    return c.json({ error: 'Failed to get point stats' }, 500);
  }
});

export { pointRoutes };
