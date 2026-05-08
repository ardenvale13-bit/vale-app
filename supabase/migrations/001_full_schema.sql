-- Vale Tasks — Full Schema Migration
-- Run this in the Supabase SQL Editor for your new project

-- ═══════════════════════════════════════════════════════════
-- 1. TASKS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'daily_rituals',
  source TEXT NOT NULL DEFAULT 'user',        -- 'lincoln' | 'user'
  frequency_type TEXT NOT NULL DEFAULT 'daily', -- 'daily' | 'specific_days' | 'first_x_of_month' | 'one_off'
  frequency_days INTEGER[],                    -- day-of-week array [0-6], null for daily
  frequency_day_of_month INTEGER,              -- for monthly tasks
  frequency_week_occurrence INTEGER,           -- for monthly tasks (1st, 2nd, etc.)
  reminder_times TEXT[],                       -- ['08:00', '12:00'] etc.
  notification_text TEXT,                      -- Lincoln's custom message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source);

-- RLS (single-user app — allow all)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 2. COMPLETIONS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for DATE NOT NULL                  -- the date this completion counts for
);

-- Prevent double-completing same task on same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_completions_task_date
  ON completions(task_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_completions_scheduled ON completions(scheduled_for);

-- RLS
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for completions" ON completions
  FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 3. PUSH SUBSCRIPTIONS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  user_agent TEXT,
  device_name TEXT
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for push_subscriptions" ON push_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 4. ENABLE REALTIME (for live task updates from Lincoln)
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE completions;
