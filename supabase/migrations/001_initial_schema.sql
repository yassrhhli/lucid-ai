-- ============================================================
-- LUCID.AI — Migration 001 — Initial Schema
-- Exécuter dans Supabase SQL Editor
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (étend auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  notification_time TIME DEFAULT '08:00:00',
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  revenuecat_id TEXT UNIQUE,
  interpretation_count_week INTEGER DEFAULT 0,
  interpretation_reset_at TIMESTAMPTZ DEFAULT NOW(),
  streak_days INTEGER DEFAULT 0,
  last_dream_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DREAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  dream_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  emotions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_lucid BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTERPRETATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbols JSONB DEFAULT '[]',
  emotional_analysis TEXT,
  psychological_insight TEXT,
  archetypes TEXT[],
  recurring_themes TEXT[],
  affirmation TEXT,
  model_used TEXT DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER DEFAULT 0,
  prompt_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FEED POSTS (dreams publics)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anonymous_name TEXT NOT NULL DEFAULT 'Anonymous Dreamer',
  vote_count INTEGER DEFAULT 0,
  weirdness_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FEED VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feed_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================================
-- SYMBOLS DICTIONARY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  psychological_meaning TEXT,
  cultural_meaning JSONB DEFAULT '{}',
  search_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbols ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Dreams : full CRUD sur les siennes
CREATE POLICY "dreams_all_own" ON public.dreams
  FOR ALL USING (auth.uid() = user_id);

-- Interpretations
CREATE POLICY "interpretations_select_own" ON public.interpretations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "interpretations_insert_own" ON public.interpretations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feed : lecture publique
CREATE POLICY "feed_select_public" ON public.feed_posts
  FOR SELECT USING (true);

CREATE POLICY "feed_insert_own" ON public.feed_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feed_delete_own" ON public.feed_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Feed votes
CREATE POLICY "votes_select_all" ON public.feed_votes
  FOR SELECT USING (true);

CREATE POLICY "votes_insert_own" ON public.feed_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "votes_delete_own" ON public.feed_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Symbols : lecture publique, écriture admin
CREATE POLICY "symbols_select_all" ON public.symbols
  FOR SELECT USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dreams_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reset interprétations hebdomadaires (appelé par cron ou Edge Function)
CREATE OR REPLACE FUNCTION public.reset_weekly_interpretations()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    interpretation_count_week = 0,
    interpretation_reset_at = NOW()
  WHERE
    interpretation_reset_at < NOW() - INTERVAL '7 days'
    AND is_pro = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_dream_at INTO v_last_date
  FROM public.profiles WHERE id = p_user_id;

  IF v_last_date IS NULL OR v_last_date < v_today - INTERVAL '1 day' THEN
    -- Reset streak si plus d'un jour de gap
    IF v_last_date < v_today - INTERVAL '1 day' THEN
      UPDATE public.profiles
      SET streak_days = 1, last_dream_at = v_today
      WHERE id = p_user_id;
    ELSE
      UPDATE public.profiles
      SET streak_days = streak_days + 1, last_dream_at = v_today
      WHERE id = p_user_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dreams_user_date
  ON public.dreams(user_id, dream_date DESC);

CREATE INDEX IF NOT EXISTS idx_dreams_public
  ON public.dreams(is_public, created_at DESC)
  WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_interpretations_dream
  ON public.interpretations(dream_id);

CREATE INDEX IF NOT EXISTS idx_interpretations_user
  ON public.interpretations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feed_posts_created
  ON public.feed_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feed_posts_votes
  ON public.feed_posts(vote_count DESC);

CREATE INDEX IF NOT EXISTS idx_symbols_name
  ON public.symbols(name);

CREATE INDEX IF NOT EXISTS idx_symbols_category
  ON public.symbols(category);

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.symbols TO anon;
GRANT SELECT ON public.feed_posts TO anon;
