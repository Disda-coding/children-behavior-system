import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, desc } from 'drizzle-orm';
import { pointRecords, pointRules, users } from '../db/schema';
import { authMiddleware, parentMiddleware } from '../middleware/auth';
import type { Env } from '../index';
import { notifyPointsEarned, notifyPointsDeducted } from '../utils/notification';
import { logPointOperation, logConfigOperation } from '../utils/logger';

const pointRoutes = new Hono<{ Bindings: Env }>();

// 应用认证中间件
pointRoutes.use('*', authMiddleware);

// 获取积分规则列表
pointRoutes.get('/rules', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const rules = await db
      .select()
      .from(pointRules)
      .where(and(
        eq(pointRules.isActive, true),
        eq(pointRules.familyId, currentUser.familyId)
      ));

    return c.json({ rules });
  } catch (error) {
    console.error('Get point rules error:', error);
    return c.json({ error: 'Failed to get point rules' }, 500);
  }
});

// 创建积分规则（需要家长权限）
pointRoutes.post('/rules', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  try {
    const data = await c.req.json();

    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const result = await db.insert(pointRules).values({
      familyId: currentUser.familyId,
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

// 更新积分规则（需要家长权限）
pointRoutes.put('/rules/:id', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const ruleId = parseInt(c.req.param('id'));
  const user = c.get('user');

  try {
    const data = await c.req.json();

    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const result = await db
      .update(pointRules)
      .set({
        name: data.name,
        description: data.description,
        type: data.type,
        points: data.points,
        category: data.category,
        isActive: data.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(and(
        eq(pointRules.id, ruleId),
        eq(pointRules.familyId, currentUser.familyId)
      ))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Rule not found' }, 404);
    }

    return c.json({
      message: 'Point rule updated successfully',
      rule: result[0],
    });
  } catch (error) {
    console.error('Update point rule error:', error);
    return c.json({ error: 'Failed to update point rule' }, 500);
  }
});

// 删除积分规则（需要家长权限）
pointRoutes.delete('/rules/:id', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const ruleId = parseInt(c.req.param('id'));
  const user = c.get('user');

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const result = await db
      .update(pointRules)
      .set({ isActive: false })
      .where(and(
        eq(pointRules.id, ruleId),
        eq(pointRules.familyId, currentUser.familyId)
      ))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Rule not found' }, 404);
    }

    return c.json({
      message: 'Point rule deleted successfully',
    });
  } catch (error) {
    console.error('Delete point rule error:', error);
    return c.json({ error: 'Failed to delete point rule' }, 500);
  }
});

// 获取积分记录
pointRoutes.get('/records', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  try {
    const targetUserId = c.req.query('userId');
    const type = c.req.query('type');

    // 获取当前用户信息
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    let query = db.select().from(pointRecords);

    if (targetUserId) {
      const targetId = parseInt(targetUserId);

      // 验证权限：只能查看自己或同家庭成员的记录
      const targetUser = await db
        .select()
        .from(users)
        .where(eq(users.id, targetId))
        .get();

      if (!targetUser || targetUser.familyId !== currentUser.familyId) {
        return c.json({ error: 'Forbidden - Not in the same family' }, 403);
      }

      query = query.where(eq(pointRecords.userId, targetId));
    } else {
      // 如果没有指定用户ID，默认查询当前用户的记录
      query = query.where(eq(pointRecords.userId, user.userId));
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

// 创建积分记录（需要家长权限）
pointRoutes.post('/records', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  try {
    const data = await c.req.json();

    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 验证目标用户是否属于同一家庭
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .get();

    if (!targetUser || targetUser.familyId !== currentUser.familyId) {
      return c.json({ error: 'Forbidden - Target user not in the same family' }, 403);
    }

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
      createdBy: user.userId,
    }).returning();

    // 发送通知
    if (data.type === 'earn') {
      await notifyPointsEarned(c.env.DB, data.userId, data.amount, data.reason, result[0].id);
    } else if (data.type === 'deduct') {
      await notifyPointsDeducted(c.env.DB, data.userId, data.amount, data.reason, result[0].id);
    }

    // 记录日志
    await logPointOperation(
      c.env.DB,
      user.userId,
      'point_create',
      result[0].id,
      result[0],
      undefined,
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || '',
      c.req.header('User-Agent') || ''
    );

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
  const user = c.get('user');

  try {
    const targetUserId = c.req.query('userId');

    let userIdNum: number;

    if (targetUserId) {
      userIdNum = parseInt(targetUserId);

      // 验证权限
      const currentUser = await db
        .select()
        .from(users)
        .where(eq(users.id, user.userId))
        .get();

      const targetUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userIdNum))
        .get();

      if (!currentUser || !targetUser || currentUser.familyId !== targetUser.familyId) {
        return c.json({ error: 'Forbidden - Not in the same family' }, 403);
      }
    } else {
      userIdNum = user.userId;
    }

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

// 导出积分规则配置（JSON格式）
pointRoutes.get('/rules/export', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 获取所有积分规则
    const rules = await db
      .select()
      .from(pointRules)
      .where(eq(pointRules.familyId, currentUser.familyId));

    // 构建导出数据
    const exportData = {
      exportVersion: '1.0',
      exportDate: new Date().toISOString(),
      familyId: currentUser.familyId,
      familyName: currentUser.familyName || '',
      exportedBy: currentUser.displayName,
      rules: rules.map(rule => ({
        name: rule.name,
        description: rule.description,
        type: rule.type,
        points: rule.points,
        category: rule.category,
        isActive: rule.isActive,
      })),
    };

    // 记录日志
    await logConfigOperation(
      c.env.DB,
      user.userId,
      'config_export',
      '积分规则',
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || '',
      c.req.header('User-Agent') || ''
    );

    // 设置响应头，触发下载
    c.header('Content-Type', 'application/json');
    c.header('Content-Disposition', `attachment; filename="point-rules-${currentUser.familyId}-${Date.now()}.json"`);

    return c.json(exportData);
  } catch (error) {
    console.error('Export point rules error:', error);
    return c.json({ error: 'Failed to export point rules' }, 500);
  }
});

// 导入积分规则配置（JSON格式）
pointRoutes.post('/rules/import', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  try {
    const data = await c.req.json();

    // 验证数据格式
    if (!data.rules || !Array.isArray(data.rules)) {
      return c.json({ error: 'Invalid import data format' }, 400);
    }

    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 验证每个规则
    const validRules = [];
    const errors = [];

    for (let i = 0; i < data.rules.length; i++) {
      const rule = data.rules[i];

      // 验证必填字段
      if (!rule.name || typeof rule.name !== 'string') {
        errors.push(`规则 ${i + 1}: 名称不能为空`);
        continue;
      }

      if (!rule.type || !['earn', 'deduct'].includes(rule.type)) {
        errors.push(`规则 ${i + 1}: 类型必须是 earn 或 deduct`);
        continue;
      }

      if (typeof rule.points !== 'number' || rule.points <= 0) {
        errors.push(`规则 ${i + 1}: 积分必须是正数`);
        continue;
      }

      validRules.push({
        familyId: currentUser.familyId,
        name: rule.name,
        description: rule.description || '',
        type: rule.type,
        points: rule.points,
        category: rule.category || 'general',
        isActive: rule.isActive !== false, // 默认为true
      });
    }

    if (validRules.length === 0) {
      return c.json({
        error: '没有有效的规则可以导入',
        errors,
      }, 400);
    }

    // 导入规则
    const importedRules = [];
    for (const rule of validRules) {
      const result = await db.insert(pointRules).values(rule).returning();
      importedRules.push(result[0]);
    }

    // 记录日志
    await logConfigOperation(
      c.env.DB,
      user.userId,
      'config_import',
      '积分规则',
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || '',
      c.req.header('User-Agent') || ''
    );

    return c.json({
      message: 'Point rules imported successfully',
      importedCount: importedRules.length,
      totalCount: data.rules.length,
      errors: errors.length > 0 ? errors : undefined,
      rules: importedRules,
    });
  } catch (error) {
    console.error('Import point rules error:', error);
    return c.json({ error: 'Failed to import point rules' }, 500);
  }
});

export { pointRoutes };
