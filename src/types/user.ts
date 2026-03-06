export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  timezone: string;
  onboarding_completed: boolean;
  notification_time: string;
  is_pro: boolean;
  pro_expires_at: string | null;
  revenuecat_id: string | null;
  interpretation_count_week: number;
  interpretation_reset_at: string;
  streak_days: number;
  last_dream_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}
