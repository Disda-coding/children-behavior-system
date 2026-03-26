-- 添加通知表
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('achievement_unlocked', 'points_earned', 'points_deducted', 'appeal_approved', 'appeal_rejected', 'reward_approved', 'reward_rejected', 'meeting_scheduled', 'meeting_cancelled', 'meeting_scored', 'system')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id INTEGER,
  related_type TEXT,
  is_read INTEGER DEFAULT 0,
  read_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);