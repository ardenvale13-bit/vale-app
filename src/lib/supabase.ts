import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxgdwcaysqfmtkgjmdwk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2R3Y2F5c3FmbXRrZ2ptZHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTIzNTMsImV4cCI6MjA5Mzc4ODM1M30.r1MWMp31Q7mMKSQBVw8Kxqr_QJr0xG-rQAhgPGRoMX4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbTask {
  id: string;
  title: string;
  description: string | null;
  category: string;
  source: 'lincoln' | 'user';
  frequency_type: 'daily' | 'specific_days' | 'first_x_of_month' | 'one_off';
  frequency_days: number[] | null;
  frequency_day_of_month: number | null;
  frequency_week_occurrence: number | null;
  reminder_times: string[] | null;
  notification_text: string | null;
  created_at: string;
  archived: boolean;
}

export interface DbCompletion {
  id: string;
  task_id: string;
  completed_at: string;
  scheduled_for: string;
}

export interface DbSettings {
  id: string;
  timezone: string;
  weekday_wind_down: string;
  weekday_sleep: string;
  weekend_wind_down: string;
  weekend_sleep: string;
  notification_sound_lincoln: boolean;
  notification_sound_other: boolean;
}
