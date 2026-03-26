import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { systemLogs } from '../db/schema';

// 日志操作类型
export type LogAction =
  | 'user_login'
  | 'user_logout'
  | 'user_register'
  | 'point_create'
  | 'point_update'
  | 'point_delete'
  | 'achievement_assign'
  | 'achievement_revoke'
  | 'achievement_restore'
  | 'reward_create'
  | 'reward_update'
  | 'reward_delete'
  | 'redemption_approve'
  | 'redemption_reject'
  | 'appeal_create'
  | 'appeal_approve'
  | 'appeal_reject'
  | 'meeting_create'
  | 'meeting_schedule'
  | 'meeting_cancel'
  | 'meeting_score'
  | 'family_create'
  | 'family_join'
  | 'family_leave'
  | 'config_export'
  | 'config_import';

// 实体类型
export type EntityType =
  | 'user'
  | 'point_record'
  | 'point_rule'
  | 'achievement'
  | 'user_achievement'
  | 'reward'
  | 'redemption'
  | 'appeal'
  | 'meeting'
  | 'family'
  | 'notification'
  | 'system_config';

// 日志数据接口
interface LogData {
  userId?: number;
  action: LogAction;
  entityType?: EntityType;
  entityId?: number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
}

/**
 * 创建系统日志
 */
export async function createLog(
  db: D1Database,
  data: LogData
): Promise<void> {
  try {
    const drizzleDb = drizzle(db);
    await drizzleDb.insert(systemLogs).values({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
      newValue: data.newValue ? JSON.stringify(data.newValue) : null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      description: data.description,
    });
  } catch (error) {
    console.error('创建日志失败:', error);
    // 日志创建失败不应该影响主业务流程
  }
}

/**
 * 记录积分操作日志
 */
export async function logPointOperation(
  db: D1Database,
  userId: number,
  action: 'point_create' | 'point_update' | 'point_delete',
  entityId: number,
  newValue: any,
  oldValue?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createLog(db, {
    userId,
    action,
    entityType: 'point_record',
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
    description: `${action === 'point_create' ? '创建' : action === 'point_update' ? '更新' : '删除'}积分记录`,
  });
}

/**
 * 记录成就操作日志
 */
export async function logAchievementOperation(
  db: D1Database,
  userId: number,
  action: 'achievement_assign' | 'achievement_revoke' | 'achievement_restore',
  entityId: number,
  newValue: any,
  oldValue?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    achievement_assign: '赋予成就',
    achievement_revoke: '撤销成就',
    achievement_restore: '恢复成就',
  };

  await createLog(db, {
    userId,
    action,
    entityType: 'user_achievement',
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
    description: actionMap[action],
  });
}

/**
 * 记录奖励操作日志
 */
export async function logRewardOperation(
  db: D1Database,
  userId: number,
  action: 'reward_create' | 'reward_update' | 'reward_delete' | 'redemption_approve' | 'redemption_reject',
  entityId: number,
  newValue: any,
  oldValue?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    reward_create: '创建奖励',
    reward_update: '更新奖励',
    reward_delete: '删除奖励',
    redemption_approve: '通过兑换申请',
    redemption_reject: '拒绝兑换申请',
  };

  const entityType = action.startsWith('redemption') ? 'redemption' : 'reward';

  await createLog(db, {
    userId,
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
    description: actionMap[action],
  });
}

/**
 * 记录申诉操作日志
 */
export async function logAppealOperation(
  db: D1Database,
  userId: number,
  action: 'appeal_create' | 'appeal_approve' | 'appeal_reject',
  entityId: number,
  newValue: any,
  oldValue?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    appeal_create: '提交申诉',
    appeal_approve: '通过申诉',
    appeal_reject: '驳回申诉',
  };

  await createLog(db, {
    userId,
    action,
    entityType: 'appeal',
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
    description: actionMap[action],
  });
}

/**
 * 记录会议操作日志
 */
export async function logMeetingOperation(
  db: D1Database,
  userId: number,
  action: 'meeting_create' | 'meeting_schedule' | 'meeting_cancel' | 'meeting_score',
  entityId: number,
  newValue: any,
  oldValue?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    meeting_create: '创建会议',
    meeting_schedule: '安排会议',
    meeting_cancel: '取消会议',
    meeting_score: '会议评分',
  };

  await createLog(db, {
    userId,
    action,
    entityType: 'meeting',
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
    description: actionMap[action],
  });
}

/**
 * 记录用户认证日志
 */
export async function logAuthOperation(
  db: D1Database,
  userId: number,
  action: 'user_login' | 'user_logout' | 'user_register',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    user_login: '用户登录',
    user_logout: '用户登出',
    user_register: '用户注册',
  };

  await createLog(db, {
    userId,
    action,
    entityType: 'user',
    entityId: userId,
    ipAddress,
    userAgent,
    description: actionMap[action],
  });
}

/**
 * 记录家庭操作日志
 */
export async function logFamilyOperation(
  db: D1Database,
  userId: number,
  action: 'family_create' | 'family_join' | 'family_leave',
  entityId: number,
  newValue: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    family_create: '创建家庭',
    family_join: '加入家庭',
    family_leave: '离开家庭',
  };

  await createLog(db, {
    userId,
    action,
    entityType: 'family',
    entityId,
    newValue,
    ipAddress,
    userAgent,
    description: actionMap[action],
  });
}

/**
 * 记录配置导出导入日志
 */
export async function logConfigOperation(
  db: D1Database,
  userId: number,
  action: 'config_export' | 'config_import',
  configType: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    config_export: `导出${configType}配置`,
    config_import: `导入${configType}配置`,
  };

  await createLog(db, {
    userId,
    action,
    entityType: 'system_config',
    ipAddress,
    userAgent,
    description: actionMap[action],
  });
}
