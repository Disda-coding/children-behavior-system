import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { notifications, NewNotification } from '../db/schema';

// 通知类型
export type NotificationType =
  | 'achievement_unlocked'
  | 'points_earned'
  | 'points_deducted'
  | 'appeal_approved'
  | 'appeal_rejected'
  | 'reward_approved'
  | 'reward_rejected'
  | 'meeting_scheduled'
  | 'meeting_cancelled'
  | 'meeting_scored'
  | 'system';

// 通知图标映射
export const notificationIcons: Record<NotificationType, string> = {
  achievement_unlocked: '🏆',
  points_earned: '💰',
  points_deducted: '💸',
  appeal_approved: '✅',
  appeal_rejected: '❌',
  reward_approved: '🎁',
  reward_rejected: '🚫',
  meeting_scheduled: '📅',
  meeting_cancelled: '🚫',
  meeting_scored: '⭐',
  system: '📢',
};

// 创建通知
export async function createNotification(
  db: D1Database,
  data: {
    userId: number;
    type: NotificationType;
    title: string;
    content: string;
    relatedId?: number;
    relatedType?: string;
  }
): Promise<void> {
  try {
    const drizzleDb = drizzle(db);
    await drizzleDb.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
      isRead: false,
    });
  } catch (error) {
    console.error('创建通知失败:', error);
    // 通知创建失败不应该影响主业务流程
  }
}

// 批量创建通知（给多个用户发送相同通知）
export async function createNotificationBatch(
  db: D1Database,
  userIds: number[],
  data: {
    type: NotificationType;
    title: string;
    content: string;
    relatedId?: number;
    relatedType?: string;
  }
): Promise<void> {
  try {
    const drizzleDb = drizzle(db);
    const notificationsData: NewNotification[] = userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      content: data.content,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
      isRead: false,
    }));

    await drizzleDb.insert(notifications).values(notificationsData);
  } catch (error) {
    console.error('批量创建通知失败:', error);
  }
}

// 成就解锁通知
export async function notifyAchievementUnlocked(
  db: D1Database,
  userId: number,
  achievementName: string,
  achievementId: number,
  rewardPoints?: number
): Promise<void> {
  const content = rewardPoints
    ? `恭喜你解锁了「${achievementName}」成就，获得 ${rewardPoints} 积分奖励！`
    : `恭喜你解锁了「${achievementName}」成就！`;

  await createNotification(db, {
    userId,
    type: 'achievement_unlocked',
    title: '解锁新成就',
    content,
    relatedId: achievementId,
    relatedType: 'achievement',
  });
}

// 积分获得通知
export async function notifyPointsEarned(
  db: D1Database,
  userId: number,
  points: number,
  reason: string,
  recordId: number
): Promise<void> {
  await createNotification(db, {
    userId,
    type: 'points_earned',
    title: `获得 ${points} 积分`,
    content: `你因「${reason}」获得了 ${points} 积分，继续加油！`,
    relatedId: recordId,
    relatedType: 'point_record',
  });
}

// 积分扣除通知
export async function notifyPointsDeducted(
  db: D1Database,
  userId: number,
  points: number,
  reason: string,
  recordId: number
): Promise<void> {
  await createNotification(db, {
    userId,
    type: 'points_deducted',
    title: `扣除 ${points} 积分`,
    content: `你因「${reason}」被扣除了 ${points} 积分。`,
    relatedId: recordId,
    relatedType: 'point_record',
  });
}

// 申诉通过通知
export async function notifyAppealApproved(
  db: D1Database,
  userId: number,
  points: number,
  appealId: number
): Promise<void> {
  await createNotification(db, {
    userId,
    type: 'appeal_approved',
    title: '申诉已通过',
    content: `你的申诉已通过审核，${points} 积分已返还到你的账户。`,
    relatedId: appealId,
    relatedType: 'appeal',
  });
}

// 申诉驳回通知
export async function notifyAppealRejected(
  db: D1Database,
  userId: number,
  response: string,
  appealId: number
): Promise<void> {
  await createNotification(db, {
    userId,
    type: 'appeal_rejected',
    title: '申诉被驳回',
    content: `你的申诉未通过审核。原因：${response}`,
    relatedId: appealId,
    relatedType: 'appeal',
  });
}

// 奖励兑换通过通知
export async function notifyRewardApproved(
  db: D1Database,
  userId: number,
  rewardName: string,
  redemptionId: number
): Promise<void> {
  await createNotification(db, {
    userId,
    type: 'reward_approved',
    title: '兑换申请已通过',
    content: `你申请的「${rewardName}」已通过审核，请找家长领取奖励。`,
    relatedId: redemptionId,
    relatedType: 'redemption',
  });
}

// 奖励兑换驳回通知
export async function notifyRewardRejected(
  db: D1Database,
  userId: number,
  rewardName: string,
  note: string,
  redemptionId: number
): Promise<void> {
  await createNotification(db, {
    userId,
    type: 'reward_rejected',
    title: '兑换申请被驳回',
    content: `你申请的「${rewardName}」未通过审核。原因：${note}`,
    relatedId: redemptionId,
    relatedType: 'redemption',
  });
}

// 会议安排通知
export async function notifyMeetingScheduled(
  db: D1Database,
  userId: number,
  meetingTitle: string,
  scheduledAt: string,
  meetingId: number
): Promise<void> {
  const dateStr = new Date(scheduledAt).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await createNotification(db, {
    userId,
    type: 'meeting_scheduled',
    title: '会议已安排',
    content: `你的会议「${meetingTitle}」已安排在 ${dateStr}，请准时参加。`,
    relatedId: meetingId,
    relatedType: 'meeting',
  });
}

// 会议取消通知
export async function notifyMeetingCancelled(
  db: D1Database,
  userId: number,
  meetingTitle: string,
  reason: string,
  meetingId: number
): Promise<void> {
  await createNotification(db, {
    userId,
    type: 'meeting_cancelled',
    title: '会议已取消',
    content: `你的会议「${meetingTitle}」已被取消。原因：${reason || '无'}`,
    relatedId: meetingId,
    relatedType: 'meeting',
  });
}

// 会议评分通知
export async function notifyMeetingScored(
  db: D1Database,
  userId: number,
  meetingTitle: string,
  score: number,
  scoreNote: string,
  meetingId: number
): Promise<void> {
  const stars = '⭐'.repeat(score);
  const content = scoreNote
    ? `你的会议「${meetingTitle}」获得了 ${score} 分 ${stars}。评语：${scoreNote}`
    : `你的会议「${meetingTitle}」获得了 ${score} 分 ${stars}，表现不错！`;

  await createNotification(db, {
    userId,
    type: 'meeting_scored',
    title: '会议评分结果',
    content,
    relatedId: meetingId,
    relatedType: 'meeting',
  });
}
