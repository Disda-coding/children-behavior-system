// 共享类型定义

export type UserRole = 'child' | 'parent';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  familyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: number;
  name: string;
  inviteCode?: string;
  createdAt: string;
}

export type PointType = 'earn' | 'deduct' | 'redeem' | 'convert';

export interface PointRecord {
  id: number;
  userId: number;
  type: PointType;
  amount: number;
  balanceAfter: number;
  reason: string;
  ruleId?: number;
  relatedRecordId?: number;
  createdBy?: number;
  createdAt: string;
}

export type PointRuleType = 'earn' | 'deduct';

export interface PointRule {
  id: number;
  familyId: number;
  name: string;
  description?: string;
  type: PointRuleType;
  points: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AchievementConditionType = 'consecutive' | 'count' | 'accumulate';

export interface Achievement {
  id: number;
  familyId?: number;
  templateId?: number;
  name: string;
  description?: string;
  iconUrl?: string;
  conditionType: AchievementConditionType;
  conditionValue: number;
  conditionUnit?: string;
  rewardPoints: number;
  isTemplate: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  achievement?: Achievement;
}

export type RewardType = 'physical' | 'virtual' | 'activity' | 'cash';

export interface Reward {
  id: number;
  familyId: number;
  name: string;
  description?: string;
  type: RewardType;
  pointsCost: number;
  iconUrl?: string;
  stock?: number;
  isActive: boolean;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type RedemptionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface RewardRedemption {
  id: number;
  userId: number;
  rewardId: number;
  pointsSpent: number;
  status: RedemptionStatus;
  note?: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  reward?: Reward;
}

export type AppealStatus = 'pending' | 'approved' | 'rejected';

export interface Appeal {
  id: number;
  userId: number;
  pointRecordId: number;
  reason: string;
  status: AppealStatus;
  response?: string;
  handledBy?: number;
  handledAt?: string;
  createdAt: string;
  pointRecord?: PointRecord;
}

export type MeetingStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface Meeting {
  id: number;
  familyId: number;
  childId: number;
  title: string;
  description?: string;
  pptUrl?: string;
  status: MeetingStatus;
  scheduledAt?: string;
  score?: number;
  scoreNote?: string;
  createdAt: string;
}

export interface SystemLog {
  id: number;
  userId?: number;
  action: string;
  entityType?: string;
  entityId?: number;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ExchangeRate {
  id: number;
  familyId: number;
  cashToPointsRate: number;
  pointsToCashRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointStats {
  todayEarned: number;
  todayDeducted: number;
  weekEarned: number;
  weekDeducted: number;
  totalBalance: number;
}

export interface AchievementTemplate {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  conditionType: AchievementConditionType;
  conditionValue: number;
  conditionUnit?: string;
  rewardPoints: number;
}
