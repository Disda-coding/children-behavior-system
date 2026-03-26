import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lt } from 'drizzle-orm';
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

/**
 * 执行自动备份任务
 * 每天凌晨执行，为所有家庭创建自动备份
 */
export async function autoBackup(env: { DB: D1Database; PPT_STORAGE: KVNamespace }) {
  console.log('Starting auto backup task...');

  const db = drizzle(env.DB);

  try {
    // 获取所有家庭
    const allFamilies = await db.select().from(families);

    for (const family of allFamilies) {
      try {
        // 检查今天是否已经备份过
        const today = new Date().toISOString().split('T')[0];
        const existingBackup = await db
          .select()
          .from(backups)
          .where(and(
            eq(backups.familyId, family.id),
            eq(backups.type, 'auto')
          ))
          .orderBy(backups.createdAt)
          .limit(1)
          .get();

        if (existingBackup && existingBackup.createdAt?.startsWith(today)) {
          console.log(`Family ${family.id} already has auto backup today, skipping...`);
          continue;
        }

        // 创建自动备份
        await createAutoBackup(db, env.PPT_STORAGE, family.id);
        console.log(`Auto backup created for family ${family.id}`);
      } catch (error) {
        console.error(`Failed to create auto backup for family ${family.id}:`, error);
      }
    }

    // 清理过期备份（保留最近30天的自动备份）
    await cleanupOldAutoBackups(db, env.PPT_STORAGE);

    console.log('Auto backup task completed');
  } catch (error) {
    console.error('Auto backup task failed:', error);
  }
}

/**
 * 为指定家庭创建自动备份
 */
async function createAutoBackup(
  db: any,
  kv: KVNamespace,
  familyId: number
) {
  const backupDate = new Date().toLocaleString('zh-CN');

  // 创建备份记录
  const backupRecord = await db.insert(backups).values({
    familyId,
    name: `自动备份_${backupDate}`,
    description: '系统自动创建的每日备份',
    type: 'auto',
    status: 'pending',
    createdBy: 0, // 系统创建
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
  }).returning();

  const backupId = backupRecord[0].id;

  // 收集备份数据
  const backupData: any = {
    backupInfo: {
      id: backupId,
      name: backupRecord[0].name,
      description: backupRecord[0].description,
      createdAt: backupRecord[0].createdAt,
      familyId,
      createdBy: 0,
      type: 'auto',
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
  const memberIds = familyMembers.map((m: any) => m.id);

  if (memberIds.length > 0) {
    const pointRecordsData = await db
      .select()
      .from(pointRecords)
      .where(sql`${pointRecords.userId} IN (${memberIds.join(',')})`);
    backupData.data.pointRecords = pointRecordsData;
    recordCounts.pointRecords = pointRecordsData.length;

    // 备份用户成就
    const userAchievementsData = await db
      .select()
      .from(userAchievements)
      .where(sql`${userAchievements.userId} IN (${memberIds.join(',')})`);
    backupData.data.userAchievements = userAchievementsData;
    recordCounts.userAchievements = userAchievementsData.length;

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

    // 备份通知
    const notificationsData = await db
      .select()
      .from(notifications)
      .where(sql`${notifications.userId} IN (${memberIds.join(',')})`);
    backupData.data.notifications = notificationsData;
    recordCounts.notifications = notificationsData.length;
  }

  // 备份成就
  const achievementsData = await db
    .select()
    .from(achievements)
    .where(eq(achievements.familyId, familyId));
  backupData.data.achievements = achievementsData;
  recordCounts.achievements = achievementsData.length;

  // 备份奖励
  const rewardsData = await db
    .select()
    .from(rewards)
    .where(eq(rewards.familyId, familyId));
  backupData.data.rewards = rewardsData;
  recordCounts.rewards = rewardsData.length;

  // 备份会议
  const meetingsData = await db
    .select()
    .from(meetings)
    .where(eq(meetings.familyId, familyId));
  backupData.data.meetings = meetingsData;
  recordCounts.meetings = meetingsData.length;

  // 存储到 KV
  const backupKey = `backup:${familyId}:${backupId}`;
  await kv.put(backupKey, JSON.stringify(backupData), {
    metadata: {
      familyId,
      backupId,
      createdAt: new Date().toISOString(),
      type: 'auto',
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

  console.log(`Auto backup ${backupId} created for family ${familyId}`);
}

/**
 * 清理过期的自动备份
 */
async function cleanupOldAutoBackups(db: any, kv: KVNamespace) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 获取过期的自动备份
  const expiredBackups = await db
    .select()
    .from(backups)
    .where(and(
      eq(backups.type, 'auto'),
      lt(backups.createdAt, thirtyDaysAgo.toISOString())
    ));

  for (const backup of expiredBackups) {
    try {
      // 删除 KV 中的数据
      if (backup.storageUrl) {
        await kv.delete(backup.storageUrl);
      }

      // 删除备份记录
      await db.delete(backups).where(eq(backups.id, backup.id));

      console.log(`Deleted expired auto backup ${backup.id}`);
    } catch (error) {
      console.error(`Failed to delete expired backup ${backup.id}:`, error);
    }
  }
}

// 导入 sql
import { sql } from 'drizzle-orm';
