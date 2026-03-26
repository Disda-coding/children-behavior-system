import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql, like, gte, lte } from 'drizzle-orm';
import { systemLogs, users } from '../db/schema';
import { authMiddleware, parentMiddleware } from '../middleware/auth';
import type { Env } from '../index';

const logRoutes = new Hono<{ Bindings: Env }>();

// 应用认证中间件
logRoutes.use('*', authMiddleware);

// 获取日志列表（仅家长可查看）
logRoutes.get('/', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
      search,
      limit = '50',
      offset = '0',
    } = c.req.query();

    let query = db
      .select({
        log: systemLogs,
        user: users,
      })
      .from(systemLogs)
      .leftJoin(users, eq(systemLogs.userId, users.id));

    // 构建过滤条件
    const conditions = [];

    if (userId) {
      conditions.push(eq(systemLogs.userId, parseInt(userId)));
    }

    if (action) {
      conditions.push(eq(systemLogs.action, action));
    }

    if (entityType) {
      conditions.push(eq(systemLogs.entityType, entityType));
    }

    if (startDate) {
      conditions.push(gte(systemLogs.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(systemLogs.createdAt, endDate));
    }

    if (search) {
      conditions.push(
        sql`${systemLogs.description} LIKE ${`%${search}%`} OR ${systemLogs.action} LIKE ${`%${search}%`}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(systemLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count || 0;

    // 获取分页数据
    const logs = await query
      .orderBy(desc(systemLogs.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    return c.json({
      success: true,
      data: logs.map(l => ({
        ...l.log,
        user: l.user,
        oldValue: l.log.oldValue ? JSON.parse(l.log.oldValue) : null,
        newValue: l.log.newValue ? JSON.parse(l.log.newValue) : null,
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    return c.json({ success: false, message: '获取日志失败' }, 500);
  }
});

// 获取日志统计（仅家长）
logRoutes.get('/stats', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const { days = '7' } = c.req.query();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startDateStr = startDate.toISOString();

    // 获取操作类型统计
    const actionStats = await db
      .select({
        action: systemLogs.action,
        count: sql<number>`COUNT(*)`,
      })
      .from(systemLogs)
      .where(gte(systemLogs.createdAt, startDateStr))
      .groupBy(systemLogs.action);

    // 获取每日统计
    const dailyStats = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(systemLogs)
      .where(gte(systemLogs.createdAt, startDateStr))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // 获取实体类型统计
    const entityStats = await db
      .select({
        entityType: systemLogs.entityType,
        count: sql<number>`COUNT(*)`,
      })
      .from(systemLogs)
      .where(gte(systemLogs.createdAt, startDateStr))
      .groupBy(systemLogs.entityType);

    return c.json({
      success: true,
      data: {
        actionStats,
        dailyStats,
        entityStats,
        period: `${days}天`,
      },
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    return c.json({ success: false, message: '获取日志统计失败' }, 500);
  }
});

// 获取操作类型列表
logRoutes.get('/actions', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const actions = await db
      .select({
        action: systemLogs.action,
        count: sql<number>`COUNT(*)`,
      })
      .from(systemLogs)
      .groupBy(systemLogs.action)
      .orderBy(desc(sql`COUNT(*)`));

    return c.json({
      success: true,
      data: actions,
    });
  } catch (error) {
    console.error('Get actions error:', error);
    return c.json({ success: false, message: '获取操作类型失败' }, 500);
  }
});

// 获取单条日志详情
logRoutes.get('/:id', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const logId = parseInt(c.req.param('id'));

  try {
    const log = await db
      .select({
        log: systemLogs,
        user: users,
      })
      .from(systemLogs)
      .leftJoin(users, eq(systemLogs.userId, users.id))
      .where(eq(systemLogs.id, logId))
      .get();

    if (!log) {
      return c.json({ success: false, message: '日志不存在' }, 404);
    }

    return c.json({
      success: true,
      data: {
        ...log.log,
        user: log.user,
        oldValue: log.log.oldValue ? JSON.parse(log.log.oldValue) : null,
        newValue: log.log.newValue ? JSON.parse(log.log.newValue) : null,
      },
    });
  } catch (error) {
    console.error('Get log detail error:', error);
    return c.json({ success: false, message: '获取日志详情失败' }, 500);
  }
});

// 删除日志（仅家长，且只能删除30天前的日志）
logRoutes.delete('/:id', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const logId = parseInt(c.req.param('id'));

  try {
    const log = await db
      .select()
      .from(systemLogs)
      .where(eq(systemLogs.id, logId))
      .get();

    if (!log) {
      return c.json({ success: false, message: '日志不存在' }, 404);
    }

    // 检查是否为30天前的日志
    const logDate = new Date(log.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (logDate > thirtyDaysAgo) {
      return c.json({ success: false, message: '只能删除30天前的日志' }, 400);
    }

    await db.delete(systemLogs).where(eq(systemLogs.id, logId));

    return c.json({
      success: true,
      message: '日志删除成功',
    });
  } catch (error) {
    console.error('Delete log error:', error);
    return c.json({ success: false, message: '删除日志失败' }, 500);
  }
});

// 清理旧日志（仅家长，删除90天前的日志）
logRoutes.delete('/cleanup/old', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const cutoffDate = ninetyDaysAgo.toISOString();

    const result = await db
      .delete(systemLogs)
      .where(lte(systemLogs.createdAt, cutoffDate))
      .returning();

    return c.json({
      success: true,
      message: `成功清理 ${result.length} 条旧日志`,
      deletedCount: result.length,
    });
  } catch (error) {
    console.error('Cleanup logs error:', error);
    return c.json({ success: false, message: '清理日志失败' }, 500);
  }
});

export { logRoutes };
