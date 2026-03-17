import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['child', 'parent'] }).notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  familyId: integer('family_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 家庭表
export const families = sqliteTable('families', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  inviteCode: text('invite_code').unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 积分记录表
export const pointRecords = sqliteTable('point_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  type: text('type', { enum: ['earn', 'deduct', 'redeem', 'convert'] }).notNull(),
  amount: integer('amount').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  reason: text('reason').notNull(),
  ruleId: integer('rule_id'),
  relatedRecordId: integer('related_record_id'),
  createdBy: integer('created_by'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 积分规则表
export const pointRules = sqliteTable('point_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  familyId: integer('family_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['earn', 'deduct'] }).notNull(),
  points: integer('points').notNull(),
  category: text('category'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 成就表
export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  familyId: integer('family_id'),
  templateId: integer('template_id'),
  name: text('name').notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  conditionType: text('condition_type', { enum: ['consecutive', 'count', 'accumulate'] }).notNull(),
  conditionValue: integer('condition_value').notNull(),
  conditionUnit: text('condition_unit'),
  rewardPoints: integer('reward_points').default(0),
  isTemplate: integer('is_template', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 用户成就表
export const userAchievements = sqliteTable('user_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  achievementId: integer('achievement_id').notNull(),
  progress: integer('progress').default(0),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 奖励表
export const rewards = sqliteTable('rewards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  familyId: integer('family_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['physical', 'virtual', 'activity', 'cash'] }).notNull(),
  pointsCost: integer('points_cost').notNull(),
  iconUrl: text('icon_url'),
  stock: integer('stock'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  config: text('config', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 奖励兑换记录表
export const rewardRedemptions = sqliteTable('reward_redemptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  rewardId: integer('reward_id').notNull(),
  pointsSpent: integer('points_spent').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'completed'] }).default('pending'),
  note: text('note'),
  approvedBy: integer('approved_by'),
  approvedAt: text('approved_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 申诉表
export const appeals = sqliteTable('appeals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  pointRecordId: integer('point_record_id').notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  response: text('response'),
  handledBy: integer('handled_by'),
  handledAt: text('handled_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 会议表
export const meetings = sqliteTable('meetings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  familyId: integer('family_id').notNull(),
  childId: integer('child_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  pptUrl: text('ppt_url'),
  status: text('status', { enum: ['pending', 'scheduled', 'completed', 'cancelled'] }).default('pending'),
  scheduledAt: text('scheduled_at'),
  score: integer('score'),
  scoreNote: text('score_note'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 系统日志表
export const systemLogs = sqliteTable('system_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  oldValue: text('old_value', { mode: 'json' }),
  newValue: text('new_value', { mode: 'json' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 兑换比例配置表
export const exchangeRates = sqliteTable('exchange_rates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  familyId: integer('family_id').notNull(),
  cashToPointsRate: integer('cash_to_points_rate').notNull().default(10),
  pointsToCashRate: integer('points_to_cash_rate').notNull().default(100),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 类型导出
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Family = typeof families.$inferSelect;
export type NewFamily = typeof families.$inferInsert;
export type PointRecord = typeof pointRecords.$inferSelect;
export type NewPointRecord = typeof pointRecords.$inferInsert;
export type PointRule = typeof pointRules.$inferSelect;
export type NewPointRule = typeof pointRules.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type Reward = typeof rewards.$inferSelect;
export type NewReward = typeof rewards.$inferInsert;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type NewRewardRedemption = typeof rewardRedemptions.$inferInsert;
export type Appeal = typeof appeals.$inferSelect;
export type NewAppeal = typeof appeals.$inferInsert;
export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type NewExchangeRate = typeof exchangeRates.$inferInsert;
