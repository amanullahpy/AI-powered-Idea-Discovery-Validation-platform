-- =============================================================================
-- Migration: 20260904000001_validation_trends_competitors_schema.sql
-- Description: Adds persistent tables for:
--  1. idea_interviews (Customer Discovery Interviews)
--  2. idea_experiments (Smoke-Test Validation Experiments)
--  3. idea_competitors (Competitor Teardowns & Moats)
--  4. market_trends (Live Market Signals & Scraped Trends)
--  5. user_trend_bookmarks (User Bookmarked Trends)
-- =============================================================================

-- 1. Customer Discovery Interviews
CREATE TABLE IF NOT EXISTS public.idea_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  company_or_channel text,
  pain_score integer NOT NULL DEFAULT 8 CHECK (pain_score >= 1 AND pain_score <= 10),
  willingness_to_pay text,
  key_quote text NOT NULL,
  verdict text NOT NULL DEFAULT 'Validated' CHECK (verdict IN ('Validated', 'Neutral', 'Invalidated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idea_interviews_idea_created ON public.idea_interviews (idea_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_interviews_user_created ON public.idea_interviews (user_id, created_at DESC);

ALTER TABLE public.idea_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own idea interviews"
  ON public.idea_interviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert interviews for their own ideas"
  ON public.idea_interviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own idea interviews"
  ON public.idea_interviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own idea interviews"
  ON public.idea_interviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Validation Smoke-Test Experiments
CREATE TABLE IF NOT EXISTS public.idea_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  experiment_type text NOT NULL,
  target_metric text NOT NULL,
  current_result text,
  status text NOT NULL DEFAULT 'In Progress' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idea_experiments_idea_created ON public.idea_experiments (idea_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_experiments_user_created ON public.idea_experiments (user_id, created_at DESC);

ALTER TABLE public.idea_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own experiments"
  ON public.idea_experiments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experiments"
  ON public.idea_experiments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON public.idea_experiments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments"
  ON public.idea_experiments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Competitor Teardowns & Moats
CREATE TABLE IF NOT EXISTS public.idea_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  pricing_model text,
  strength text,
  vulnerability text NOT NULL,
  user_complaints text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idea_competitors_idea_created ON public.idea_competitors (idea_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_competitors_user_created ON public.idea_competitors (user_id, created_at DESC);

ALTER TABLE public.idea_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own competitors"
  ON public.idea_competitors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert competitors for their ideas"
  ON public.idea_competitors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors"
  ON public.idea_competitors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors"
  ON public.idea_competitors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Market Trends & Opportunities Radar
CREATE TABLE IF NOT EXISTS public.market_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  growth_rate text NOT NULL,
  signal_strength text NOT NULL DEFAULT 'High',
  opportunity_score integer NOT NULL DEFAULT 85,
  competition_density text NOT NULL DEFAULT 'Moderate',
  target_audience text,
  overview text NOT NULL,
  unsolved_pains jsonb NOT NULL DEFAULT '[]'::jsonb,
  whitespace_moat text,
  starter_prompt text,
  source text DEFAULT 'live_intelligence',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_trends_cat_opp ON public.market_trends (category, opportunity_score DESC);

ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view market trends"
  ON public.market_trends FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role or authenticated users can insert/update trends"
  ON public.market_trends FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update trends"
  ON public.market_trends FOR UPDATE
  TO authenticated
  USING (true);

-- 5. User Trend Bookmarks
CREATE TABLE IF NOT EXISTS public.user_trend_bookmarks (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trend_id uuid NOT NULL REFERENCES public.market_trends(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, trend_id)
);

ALTER TABLE public.user_trend_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own trend bookmarks"
  ON public.user_trend_bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT ALL ON public.idea_interviews TO authenticated, service_role;
GRANT ALL ON public.idea_experiments TO authenticated, service_role;
GRANT ALL ON public.idea_competitors TO authenticated, service_role;
GRANT ALL ON public.market_trends TO authenticated, service_role;
GRANT ALL ON public.user_trend_bookmarks TO authenticated, service_role;
