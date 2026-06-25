-- ============================================================
-- LUCID.AI — Migration 002 — Bug fixes & security hardening
-- ============================================================

-- ── 1. Corriger la logique de streak (bug IF/ELSIF) ──────────
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_today     DATE := CURRENT_DATE;
BEGIN
  SELECT last_dream_at INTO v_last_date
  FROM public.profiles WHERE id = p_user_id;

  IF v_last_date IS NULL THEN
    -- Premier rêve ever
    UPDATE public.profiles
    SET streak_days = 1, last_dream_at = v_today
    WHERE id = p_user_id;

  ELSIF v_last_date = v_today THEN
    -- Déjà enregistré aujourd'hui — ne rien faire
    NULL;

  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    -- Hier → incrémenter le streak
    UPDATE public.profiles
    SET streak_days = streak_days + 1, last_dream_at = v_today
    WHERE id = p_user_id;

  ELSE
    -- Gap > 1 jour → reset
    UPDATE public.profiles
    SET streak_days = 1, last_dream_at = v_today
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. Ajouter politique DELETE sur interpretations ──────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'interpretations'
      AND policyname = 'interpretations_delete_own'
  ) THEN
    CREATE POLICY "interpretations_delete_own" ON public.interpretations
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── 3. Ajouter moderation_status sur feed_posts ──────────────
ALTER TABLE public.feed_posts
  ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- ── 4. Index manquant sur feed_votes ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_feed_votes_user
  ON public.feed_votes(user_id);

-- ── 5. Fonction atomique pour vote (évite race condition) ─────
CREATE OR REPLACE FUNCTION public.toggle_feed_vote(
  p_post_id UUID,
  p_user_id UUID
) RETURNS jsonb AS $$
DECLARE
  v_exists BOOLEAN;
  v_delta  INTEGER;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.feed_votes
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.feed_votes
    WHERE post_id = p_post_id AND user_id = p_user_id;
    v_delta := -1;
  ELSE
    INSERT INTO public.feed_votes (post_id, user_id)
    VALUES (p_post_id, p_user_id)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    v_delta := 1;
  END IF;

  UPDATE public.feed_posts
  SET vote_count = GREATEST(0, vote_count + v_delta)
  WHERE id = p_post_id;

  RETURN jsonb_build_object('voted', NOT v_exists, 'delta', v_delta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. Soft-delete pour les rêves (au lieu de DELETE dur) ─────
ALTER TABLE public.dreams
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Vue filtrée (les clients lisent cette vue, pas la table directement)
CREATE OR REPLACE VIEW public.active_dreams AS
  SELECT * FROM public.dreams WHERE deleted_at IS NULL;

GRANT SELECT ON public.active_dreams TO authenticated;
