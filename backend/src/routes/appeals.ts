import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { appeals, pointRecords, users, pointRules } from '../db/schema';
import type { Env } from '../index';
import { notifyAppealApproved, notifyAppealRejected } from '../utils/notification';

const appealRoutes = new Hono<{ Bindings: Env }>();

// 获取申诉列表
appealRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    const familyId = c.req.query('familyId');
    const status = c.req.query('status');
    
    let query = db
      .select({
        appeal: appeals,
        pointRecord: pointRecords,
        user: users,
      })
      .from(appeals)
      .leftJoin(pointRecords, eq(appeals.pointRecordId, pointRecords.id))
      .leftJoin(users, eq(appeals.userId, users.id));
    
    if (userId) {
      query = query.where(eq(appeals.userId, parseInt(userId)));
    }
    
    if (status) {
      query = query.where(eq(appeals.status, status));
    }
    
    // 如果指定了 familyId，通过 pointRecord 的 user 关联来过滤
    if (familyId) {
      query = query.where(eq(users.familyId, parseInt(familyId)));
    }
    
    const list = await query.orderBy(desc(appeals.createdAt));
    
    return c.json({
      appeals: list.map(a => ({
        ...a.appeal,
        pointRecord: a.pointRecord,
        user: a.user,
      })),
    });
  } catch (error) {
    console.error('Get appeals error:', error);
    return c.json({ error: 'Failed to get appeals' }, 500);
  }
});

// 获取申诉统计
appealRoutes.get('/stats', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const familyId = c.req.query('familyId');
    
    let query = db
      .select({
        appeal: appeals,
        user: users,
      })
      .from(appeals)
      .leftJoin(users, eq(appeals.userId, users.id));
    
    if (familyId) {
      query = query.where(eq(users.familyId, parseInt(familyId)));
    }
    
    const allAppeals = await query;
    
    const stats = {
      total: allAppeals.length,
      pending: allAppeals.filter(a => a.appeal.status === 'pending').length,
      approved: allAppeals.filter(a => a.appeal.status === 'approved').length,
      rejected: allAppeals.filter(a => a.appeal.status === 'rejected').length,
    };
    
    return c.json({ stats });
  } catch (error) {
    console.error('Get appeal stats error:', error);
    return c.json({ error: 'Failed to get appeal stats' }, 500);
  }
});

// 创建申诉
appealRoutes.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    // 检查是否已经申诉过
    const existing = await db
      .select()
      .from(appeals)
      .where(and(
        eq(appeals.pointRecordId, data.pointRecordId),
        eq(appeals.userId, data.userId)
      ))
      .get();
    
    if (existing) {
      return c.json({ error: 'Already appealed for this record' }, 400);
    }
    
    const result = await db.insert(appeals).values({
      userId: data.userId,
      pointRecordId: data.pointRecordId,
      reason: data.reason,
      status: 'pending',
    }).returning();
    
    return c.json({
      message: 'Appeal created successfully',
      appeal: result[0],
    }, 201);
  } catch (error) {
    console.error('Create appeal error:', error);
    return c.json({ error: 'Failed to create appeal' }, 500);
  }
});

// 处理申诉（通过）
appealRoutes.put('/:id/approve', async (c) => {
  const db = drizzle(c.env.DB);
  const appealId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    // 获取申诉信息
    const appeal = await db
      .select({
        appeal: appeals,
        pointRecord: pointRecords,
      })
      .from(appeals)
      .leftJoin(pointRecords, eq(appeals.pointRecordId, pointRecords.id))
      .where(eq(appeals.id, appealId))
      .get();
    
    if (!appeal) {
      return c.json({ error: 'Appeal not found' }, 404);
    }
    
    if (appeal.appeal.status !== 'pending') {
      return c.json({ error: 'Appeal already processed' }, 400);
    }
    
    // 返还积分
    const latestRecord = await db
      .select()
      .from(pointRecords)
      .where(eq(pointRecords.userId, appeal.appeal.userId))
      .orderBy(desc(pointRecords.createdAt))
      .limit(1)
      .get();
    
    const currentBalance = latestRecord?.balanceAfter || 0;
    const refundAmount = Math.abs(appeal.pointRecord?.amount || 0);
    const newBalance = currentBalance + refundAmount;
    
    await db.insert(pointRecords).values({
      userId: appeal.appeal.userId,
      type: 'earn',
      amount: refundAmount,
      balanceAfter: newBalance,
      reason: `申诉通过返还: ${appeal.pointRecord?.reason}`,
      createdBy: data.handledBy,
    });
    
    // 更新申诉状态
    const result = await db
      .update(appeals)
      .set({
        status: 'approved',
        response: data.response || '申诉通过，积分已返还',
        handledBy: data.handledBy,
        handledAt: new Date().toISOString(),
      })
      .where(eq(appeals.id, appealId))
      .returning();

    // 发送申诉通过通知
    await notifyAppealApproved(c.env.DB, appeal.appeal.userId, refundAmount, appealId);

    return c.json({
      message: 'Appeal approved and points refunded',
      appeal: result[0],
      refundedPoints: refundAmount,
    });
  } catch (error) {
    console.error('Approve appeal error:', error);
    return c.json({ error: 'Failed to approve appeal' }, 500);
  }
});

// 处理申诉（驳回）
appealRoutes.put('/:id/reject', async (c) => {
  const db = drizzle(c.env.DB);
  const appealId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    const appeal = await db
      .select()
      .from(appeals)
      .where(eq(appeals.id, appealId))
      .get();
    
    if (!appeal) {
      return c.json({ error: 'Appeal not found' }, 404);
    }
    
    if (appeal.status !== 'pending') {
      return c.json({ error: 'Appeal already processed' }, 400);
    }
    
    const result = await db
      .update(appeals)
      .set({
        status: 'rejected',
        response: data.response || '申诉被驳回',
        handledBy: data.handledBy,
        handledAt: new Date().toISOString(),
      })
      .where(eq(appeals.id, appealId))
      .returning();

    // 发送申诉驳回通知
    await notifyAppealRejected(c.env.DB, appeal.userId, data.response || '申诉被驳回', appealId);

    return c.json({
      message: 'Appeal rejected',
      appeal: result[0],
    });
  } catch (error) {
    console.error('Reject appeal error:', error);
    return c.json({ error: 'Failed to reject appeal' }, 500);
  }
});

// 撤销申诉（仅限待审核状态）
appealRoutes.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const appealId = parseInt(c.req.param('id'));
  
  try {
    const appeal = await db
      .select()
      .from(appeals)
      .where(eq(appeals.id, appealId))
      .get();
    
    if (!appeal) {
      return c.json({ error: 'Appeal not found' }, 404);
    }
    
    if (appeal.status !== 'pending') {
      return c.json({ error: 'Cannot delete processed appeal' }, 400);
    }
    
    await db
      .delete(appeals)
      .where(eq(appeals.id, appealId));
    
    return c.json({
      message: 'Appeal deleted successfully',
    });
  } catch (error) {
    console.error('Delete appeal error:', error);
    return c.json({ error: 'Failed to delete appeal' }, 500);
  }
});

export { appealRoutes };
