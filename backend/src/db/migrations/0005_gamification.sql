-- 0005_gamification.sql
-- 游戏化增强：Streak 连续打卡 + 冻结卡 + 惰性月度重置
-- EXP 不需要列：等级直接由 point_records 累计 earn 推导

ALTER TABLE users ADD COLUMN streak_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN streak_last_date TEXT;
ALTER TABLE users ADD COLUMN streak_freeze_cards INTEGER DEFAULT 2;
ALTER TABLE users ADD COLUMN streak_freeze_reset_month TEXT;
