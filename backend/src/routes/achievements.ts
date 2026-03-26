import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { achievements, userAchievements, users, pointRecords } from '../db/schema';
import type { Env } from '../index';
import { notifyAchievementUnlocked, notifyPointsEarned } from '../utils/notification';

const achievementRoutes = new Hono<{ Bindings: Env }>();

// 获取成就列表
achievementRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const familyId = c.req.query('familyId');

    let list;

    if (familyId) {
      list = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.isActive, true),
          eq(achievements.familyId, parseInt(familyId))
        ));
    } else {
      list = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true));
    }

    return c.json({ achievements: list });
  } catch (error) {
    console.error('Get achievements error:', error);
    return c.json({ error: 'Failed to get achievements' }, 500);
  }
});

// 获取成就模板
achievementRoutes.get('/templates', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const templates = await db
      .select()
      .from(achievements)
      .where(eq(achievements.isTemplate, true));
    
    return c.json({ templates });
  } catch (error) {
    console.error('Get achievement templates error:', error);
    return c.json({ error: 'Failed to get achievement templates' }, 500);
  }
});

// 创建成就
achievementRoutes.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    const result = await db.insert(achievements).values({
      familyId: data.familyId,
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      iconUrl: data.iconUrl,
      conditionType: data.conditionType,
      conditionValue: data.conditionValue,
      conditionUnit: data.conditionUnit,
      rewardPoints: data.rewardPoints,
      isTemplate: data.isTemplate || false,
    }).returning();
    
    return c.json({
      message: 'Achievement created successfully',
      achievement: result[0],
    }, 201);
  } catch (error) {
    console.error('Create achievement error:', error);
    return c.json({ error: 'Failed to create achievement' }, 500);
  }
});

// 赋予用户成就
achievementRoutes.post('/:id/assign', async (c) => {
  const db = drizzle(c.env.DB);
  const achievementId = parseInt(c.req.param('id'));
  
  try {
    const { userId, note } = await c.req.json();
    
    // 检查成就是否存在
    const achievement = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .get();
    
    if (!achievement) {
      return c.json({ error: 'Achievement not found' }, 404);
    }
    
    // 检查用户是否存在
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 检查是否已赋予（包括已撤销的）
    const existing = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId),
        eq(userAchievements.isRevoked, false)
      ))
      .get();
    
    if (existing) {
      return c.json({ error: 'Achievement already assigned to this user' }, 400);
    }
    
    // 创建用户成就记录
    const result = await db.insert(userAchievements).values({
      userId,
      achievementId,
      progress: achievement.conditionValue,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      isRevoked: false,
    }).returning();

    // 发送成就解锁通知
    await notifyAchievementUnlocked(c.env.DB, userId, achievement.name, result[0].id, achievement.rewardPoints || 0);

    // 如果有积分奖励，创建积分记录
    if (achievement.rewardPoints && achievement.rewardPoints > 0) {
      // 获取用户当前积分余额
      const latestRecord = await db
        .select()
        .from(pointRecords)
        .where(eq(pointRecords.userId, userId))
        .orderBy(desc(pointRecords.createdAt))
        .limit(1)
        .get();

      const currentBalance = latestRecord?.balanceAfter || 0;
      const newBalance = currentBalance + achievement.rewardPoints;

      const pointRecord = await db.insert(pointRecords).values({
        userId,
        type: 'earn',
        amount: achievement.rewardPoints,
        balanceAfter: newBalance,
        reason: `获得成就奖励: ${achievement.name}`,
        createdBy: userId,
      }).returning();

      // 发送积分获得通知
      await notifyPointsEarned(c.env.DB, userId, achievement.rewardPoints, `获得成就奖励: ${achievement.name}`, pointRecord[0].id);
    }

    return c.json({
      message: 'Achievement assigned successfully',
      userAchievement: result[0],
    }, 201);
  } catch (error) {
    console.error('Assign achievement error:', error);
    return c.json({ error: 'Failed to assign achievement' }, 500);
  }
});

// 撤销用户成就
achievementRoutes.post('/user-achievements/:id/revoke', async (c) => {
  const db = drizzle(c.env.DB);
  const userAchievementId = parseInt(c.req.param('id'));
  
  try {
    const { revokedBy, reason } = await c.req.json();
    
    // 检查用户成就记录是否存在
    const userAchievement = await db
      .select({
        userAchievement: userAchievements,
        achievement: achievements,
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.id, userAchievementId))
      .get();
    
    if (!userAchievement) {
      return c.json({ error: 'User achievement not found' }, 404);
    }
    
    if (userAchievement.userAchievement.isRevoked) {
      return c.json({ error: 'Achievement already revoked' }, 400);
    }
    
    // 更新用户成就记录为已撤销
    await db
      .update(userAchievements)
      .set({
        isRevoked: true,
        revokedAt: new Date().toISOString(),
        revokedBy: revokedBy,
        revokeReason: reason || null,
      })
      .where(eq(userAchievements.id, userAchievementId));
    
    // 如果成就有积分奖励，扣除相应积分
    if (userAchievement.achievement?.rewardPoints && userAchievement.achievement.rewardPoints > 0) {
      // 获取用户当前积分余额
      const latestRecord = await db
        .select()
        .from(pointRecords)
        .where(eq(pointRecords.userId, userAchievement.userAchievement.userId))
        .orderBy(desc(pointRecords.createdAt))
        .limit(1)
        .get();
      
      const currentBalance = latestRecord?.balanceAfter || 0;
      const deductPoints = userAchievement.achievement.rewardPoints;
      const newBalance = Math.max(0, currentBalance - deductPoints);
      
      await db.insert(pointRecords).values({
        userId: userAchievement.userAchievement.userId,
        type: 'deduct',
        amount: -deductPoints,
        balanceAfter: newBalance,
        reason: `成就被撤销: ${userAchievement.achievement.name}${reason ? ` - ${reason}` : ''}`,
        createdBy: revokedBy,
      });
    }
    
    return c.json({
      message: 'Achievement revoked successfully',
    });
  } catch (error) {
    console.error('Revoke achievement error:', error);
    return c.json({ error: 'Failed to revoke achievement' }, 500);
  }
});

// 恢复已撤销的成就
achievementRoutes.post('/user-achievements/:id/restore', async (c) => {
  const db = drizzle(c.env.DB);
  const userAchievementId = parseInt(c.req.param('id'));
  
  try {
    const { restoredBy } = await c.req.json();
    
    // 检查用户成就记录是否存在
    const userAchievement = await db
      .select({
        userAchievement: userAchievements,
        achievement: achievements,
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.id, userAchievementId))
      .get();
    
    if (!userAchievement) {
      return c.json({ error: 'User achievement not found' }, 404);
    }
    
    if (!userAchievement.userAchievement.isRevoked) {
      return c.json({ error: 'Achievement is not revoked' }, 400);
    }
    
    // 恢复用户成就记录
    await db
      .update(userAchievements)
      .set({
        isRevoked: false,
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
      })
      .where(eq(userAchievements.id, userAchievementId));
    
    // 如果成就有积分奖励，重新发放积分
    if (userAchievement.achievement?.rewardPoints && userAchievement.achievement.rewardPoints > 0) {
      // 获取用户当前积分余额
      const latestRecord = await db
        .select()
        .from(pointRecords)
        .where(eq(pointRecords.userId, userAchievement.userAchievement.userId))
        .orderBy(desc(pointRecords.createdAt))
        .limit(1)
        .get();
      
      const currentBalance = latestRecord?.balanceAfter || 0;
      const rewardPoints = userAchievement.achievement.rewardPoints;
      const newBalance = currentBalance + rewardPoints;
      
      await db.insert(pointRecords).values({
        userId: userAchievement.userAchievement.userId,
        type: 'earn',
        amount: rewardPoints,
        balanceAfter: newBalance,
        reason: `成就恢复: ${userAchievement.achievement.name}`,
        createdBy: restoredBy,
      });
    }
    
    return c.json({
      message: 'Achievement restored successfully',
    });
  } catch (error) {
    console.error('Restore achievement error:', error);
    return c.json({ error: 'Failed to restore achievement' }, 500);
  }
});

// 获取用户成就
achievementRoutes.get('/user/:userId', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = parseInt(c.req.param('userId'));
  const includeRevoked = c.req.query('includeRevoked') === 'true';

  try {
    let userAchievementsList;

    if (!includeRevoked) {
      userAchievementsList = await db
        .select({
          userAchievement: userAchievements,
          achievement: achievements,
        })
        .from(userAchievements)
        .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.isRevoked, false)
        ))
        .orderBy(desc(userAchievements.createdAt));
    } else {
      userAchievementsList = await db
        .select({
          userAchievement: userAchievements,
          achievement: achievements,
        })
        .from(userAchievements)
        .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.createdAt));
    }
    
    return c.json({
      userAchievements: userAchievementsList.map(ua => ({
        ...ua.userAchievement,
        achievement: ua.achievement,
      })),
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    return c.json({ error: 'Failed to get user achievements' }, 500);
  }
});

// 获取家庭所有孩子的成就（包含撤销记录，用于家长查看）
achievementRoutes.get('/family/:familyId/children-achievements', async (c) => {
  const db = drizzle(c.env.DB);
  const familyId = parseInt(c.req.param('familyId'));
  
  try {
    // 获取家庭所有孩子
    const childrenList = await db
      .select()
      .from(users)
      .where(and(
        eq(users.familyId, familyId),
        eq(users.role, 'child')
      ));
    
    const result = [];
    
    for (const child of childrenList) {
      // 获取每个孩子的所有成就（包括已撤销的）
      const childAchievements = await db
        .select({
          userAchievement: userAchievements,
          achievement: achievements,
        })
        .from(userAchievements)
        .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, child.id))
        .orderBy(desc(userAchievements.createdAt));
      
      result.push({
        childId: child.id,
        childName: child.displayName,
        achievements: childAchievements.map(ca => ({
          ...ca.userAchievement,
          achievement: ca.achievement,
        })),
      });
    }
    
    return c.json({
      childrenAchievements: result,
    });
  } catch (error) {
    console.error('Get family children achievements error:', error);
    return c.json({ error: 'Failed to get family children achievements' }, 500);
  }
});

// 导出成就配置
achievementRoutes.get('/export', async (c) => {
  const db = drizzle(c.env.DB);
  const familyId = c.req.query('familyId');
  
  try {
    let list;
    
    if (familyId) {
      list = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.isActive, true),
          eq(achievements.familyId, parseInt(familyId))
        ));
    } else {
      list = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true));
    }
    
    // 只导出必要的字段，不包含 id 和 familyId
    const exportData = list.map(item => ({
      name: item.name,
      description: item.description,
      iconUrl: item.iconUrl,
      conditionType: item.conditionType,
      conditionValue: item.conditionValue,
      conditionUnit: item.conditionUnit,
      rewardPoints: item.rewardPoints,
    }));
    
    return c.json({
      version: '1.0',
      exportDate: new Date().toISOString(),
      achievements: exportData,
    });
  } catch (error) {
    console.error('Export achievements error:', error);
    return c.json({ error: 'Failed to export achievements' }, 500);
  }
});

// 导入成就配置
achievementRoutes.post('/import', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const { achievements: importAchievements, familyId } = await c.req.json();
    
    if (!Array.isArray(importAchievements) || importAchievements.length === 0) {
      return c.json({ error: 'Invalid import data' }, 400);
    }
    
    let importedCount = 0;
    const errors: string[] = [];
    
    for (const item of importAchievements) {
      try {
        // 验证必填字段
        if (!item.name || !item.conditionType || !item.conditionValue) {
          errors.push(`成就 "${item.name || '未命名'}" 缺少必填字段`);
          continue;
        }
        
        // 检查是否已存在同名成就
        const existing = await db
          .select()
          .from(achievements)
          .where(and(
            eq(achievements.name, item.name),
            eq(achievements.familyId, familyId),
            eq(achievements.isActive, true)
          ))
          .get();
        
        if (existing) {
          errors.push(`成就 "${item.name}" 已存在，跳过`);
          continue;
        }
        
        await db.insert(achievements).values({
          familyId: familyId,
          name: item.name,
          description: item.description || null,
          iconUrl: item.iconUrl || '🏆',
          conditionType: item.conditionType,
          conditionValue: item.conditionValue,
          conditionUnit: item.conditionUnit || null,
          rewardPoints: item.rewardPoints || 0,
          isTemplate: false,
          isActive: true,
        });
        
        importedCount++;
      } catch (itemError) {
        errors.push(`导入 "${item.name || '未命名'}" 失败: ${itemError}`);
      }
    }
    
    return c.json({
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import achievements error:', error);
    return c.json({ error: 'Failed to import achievements' }, 500);
  }
});

export { achievementRoutes };
