import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { meetings } from '../db/schema';
import type { Env } from '../index';

const meetingRoutes = new Hono<{ Bindings: Env }>();

// 获取会议列表
meetingRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const familyId = c.req.query('familyId');
    const childId = c.req.query('childId');
    
    let query = db.select().from(meetings);
    
    if (familyId) {
      query = query.where(eq(meetings.familyId, parseInt(familyId)));
    }
    
    if (childId) {
      query = query.where(eq(meetings.childId, parseInt(childId)));
    }
    
    const list = await query.orderBy(desc(meetings.createdAt));
    
    return c.json({ meetings: list });
  } catch (error) {
    console.error('Get meetings error:', error);
    return c.json({ error: 'Failed to get meetings' }, 500);
  }
});

// 创建会议
meetingRoutes.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    const result = await db.insert(meetings).values({
      familyId: data.familyId,
      childId: data.childId,
      title: data.title,
      description: data.description,
      pptUrl: data.pptUrl,
      scheduledAt: data.scheduledAt,
    }).returning();
    
    return c.json({
      message: 'Meeting created successfully',
      meeting: result[0],
    }, 201);
  } catch (error) {
    console.error('Create meeting error:', error);
    return c.json({ error: 'Failed to create meeting' }, 500);
  }
});

// 更新会议
meetingRoutes.put('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const meetingId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    const result = await db
      .update(meetings)
      .set({
        title: data.title,
        description: data.description,
        pptUrl: data.pptUrl,
        status: data.status,
        scheduledAt: data.scheduledAt,
      })
      .where(eq(meetings.id, meetingId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Meeting not found' }, 404);
    }
    
    return c.json({
      message: 'Meeting updated successfully',
      meeting: result[0],
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    return c.json({ error: 'Failed to update meeting' }, 500);
  }
});

// 评分
meetingRoutes.post('/:id/score', async (c) => {
  const db = drizzle(c.env.DB);
  const meetingId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    const result = await db
      .update(meetings)
      .set({
        score: data.score,
        scoreNote: data.scoreNote,
        status: 'completed',
      })
      .where(eq(meetings.id, meetingId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Meeting not found' }, 404);
    }
    
    return c.json({
      message: 'Meeting scored successfully',
      meeting: result[0],
    });
  } catch (error) {
    console.error('Score meeting error:', error);
    return c.json({ error: 'Failed to score meeting' }, 500);
  }
});

export { meetingRoutes };
