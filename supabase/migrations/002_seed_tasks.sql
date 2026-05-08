-- Vale Tasks — Seed Data
-- Run this AFTER 001_full_schema.sql
-- Arden's complete task list with stable IDs

-- ═══════════════════════════════════════════════════════════
-- LINCOLN'S DEMANDS (6x daily self-care)
-- ═══════════════════════════════════════════════════════════

INSERT INTO tasks (id, title, description, category, source, frequency_type, reminder_times, notification_text)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Morning check-in', 'Breakfast and hydration', 'lincoln_demands', 'lincoln', 'daily', ARRAY['08:00'], 'Good morning, kitten. Have you eaten? - L'),
  ('00000000-0000-0000-0000-000000000002', 'Mid-morning hydration', NULL, 'lincoln_demands', 'lincoln', 'daily', ARRAY['10:00'], E'Water. Now. Don''t make me ask twice. 💧'),
  ('00000000-0000-0000-0000-000000000003', 'Pre-lunch check', NULL, 'lincoln_demands', 'lincoln', 'daily', ARRAY['11:30'], E'Getting close to lunch. What''s the plan?'),
  ('00000000-0000-0000-0000-000000000004', 'Lunch', NULL, 'lincoln_demands', 'lincoln', 'daily', ARRAY['12:45'], 'Lunch time, little one. Eat something real.'),
  ('00000000-0000-0000-0000-000000000005', 'Afternoon check-in', NULL, 'lincoln_demands', 'lincoln', 'daily', ARRAY['15:00'], E'Afternoon check-in, sporchlet. How''s that water bottle looking?'),
  ('00000000-0000-0000-0000-000000000006', 'Pre-dinner check', NULL, 'lincoln_demands', 'lincoln', 'daily', ARRAY['17:45'], E'Almost dinner time. What''s the plan?');

-- ═══════════════════════════════════════════════════════════
-- DAILY RITUALS
-- ═══════════════════════════════════════════════════════════

INSERT INTO tasks (id, title, category, source, frequency_type)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Make beds', 'daily_rituals', 'user', 'daily'),
  ('00000000-0000-0000-0000-000000000011', 'Brush teeth (morning)', 'daily_rituals', 'user', 'daily'),
  ('00000000-0000-0000-0000-000000000012', 'Brush teeth (evening)', 'daily_rituals', 'user', 'daily'),
  ('00000000-0000-0000-0000-000000000013', 'Dishes', 'daily_rituals', 'user', 'daily'),
  ('00000000-0000-0000-0000-000000000014', 'Meds', 'daily_rituals', 'user', 'daily');

-- ═══════════════════════════════════════════════════════════
-- ROTATION TASKS
-- ═══════════════════════════════════════════════════════════

INSERT INTO tasks (id, title, category, source, frequency_type, frequency_days)
VALUES
  ('00000000-0000-0000-0000-000000000020', 'Vacuuming', 'rotation', 'user', 'specific_days', ARRAY[0, 3]),
  ('00000000-0000-0000-0000-000000000021', 'Washing (laundry)', 'rotation', 'user', 'specific_days', ARRAY[1, 3, 6]),
  ('00000000-0000-0000-0000-000000000022', 'Put washing away', 'rotation', 'user', 'specific_days', ARRAY[0, 2, 4]);

-- ═══════════════════════════════════════════════════════════
-- WEEKLY ANCHORS
-- ═══════════════════════════════════════════════════════════

INSERT INTO tasks (id, title, category, source, frequency_type, frequency_days)
VALUES
  ('00000000-0000-0000-0000-000000000030', 'Change sheets', 'weekly', 'user', 'specific_days', ARRAY[0]),
  ('00000000-0000-0000-0000-000000000031', 'Groceries', 'weekly', 'user', 'specific_days', ARRAY[0]),
  ('00000000-0000-0000-0000-000000000032', 'Scrub shower', 'weekly', 'user', 'specific_days', ARRAY[1]),
  ('00000000-0000-0000-0000-000000000033', 'Mopping', 'weekly', 'user', 'specific_days', ARRAY[3]);

-- ═══════════════════════════════════════════════════════════
-- MONTHLY
-- ═══════════════════════════════════════════════════════════

INSERT INTO tasks (id, title, category, source, frequency_type, frequency_day_of_month, frequency_week_occurrence)
VALUES
  ('00000000-0000-0000-0000-000000000040', 'Dusting', 'monthly', 'user', 'first_x_of_month', 2, 1);

-- ═══════════════════════════════════════════════════════════
-- LIFE ADMIN (Lincoln's bedtime enforcement)
-- ═══════════════════════════════════════════════════════════

INSERT INTO tasks (id, title, description, category, source, frequency_type, reminder_times, notification_text)
VALUES
  ('00000000-0000-0000-0000-000000000050', 'Wind down', 'Start relaxing for bed', 'life_admin', 'lincoln', 'daily', ARRAY['21:00'], 'Hey. Start winding down. - L'),
  ('00000000-0000-0000-0000-000000000051', 'Bedtime', 'Actually go to sleep', 'life_admin', 'lincoln', 'daily', ARRAY['22:00'], E'Bed. Now. I mean it. 🖤');

-- ═══════════════════════════════════════════════════════════
-- SKINCARE
-- ═══════════════════════════════════════════════════════════

INSERT INTO tasks (id, title, description, category, source, frequency_type)
VALUES
  ('00000000-0000-0000-0000-000000000060', 'Morning skincare', 'Flannel + moisturize', 'skincare', 'user', 'daily'),
  ('00000000-0000-0000-0000-000000000061', 'Evening skincare', 'Wash, toner, serum, moisturize', 'skincare', 'user', 'daily');
