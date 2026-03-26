import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql } from 'drizzle-orm';
import { notifications } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const notificationRoutes = new Hono<{ Bindings: { DB: D1Database } }>();

// 应用认证中间件
notificationRoutes.use('*', authMiddleware);

// 获取通知列表
notificationRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.get('jwtPayload').userId;
  const { unreadOnly, limit = '20', offset = '0' } = c.req.query();

  try {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));

    if (unreadOnly === 'true') {
      query = query.where(eq(notifications.isRead, false));
    }

    const result = await query
      .orderBy(desc(notifications.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // 获取未读数量
    const unreadCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    return c.json({
      success: true,
      data: result,
      unreadCount: unreadCount[0]?.count || 0,
    });
  } catch (error) {
    console.error('获取通知失败:', error);
    return c.json({ success: false, message: '获取通知失败' }, 500);
  }
});

// 获取未读通知数量
notificationRoutes.get('/unread-count', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.get('jwtPayload').userId;

  try {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    return c.json({
      success: true,
      count: result[0]?.count || 0,
    });
  } catch (error) {
    console.error('获取未读数量失败:', error);
    return c.json({ success: false, message: '获取未读数量失败' }, 500);
  }
});

// 标记通知为已读
notificationRoutes.put('/:id/read', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.get('jwtPayload').userId;
  const notificationId = parseInt(c.req.param('id'));

  try {
    const result = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date().toISOString(),
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      return c.json({ success: false, message: '通知不存在' }, 404);
    }

    return c.json({
      success: true,
      message: '已标记为已读',
      data: result[0],
    });
  } catch (error) {
    console.error('标记已读失败:', error);
    return c.json({ success: false, message: '标记已读失败' }, 500);
  }
});

// 标记所有通知为已读
notificationRoutes.put('/read-all', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.get('jwtPayload').userId;

  try {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date().toISOString(),
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    return c.json({
      success: true,
      message: '全部标记为已读',
    });
  } catch (error) {
    console.error('标记全部已读失败:', error);
    return c.json({ success: false, message: '标记全部已读失败' }, 500);
  }
});

// 删除通知
notificationRoutes.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.get('jwtPayload').userId;
  const notificationId = parseInt(c.req.param('id'));

  try {
    const result = await db
      .delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      return c.json({ success: false, message: '通知不存在' }, 404);
    }

    return c.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    return c.json({ success: false, message: '删除通知失败' }, 500);
  }
});

// 删除所有已读通知
notificationRoutes.delete('/read', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.get('jwtPayload').userId;

  try {
    await db
      .delete(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, true)
      ));

    return c.json({
      success: true,
      message: '已删除所有已读通知',
    });
  } catch (error) {
    console.error('删除已读通知失败:', error);
    return c.json({ success: false, message: '删除已读通知失败' }, 500);
  }
});

export default notificationRoutes;
