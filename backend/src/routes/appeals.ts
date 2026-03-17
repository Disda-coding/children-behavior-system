import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { appeals, pointRecords } from '../db/schema';
import type { Env } from '../index';

const appealRoutes = new Hono<{ Bindings: Env }>();

// 获取申诉列表
appealRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    const status = c.req.query('status');
    
    let query = db
      .select({
        appeal: appeals,
        pointRecord: pointRecords,
      })
      .from(appeals)
      .leftJoin(pointRecords, eq(appeals.pointRecordId, pointRecords.id));
    
    if (userId) {
      query = query.where(eq(appeals.userId, parseInt(userId)));
    }
    
    if (status) {
      query = query.where(eq(appeals.status, status));
    }
    
    const list = await query.orderBy(desc(appeals.createdAt));
    
    return c.json({
      appeals: list.map(a => ({
        ...a.appeal,
        pointRecord: a.pointRecord,
      })),
    });
  } catch (error) {
    console.error('Get appeals error:', error);
    return c.json({ error: 'Failed to get appeals' }, 500);
  }
});

// 创建申诉
appealRoutes.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    const result = await db.insert(appeals).values({
      userId: data.userId,
      pointRecordId: data.pointRecordId,
      reason: data.reason,
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

// 处理申诉
appealRoutes.put('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const appealId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    const result = await db
      .update(appeals)
      .set({
        status: data.status,
        response: data.response,
        handledBy: data.handledBy,
        handledAt: new Date().toISOString(),
      })
      .where(eq(appeals.id, appealId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Appeal not found' }, 404);
    }
    
    return c.json({
      message: 'Appeal updated successfully',
      appeal: result[0],
    });
  } catch (error) {
    console.error('Update appeal error:', error);
    return c.json({ error: 'Failed to update appeal' }, 500);
  }
});

export { appealRoutes };
