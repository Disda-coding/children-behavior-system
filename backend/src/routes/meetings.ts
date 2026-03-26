import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { meetings, users, pointRecords } from '../db/schema';
import type { Env } from '../index';
import { notifyMeetingScheduled, notifyMeetingCancelled, notifyMeetingScored, notifyPointsEarned } from '../utils/notification';

const meetingRoutes = new Hono<{ Bindings: Env }>();

// 获取会议列表
meetingRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const familyId = c.req.query('familyId');
    const childId = c.req.query('childId');
    const status = c.req.query('status');
    
    let query = db
      .select({
        meeting: meetings,
        child: users,
      })
      .from(meetings)
      .leftJoin(users, eq(meetings.childId, users.id));
    
    if (familyId) {
      query = query.where(eq(meetings.familyId, parseInt(familyId)));
    }
    
    if (childId) {
      query = query.where(eq(meetings.childId, parseInt(childId)));
    }
    
    if (status) {
      query = query.where(eq(meetings.status, status));
    }
    
    const list = await query.orderBy(desc(meetings.createdAt));
    
    return c.json({
      meetings: list.map(m => ({
        ...m.meeting,
        child: m.child,
      })),
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    return c.json({ error: 'Failed to get meetings' }, 500);
  }
});

// 获取会议统计
meetingRoutes.get('/stats', async (c) => {
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
    
    const allMeetings = await query;
    
    const stats = {
      total: allMeetings.length,
      pending: allMeetings.filter(m => m.status === 'pending').length,
      scheduled: allMeetings.filter(m => m.status === 'scheduled').length,
      completed: allMeetings.filter(m => m.status === 'completed').length,
      cancelled: allMeetings.filter(m => m.status === 'cancelled').length,
      averageScore: 0,
    };
    
    // 计算平均分
    const completedMeetings = allMeetings.filter(m => m.status === 'completed' && m.score !== null);
    if (completedMeetings.length > 0) {
      const totalScore = completedMeetings.reduce((sum, m) => sum + (m.score || 0), 0);
      stats.averageScore = Math.round((totalScore / completedMeetings.length) * 10) / 10;
    }
    
    return c.json({ stats });
  } catch (error) {
    console.error('Get meeting stats error:', error);
    return c.json({ error: 'Failed to get meeting stats' }, 500);
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
      status: 'pending',
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
        scheduledAt: data.scheduledAt,
        updatedAt: new Date().toISOString(),
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

// 安排会议（家长确认）
meetingRoutes.put('/:id/schedule', async (c) => {
  const db = drizzle(c.env.DB);
  const meetingId = parseInt(c.req.param('id'));

  try {
    const data = await c.req.json();

    // 获取会议信息
    const meetingInfo = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .get();

    if (!meetingInfo) {
      return c.json({ error: 'Meeting not found' }, 404);
    }

    const result = await db
      .update(meetings)
      .set({
        status: 'scheduled',
        scheduledAt: data.scheduledAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    // 发送会议安排通知
    await notifyMeetingScheduled(c.env.DB, meetingInfo.childId, meetingInfo.title, data.scheduledAt, meetingId);

    return c.json({
      message: 'Meeting scheduled successfully',
      meeting: result[0],
    });
  } catch (error) {
    console.error('Schedule meeting error:', error);
    return c.json({ error: 'Failed to schedule meeting' }, 500);
  }
});

// 取消会议
meetingRoutes.put('/:id/cancel', async (c) => {
  const db = drizzle(c.env.DB);
  const meetingId = parseInt(c.req.param('id'));

  try {
    const data = await c.req.json();

    // 获取会议信息
    const meetingInfo = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .get();

    if (!meetingInfo) {
      return c.json({ error: 'Meeting not found' }, 404);
    }

    const result = await db
      .update(meetings)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    // 发送会议取消通知
    await notifyMeetingCancelled(c.env.DB, meetingInfo.childId, meetingInfo.title, data.reason || '', meetingId);

    return c.json({
      message: 'Meeting cancelled successfully',
      meeting: result[0],
    });
  } catch (error) {
    console.error('Cancel meeting error:', error);
    return c.json({ error: 'Failed to cancel meeting' }, 500);
  }
});

// 评分并完成会议
meetingRoutes.post('/:id/score', async (c) => {
  const db = drizzle(c.env.DB);
  const meetingId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    // 获取会议信息
    const meetingInfo = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .get();
    
    if (!meetingInfo) {
      return c.json({ error: 'Meeting not found' }, 404);
    }
    
    // 更新会议状态
    const result = await db
      .update(meetings)
      .set({
        score: data.score,
        scoreNote: data.scoreNote,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(meetings.id, meetingId))
      .returning();
    
    // 发送会议评分通知
    await notifyMeetingScored(c.env.DB, meetingInfo.childId, meetingInfo.title, data.score, data.scoreNote || '', meetingId);

    // 根据评分给予积分奖励
    if (data.score >= 4) {
      // 高分奖励积分
      const latestRecord = await db
        .select()
        .from(pointRecords)
        .where(eq(pointRecords.userId, meetingInfo.childId))
        .orderBy(desc(pointRecords.createdAt))
        .limit(1)
        .get();

      const currentBalance = latestRecord?.balanceAfter || 0;
      const rewardPoints = data.score === 5 ? 50 : 30; // 5分奖励50，4分奖励30
      const newBalance = currentBalance + rewardPoints;

      const pointRecord = await db.insert(pointRecords).values({
        userId: meetingInfo.childId,
        type: 'earn',
        amount: rewardPoints,
        balanceAfter: newBalance,
        reason: `会议表现优秀奖励 (${data.score}分)`,
        createdBy: data.scoredBy,
      }).returning();

      // 发送积分获得通知
      await notifyPointsEarned(c.env.DB, meetingInfo.childId, rewardPoints, `会议表现优秀奖励 (${data.score}分)`, pointRecord[0].id);

      return c.json({
        message: 'Meeting scored successfully with reward',
        meeting: result[0],
        rewardPoints,
      });
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

// 删除会议
meetingRoutes.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const meetingId = parseInt(c.req.param('id'));
  
  try {
    const meeting = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .get();
    
    if (!meeting) {
      return c.json({ error: 'Meeting not found' }, 404);
    }
    
    // 只允许删除待审核或已取消的会议
    if (meeting.status !== 'pending' && meeting.status !== 'cancelled') {
      return c.json({ error: 'Cannot delete meeting with status: ' + meeting.status }, 400);
    }
    
    await db
      .delete(meetings)
      .where(eq(meetings.id, meetingId));
    
    return c.json({
      message: 'Meeting deleted successfully',
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return c.json({ error: 'Failed to delete meeting' }, 500);
  }
});

export { meetingRoutes };
