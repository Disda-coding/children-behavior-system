-- 添加数据备份表
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('manual', 'auto')) DEFAULT 'manual',
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'restoring')) DEFAULT 'pending',
  data_size INTEGER,
  tables TEXT,
  record_counts TEXT,
  storage_url TEXT,
  storage_type TEXT CHECK(storage_type IN ('database', 'kv', 'r2')) DEFAULT 'database',
  created_by INTEGER NOT NULL,
  restored_at TEXT,
  restored_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_backups_family_id ON backups(family_id);
CREATE INDEX IF NOT EXISTS idx_backups_type ON backups(type);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at);