import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { rewards, rewardRedemptions } from '../db/schema';
import type { Env } from '../index';

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
      config: data.config,
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

// 兑换奖励
rewardRoutes.post('/:id/redeem', async (c) => {
  const db = drizzle(c.env.DB);
  const rewardId = parseInt(c.req.param('id'));
  
  try {
    const data = await c.req.json();
    
    // 获取奖励信息
    const reward = await db
      .select()
      .from(rewards)
      .where(eq(rewards.id, rewardId))
      .get();
    
    if (!reward) {
      return c.json({ error: 'Reward not found' }, 404);
    }
    
    // 计算实际消耗积分（支持阶梯价格）
    let pointsCost = reward.pointsCost;
    if (reward.config && reward.config.tieredPricing) {
      const hours = data.hours || 1;
      pointsCost = calculateTieredPrice(hours, reward.config.tieredPricing);
    }
    
    // 创建兑换记录
    const result = await db.insert(rewardRedemptions).values({
      userId: data.userId,
      rewardId,
      pointsSpent: pointsCost,
      note: data.note,
    }).returning();
    
    return c.json({
      message: 'Reward redemption request created',
      redemption: result[0],
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
    
    let query = db
      .select({
        redemption: rewardRedemptions,
        reward: rewards,
      })
      .from(rewardRedemptions)
      .leftJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id));
    
    if (userId) {
      query = query.where(eq(rewardRedemptions.userId, parseInt(userId)));
    }
    
    const list = await query;
    
    return c.json({
      redemptions: list.map(r => ({
        ...r.redemption,
        reward: r.reward,
      })),
    });
  } catch (error) {
    console.error('Get redemptions error:', error);
    return c.json({ error: 'Failed to get redemptions' }, 500);
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

export { rewardRoutes };
