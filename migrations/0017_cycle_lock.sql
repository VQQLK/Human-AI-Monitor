CREATE TABLE IF NOT EXISTS cycle_lock (
  lock_key TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  acquired_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cycle_lock_expires ON cycle_lock(expires_at);
