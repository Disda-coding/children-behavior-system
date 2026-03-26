import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { rewards, rewardRedemptions, users, pointRecords } from '../db/schema';
import type { Env } from '../index';
import { notifyRewardApproved, notifyRewardRejected } from '../utils/notification';

const rewardRoutes = new Hono<{ Bindings: Env }>();

// 获取奖励列表
rewardRoutes.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const familyId = c.req.query('familyId');
    
    let query = db
      .select()
      .from(rewards)
      .where(eq(rewards.isActive, true));
    
    if (familyId) {
      query = query.where(eq(rewards.familyId, parseInt(familyId)));
    }
    
    const list = await query;
    
    return c.json({ rewards: list });
  } catch (error) {
    console.error('Get rewards error:', error);
    return c.json({ error: 'Failed to get rewards' }, 500);
  }
});

// 创建奖励
rewardRoutes.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    const result = await db.insert(rewards).values({
      familyId: data.familyId,
      name: data.name,
      description: data.description,
      type: data.type,
      pointsCost: data.pointsCost,
      iconUrl: data.iconUrl,
      stock: data.stock,
      config: data.config ? JSON.stringify(data.config) : null,
    }).returning();
    
    return c.json({
      message: 'Reward created successfully',
      reward: result[0],
    }, 201);
  } catch (error) {
    console.error('Create reward error:', error);
    return c.json({ error: 'Failed to create reward' }, 500);
  }
});

// 更新奖励
rewardRoutes.put('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const rewardId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    const result = await db
      .update(rewards)
      .set({
        name: data.name,
        description: data.description,
        type: data.type,
        pointsCost: data.pointsCost,
        iconUrl: data.iconUrl,
        stock: data.stock,
        config: data.config ? JSON.stringify(data.config) : null,
        isActive: data.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(rewards.id, rewardId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Reward not found' }, 404);
    }
    
    return c.json({
      message: 'Reward updated successfully',
      reward: result[0],
    });
  } catch (error) {
    console.error('Update reward error:', error);
    return c.json({ error: 'Failed to update reward' }, 500);
  }
});

// 删除奖励（软删除）
rewardRoutes.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const rewardId = parseInt(c.req.param('id'));
  
  try {
    const result = await db
      .update(rewards)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(rewards.id, rewardId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Reward not found' }, 404);
    }
    
    return c.json({
      message: 'Reward deleted successfully',
    });
  } catch (error) {
    console.error('Delete reward error:', error);
    return c.json({ error: 'Failed to delete reward' }, 500);
  }
});

// 兑换奖励
rewardRoutes.post('/:id/redeem', async (c) => {
  const db = drizzle(c.env.DB);
  const rewardId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    const { userId, hours, note } = data;
    
    // 获取奖励信息
    const reward = await db
      .select()
      .from(rewards)
      .where(eq(rewards.id, rewardId))
      .get();
    
    if (!reward) {
      return c.json({ error: 'Reward not found' }, 404);
    }
    
    if (!reward.isActive) {
      return c.json({ error: 'Reward is not available' }, 400);
    }
    
    // 检查库存
    if (reward.stock !== null && reward.stock !== undefined && reward.stock <= 0) {
      return c.json({ error: 'Reward out of stock' }, 400);
    }
    
    // 计算实际消耗积分（支持阶梯价格）
    let pointsCost = reward.pointsCost;
    let config = null;
    
    if (reward.config) {
      try {
        config = typeof reward.config === 'string' ? JSON.parse(reward.config) : reward.config;
      } catch (e) {
        console.error('Failed to parse reward config:', e);
      }
    }
    
    if (config && config.tieredPricing && hours) {
      pointsCost = calculateTieredPrice(parseFloat(hours), config.tieredPricing);
    }
    
    // 检查用户积分是否足够
    const latestRecord = await db
      .select()
      .from(pointRecords)
      .where(eq(pointRecords.userId, userId))
      .orderBy(desc(pointRecords.createdAt))
      .limit(1)
      .get();
    
    const currentBalance = latestRecord?.balanceAfter || 0;
    
    if (currentBalance < pointsCost) {
      return c.json({ error: 'Insufficient points', currentBalance, required: pointsCost }, 400);
    }
    
    // 扣除积分
    const newBalance = currentBalance - pointsCost;
    await db.insert(pointRecords).values({
      userId,
      type: 'redeem',
      amount: -pointsCost,
      balanceAfter: newBalance,
      reason: `兑换奖励: ${reward.name}`,
      createdBy: userId,
    });
    
    // 创建兑换记录
    const redemptionResult = await db.insert(rewardRedemptions).values({
      userId,
      rewardId,
      pointsSpent: pointsCost,
      note: note || null,
      status: 'pending',
    }).returning();
    
    // 减少库存
    if (reward.stock !== null && reward.stock !== undefined) {
      await db
        .update(rewards)
        .set({ stock: reward.stock - 1 })
        .where(eq(rewards.id, rewardId));
    }
    
    return c.json({
      message: 'Reward redemption request created',
      redemption: redemptionResult[0],
      remainingPoints: newBalance,
    }, 201);
  } catch (error) {
    console.error('Redeem reward error:', error);
    return c.json({ error: 'Failed to redeem reward' }, 500);
  }
});

// 获取兑换记录
rewardRoutes.get('/redemptions', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    const familyId = c.req.query('familyId');
    const status = c.req.query('status');
    
    let query = db
      .select({
        redemption: rewardRedemptions,
        reward: rewards,
        user: users,
      })
      .from(rewardRedemptions)
      .leftJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
      .leftJoin(users, eq(rewardRedemptions.userId, users.id));
    
    if (userId) {
      query = query.where(eq(rewardRedemptions.userId, parseInt(userId)));
    }
    
    if (status) {
      query = query.where(eq(rewardRedemptions.status, status));
    }
    
    if (familyId) {
      query = query.where(eq(rewards.familyId, parseInt(familyId)));
    }
    
    const list = await query.orderBy(desc(rewardRedemptions.createdAt));
    
    return c.json({
      redemptions: list.map(r => ({
        ...r.redemption,
        reward: r.reward,
        user: r.user,
      })),
    });
  } catch (error) {
    console.error('Get redemptions error:', error);
    return c.json({ error: 'Failed to get redemptions' }, 500);
  }
});

// 审核兑换请求
rewardRoutes.put('/redemptions/:id/approve', async (c) => {
  const db = drizzle(c.env.DB);
  const redemptionId = parseInt(c.req.param('id'));

  try {
    const data = await c.req.json();
    const { approvedBy, note } = data;

    // 获取兑换记录和奖励信息
    const redemption = await db
      .select({
        redemption: rewardRedemptions,
        reward: rewards,
      })
      .from(rewardRedemptions)
      .leftJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
      .where(eq(rewardRedemptions.id, redemptionId))
      .get();

    if (!redemption) {
      return c.json({ error: 'Redemption not found' }, 404);
    }

    const result = await db
      .update(rewardRedemptions)
      .set({
        status: 'approved',
        approvedBy,
        approvedAt: new Date().toISOString(),
        note: note || null,
      })
      .where(eq(rewardRedemptions.id, redemptionId))
      .returning();

    // 发送兑换通过通知
    await notifyRewardApproved(c.env.DB, redemption.redemption.userId, redemption.reward?.name || '奖励', redemptionId);

    return c.json({
      message: 'Redemption approved successfully',
      redemption: result[0],
    });
  } catch (error) {
    console.error('Approve redemption error:', error);
    return c.json({ error: 'Failed to approve redemption' }, 500);
  }
});

// 拒绝兑换请求
rewardRoutes.put('/redemptions/:id/reject', async (c) => {
  const db = drizzle(c.env.DB);
  const redemptionId = parseInt(c.req.param('id'));

  try {
    const data = await c.req.json();
    const { approvedBy, note } = data;

    // 获取兑换记录和奖励信息
    const redemptionInfo = await db
      .select({
        redemption: rewardRedemptions,
        reward: rewards,
      })
      .from(rewardRedemptions)
      .leftJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
      .where(eq(rewardRedemptions.id, redemptionId))
      .get();

    if (!redemptionInfo) {
      return c.json({ error: 'Redemption not found' }, 404);
    }

    const { redemption, reward } = redemptionInfo;

    // 返还积分
    const latestRecord = await db
      .select()
      .from(pointRecords)
      .where(eq(pointRecords.userId, redemption.userId))
      .orderBy(desc(pointRecords.createdAt))
      .limit(1)
      .get();

    const currentBalance = latestRecord?.balanceAfter || 0;
    const newBalance = currentBalance + redemption.pointsSpent;

    await db.insert(pointRecords).values({
      userId: redemption.userId,
      type: 'earn',
      amount: redemption.pointsSpent,
      balanceAfter: newBalance,
      reason: `兑换被拒绝返还: ${note || '无原因'}`,
      createdBy: approvedBy,
    });

    // 更新兑换记录
    const result = await db
      .update(rewardRedemptions)
      .set({
        status: 'rejected',
        approvedBy,
        approvedAt: new Date().toISOString(),
        note: note || null,
      })
      .where(eq(rewardRedemptions.id, redemptionId))
      .returning();

    // 返还库存
    if (reward && reward.stock !== null && reward.stock !== undefined) {
      await db
        .update(rewards)
        .set({ stock: reward.stock + 1 })
        .where(eq(rewards.id, redemption.rewardId));
    }

    // 发送兑换驳回通知
    await notifyRewardRejected(c.env.DB, redemption.userId, reward?.name || '奖励', note || '无原因', redemptionId);

    return c.json({
      message: 'Redemption rejected and points refunded',
      redemption: result[0],
    });
  } catch (error) {
    console.error('Reject redemption error:', error);
    return c.json({ error: 'Failed to reject redemption' }, 500);
  }
});

// 完成兑换（发放奖励）
rewardRoutes.put('/redemptions/:id/complete', async (c) => {
  const db = drizzle(c.env.DB);
  const redemptionId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    const { approvedBy, note } = data;
    
    const result = await db
      .update(rewardRedemptions)
      .set({
        status: 'completed',
        approvedBy,
        approvedAt: new Date().toISOString(),
        note: note || null,
      })
      .where(eq(rewardRedemptions.id, redemptionId))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Redemption not found' }, 404);
    }
    
    return c.json({
      message: 'Redemption completed successfully',
      redemption: result[0],
    });
  } catch (error) {
    console.error('Complete redemption error:', error);
    return c.json({ error: 'Failed to complete redemption' }, 500);
  }
});

// 计算阶梯价格
function calculateTieredPrice(hours: number, pricing: Record<string, number>): number {
  const sortedTiers = Object.entries(pricing)
    .map(([h, cost]) => ({ hours: parseFloat(h), cost }))
    .sort((a, b) => a.hours - b.hours);
  
  for (const tier of sortedTiers) {
    if (hours <= tier.hours) {
      return tier.cost;
    }
  }
  
  return sortedTiers[sortedTiers.length - 1]?.cost || 0;
}

// 获取游戏时间兑换历史（用于计算阶梯价格）
rewardRoutes.get('/game-time-history', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const userId = c.req.query('userId');
    const rewardId = c.req.query('rewardId');
    
    if (!userId || !rewardId) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }
    
    // 获取今天已兑换的游戏时间
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const redemptions = await db
      .select()
      .from(rewardRedemptions)
      .where(and(
        eq(rewardRedemptions.userId, parseInt(userId)),
        eq(rewardRedemptions.rewardId, parseInt(rewardId)),
        eq(rewardRedemptions.status, 'completed')
      ))
      .orderBy(desc(rewardRedemptions.createdAt));
    
    // 计算今天已兑换的总时长
    let todayHours = 0;
    const todayRedemptions = redemptions.filter(r => {
      const redemptionDate = new Date(r.createdAt);
      return redemptionDate >= today;
    });
    
    // 从备注中提取时长
    todayRedemptions.forEach(r => {
      if (r.note) {
        const match = r.note.match(/(\d+\.?\d*)小时/);
        if (match) {
          todayHours += parseFloat(match[1]);
        }
      }
    });
    
    return c.json({
      todayHours,
      totalRedemptions: redemptions.length,
      todayRedemptions: todayRedemptions.length,
    });
  } catch (error) {
    console.error('Get game time history error:', error);
    return c.json({ error: 'Failed to get game time history' }, 500);
  }
});

export { rewardRoutes };
