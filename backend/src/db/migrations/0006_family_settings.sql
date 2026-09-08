-- 0006_family_settings.sql
-- 家庭配置：三环目标（家长可调）+ 现金兑换汇率；奖励表加零花钱标记

ALTER TABLE families ADD COLUMN ring_target_points INTEGER DEFAULT 20;
ALTER TABLE families ADD COLUMN ring_target_count INTEGER DEFAULT 3;
ALTER TABLE families ADD COLUMN cash_exchange_rate INTEGER DEFAULT 100;
ALTER TABLE rewards ADD COLUMN is_cash INTEGER DEFAULT 0;
