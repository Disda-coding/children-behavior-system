-- 添加成就撤销功能相关字段
-- 迁移日期: 2026-03-20

-- 为 user_achievements 表添加撤销相关字段
ALTER TABLE user_achievements ADD COLUMN is_revoked BOOLEAN DEFAULT 0;
ALTER TABLE user_achievements ADD COLUMN revoked_at DATETIME;
ALTER TABLE user_achievements ADD COLUMN revoked_by INTEGER;
ALTER TABLE user_achievements ADD COLUMN revoke_reason TEXT;

-- 添加索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_achievements_is_revoked ON user_achievements(is_revoked);
CREATE INDEX IF NOT EXISTS idx_user_achievements_revoked_by ON user_achievements(revoked_by);

-- 更新现有数据，确保 is_revoked 字段有默认值
UPDATE user_achievements SET is_revoked = 0 WHERE is_revoked IS NULL;
