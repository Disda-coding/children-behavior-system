import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  backups,
  users,
  families,
  pointRecords,
  pointRules,
  achievements,
  userAchievements,
  rewards,
  rewardRedemptions,
  appeals,
  meetings,
  notifications,
} from '../db/schema';
import { authMiddleware, parentMiddleware } from '../middleware/auth';
import type { Env } from '../index';

const backupRoutes = new Hono<{ Bindings: Env }>();

// 应用认证中间件
backupRoutes.use('*', authMiddleware);

// 获取备份列表
backupRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('jwtPayload');

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }

    const { type, limit = '10', offset = '0' } = c.req.query();

    let query = db
      .select({
        backup: backups,
        creator: users,
      })
      .from(backups)
      .leftJoin(users, eq(backups.createdBy, users.id))
      .where(eq(backups.familyId, currentUser.familyId));

    if (type) {
      query = query.where(eq(backups.type, type));
    }

    const backupList = await query
      .orderBy(desc(backups.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(backups)
      .where(and(
        eq(backups.familyId, currentUser.familyId),
        type ? eq(backups.type, type) : undefined
      ));

    return c.json({
      success: true,
      data: backupList.map(b => ({
        ...b.backup,
        creator: b.creator,
        tables: b.backup.tables ? JSON.parse(b.backup.tables) : null,
        recordCounts: b.backup.recordCounts ? JSON.parse(b.backup.recordCounts) : null,
      })),
      pagination: {
        total: countResult[0]?.count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Get backups error:', error);
    return c.json({ success: false, message: '获取备份列表失败' }, 500);
  }
});

// 创建备份（手动）
backupRoutes.post('/', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('jwtPayload');

  try {
    const data = await c.req.json();

    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }

    const familyId = currentUser.familyId;

    // 创建备份记录
    const backupRecord = await db.insert(backups).values({
      familyId,
      name: data.name || `备份_${new Date().toLocaleString('zh-CN')}`,
      description: data.description,
      type: 'manual',
      status: 'pending',
      createdBy: user.userId,
    }).returning();

    // 异步执行备份
    const backupId = backupRecord[0].id;

    // 收集所有需要备份的数据
    const backupData: any = {
      backupInfo: {
        id: backupId,
        name: backupRecord[0].name,
        description: backupRecord[0].description,
        createdAt: backupRecord[0].createdAt,
        familyId,
        createdBy: user.userId,
      },
      data: {},
    };

    const recordCounts: Record<string, number> = {};

    // 备份积分规则
    const pointRulesData = await db
      .select()
      .from(pointRules)
      .where(eq(pointRules.familyId, familyId));
    backupData.data.pointRules = pointRulesData;
    recordCounts.pointRules = pointRulesData.length;

    // 备份积分记录
    const familyMembers = await db
      .select()
      .from(users)
      .where(eq(users.familyId, familyId));
    const memberIds = familyMembers.map(m => m.id);

    const pointRecordsData = await db
      .select()
      .from(pointRecords)
      .where(sql`${pointRecords.userId} IN (${memberIds.join(',')})`);
    backupData.data.pointRecords = pointRecordsData;
    recordCounts.pointRecords = pointRecordsData.length;

    // 备份成就
    const achievementsData = await db
      .select()
      .from(achievements)
      .where(eq(achievements.familyId, familyId));
    backupData.data.achievements = achievementsData;
    recordCounts.achievements = achievementsData.length;

    // 备份用户成就
    const userAchievementsData = await db
      .select()
      .from(userAchievements)
      .where(sql`${userAchievements.userId} IN (${memberIds.join(',')})`);
    backupData.data.userAchievements = userAchievementsData;
    recordCounts.userAchievements = userAchievementsData.length;

    // 备份奖励
    const rewardsData = await db
      .select()
      .from(rewards)
      .where(eq(rewards.familyId, familyId));
    backupData.data.rewards = rewardsData;
    recordCounts.rewards = rewardsData.length;

    // 备份兑换记录
    const redemptionsData = await db
      .select()
      .from(rewardRedemptions)
      .where(sql`${rewardRedemptions.userId} IN (${memberIds.join(',')})`);
    backupData.data.rewardRedemptions = redemptionsData;
    recordCounts.rewardRedemptions = redemptionsData.length;

    // 备份申诉
    const appealsData = await db
      .select()
      .from(appeals)
      .where(sql`${appeals.userId} IN (${memberIds.join(',')})`);
    backupData.data.appeals = appealsData;
    recordCounts.appeals = appealsData.length;

    // 备份会议
    const meetingsData = await db
      .select()
      .from(meetings)
      .where(eq(meetings.familyId, familyId));
    backupData.data.meetings = meetingsData;
    recordCounts.meetings = meetingsData.length;

    // 备份通知
    const notificationsData = await db
      .select()
      .from(notifications)
      .where(sql`${notifications.userId} IN (${memberIds.join(',')})`);
    backupData.data.notifications = notificationsData;
    recordCounts.notifications = notificationsData.length;

    // 将备份数据存储到 KV
    const backupKey = `backup:${familyId}:${backupId}`;
    await c.env.PPT_STORAGE.put(backupKey, JSON.stringify(backupData), {
      metadata: {
        familyId,
        backupId,
        createdAt: new Date().toISOString(),
      },
    });

    // 更新备份记录
    const dataSize = JSON.stringify(backupData).length;
    await db
      .update(backups)
      .set({
        status: 'completed',
        dataSize,
        tables: JSON.stringify(Object.keys(backupData.data)),
        recordCounts: JSON.stringify(recordCounts),
        storageUrl: backupKey,
        storageType: 'kv',
      })
      .where(eq(backups.id, backupId));

    return c.json({
      success: true,
      message: '备份创建成功',
      backup: {
        ...backupRecord[0],
        status: 'completed',
        dataSize,
        recordCounts,
      },
    });
  } catch (error) {
    console.error('Create backup error:', error);
    return c.json({ success: false, message: '创建备份失败' }, 500);
  }
});

// 获取备份详情
backupRoutes.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('jwtPayload');
  const backupId = parseInt(c.req.param('id'));

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }

    const backup = await db
      .select({
        backup: backups,
        creator: users,
      })
      .from(backups)
      .leftJoin(users, eq(backups.createdBy, users.id))
      .where(and(
        eq(backups.id, backupId),
        eq(backups.familyId, currentUser.familyId)
      ))
      .get();

    if (!backup) {
      return c.json({ success: false, message: '备份不存在' }, 404);
    }

    return c.json({
      success: true,
      data: {
        ...backup.backup,
        creator: backup.creator,
        tables: backup.backup.tables ? JSON.parse(backup.backup.tables) : null,
        recordCounts: backup.backup.recordCounts ? JSON.parse(backup.backup.recordCounts) : null,
      },
    });
  } catch (error) {
    console.error('Get backup detail error:', error);
    return c.json({ success: false, message: '获取备份详情失败' }, 500);
  }
});

// 下载备份数据
backupRoutes.get('/:id/download', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('jwtPayload');
  const backupId = parseInt(c.req.param('id'));

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }

    const backup = await db
      .select()
      .from(backups)
      .where(and(
        eq(backups.id, backupId),
        eq(backups.familyId, currentUser.familyId)
      ))
      .get();

    if (!backup) {
      return c.json({ success: false, message: '备份不存在' }, 404);
    }

    if (backup.storageType === 'kv' && backup.storageUrl) {
      const backupData = await c.env.PPT_STORAGE.get(backup.storageUrl);
      if (!backupData) {
        return c.json({ success: false, message: '备份数据不存在' }, 404);
      }

      const data = await backupData.text();

      // 设置下载响应头
      c.header('Content-Type', 'application/json');
      c.header('Content-Disposition', `attachment; filename="backup-${backupId}-${Date.now()}.json"`);

      return c.body(data);
    }

    return c.json({ success: false, message: '备份数据不可用' }, 400);
  } catch (error) {
    console.error('Download backup error:', error);
    return c.json({ success: false, message: '下载备份失败' }, 500);
  }
});

// 恢复备份
backupRoutes.post('/:id/restore', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('jwtPayload');
  const backupId = parseInt(c.req.param('id'));

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }

    const backup = await db
      .select()
      .from(backups)
      .where(and(
        eq(backups.id, backupId),
        eq(backups.familyId, currentUser.familyId)
      ))
      .get();

    if (!backup) {
      return c.json({ success: false, message: '备份不存在' }, 404);
    }

    if (backup.status !== 'completed') {
      return c.json({ success: false, message: '备份未完成，无法恢复' }, 400);
    }

    // 更新备份状态为恢复中
    await db
      .update(backups)
      .set({ status: 'restoring' })
      .where(eq(backups.id, backupId));

    // 从 KV 获取备份数据
    if (backup.storageType === 'kv' && backup.storageUrl) {
      const backupDataObj = await c.env.PPT_STORAGE.get(backup.storageUrl);
      if (!backupDataObj) {
        await db
          .update(backups)
          .set({ status: 'failed' })
          .where(eq(backups.id, backupId));
        return c.json({ success: false, message: '备份数据不存在' }, 404);
      }

      const backupData = JSON.parse(await backupDataObj.text());
      const familyId = currentUser.familyId;

      // 恢复积分规则
      if (backupData.data.pointRules) {
        for (const rule of backupData.data.pointRules) {
          await db.insert(pointRules).values({
            ...rule,
            familyId,
            id: undefined, // 让数据库自动生成新ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 恢复成就
      if (backupData.data.achievements) {
        for (const achievement of backupData.data.achievements) {
          await db.insert(achievements).values({
            ...achievement,
            familyId,
            id: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 恢复奖励
      if (backupData.data.rewards) {
        for (const reward of backupData.data.rewards) {
          await db.insert(rewards).values({
            ...reward,
            familyId,
            id: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 注意：积分记录、用户成就、兑换记录、申诉、会议、通知等涉及用户ID的数据
      // 恢复时需要谨慎处理，因为用户ID可能已经改变
      // 这里简化处理，只恢复不依赖特定用户ID的数据

      // 更新备份状态
      await db
        .update(backups)
        .set({
          status: 'completed',
          restoredAt: new Date().toISOString(),
          restoredBy: user.userId,
        })
        .where(eq(backups.id, backupId));

      return c.json({
        success: true,
        message: '备份恢复成功',
      });
    }

    return c.json({ success: false, message: '备份数据不可用' }, 400);
  } catch (error) {
    console.error('Restore backup error:', error);

    // 更新备份状态为失败
    await db
      .update(backups)
      .set({ status: 'failed' })
      .where(eq(backups.id, backupId));

    return c.json({ success: false, message: '恢复备份失败' }, 500);
  }
});

// 删除备份
backupRoutes.delete('/:id', parentMiddleware, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('jwtPayload');
  const backupId = parseInt(c.req.param('id'));

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }

    const backup = await db
      .select()
      .from(backups)
      .where(and(
        eq(backups.id, backupId),
        eq(backups.familyId, currentUser.familyId)
      ))
      .get();

    if (!backup) {
      return c.json({ success: false, message: '备份不存在' }, 404);
    }

    // 删除 KV 中的备份数据
    if (backup.storageType === 'kv' && backup.storageUrl) {
      await c.env.PPT_STORAGE.delete(backup.storageUrl);
    }

    // 删除备份记录
    await db.delete(backups).where(eq(backups.id, backupId));

    return c.json({
      success: true,
      message: '备份删除成功',
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    return c.json({ success: false, message: '删除备份失败' }, 500);
  }
});

// 获取备份统计
backupRoutes.get('/stats/overview', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('jwtPayload');

  try {
    // 获取当前用户家庭ID
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .get();

    if (!currentUser) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }

    const familyId = currentUser.familyId;

    // 获取备份统计
    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(backups)
      .where(eq(backups.familyId, familyId));

    const manualCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(backups)
      .where(and(
        eq(backups.familyId, familyId),
        eq(backups.type, 'manual')
      ));

    const autoCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(backups)
      .where(and(
        eq(backups.familyId, familyId),
        eq(backups.type, 'auto')
      ));

    const totalSize = await db
      .select({ size: sql<number>`SUM(data_size)` })
      .from(backups)
      .where(eq(backups.familyId, familyId));

    // 获取最近备份
    const latestBackup = await db
      .select()
      .from(backups)
      .where(eq(backups.familyId, familyId))
      .orderBy(desc(backups.createdAt))
      .limit(1)
      .get();

    return c.json({
      success: true,
      data: {
        totalCount: totalCount[0]?.count || 0,
        manualCount: manualCount[0]?.count || 0,
        autoCount: autoCount[0]?.count || 0,
        totalSize: totalSize[0]?.size || 0,
        latestBackup: latestBackup || null,
      },
    });
  } catch (error) {
    console.error('Get backup stats error:', error);
    return c.json({ success: false, message: '获取备份统计失败' }, 500);
  }
});

export { backupRoutes };
