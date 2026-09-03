-- Migration: Create Idea Platform Schema
-- Phase 0: Complete Relational Schema, RLS, Indexes, Triggers and Grants

-- 1. Taxonomy & Lookup Tables
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- Tech, Business, Design, Marketing
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  region text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Profiles & Personalization
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_level text CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
  available_time text CHECK (available_time IN ('LESS_THAN_1_HR', '1_TO_2_HRS', '2_TO_4_HRS', '4_TO_8_HRS', 'FULL_TIME')),
  budget_bracket text CHECK (budget_bracket IN ('ZERO', '1_TO_50', '50_TO_250', '250_TO_1000', '1000_PLUS', 'NOT_SURE')),
  target_audience_focus text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_skills (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.user_goals (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, goal_id)
);

CREATE TABLE IF NOT EXISTS public.user_markets (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, market_id)
);

-- 3. Core Ideas Domain
CREATE TABLE IF NOT EXISTS public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL,
  description text,
  problem text,
  solution text,
  target_audience text,
  monetization text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  difficulty text NOT NULL DEFAULT 'INTERMEDIATE' CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'HARD')),
  estimated_cost text,
  estimated_time text,
  mvp_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  visibility text NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE', 'PUBLIC', 'UNLISTED')),
  status text NOT NULL DEFAULT 'SAVED' CHECK (status IN ('DRAFT', 'SAVED', 'VALIDATING', 'BUILDING', 'LAUNCHED', 'ARCHIVED')),
  ai_generated boolean NOT NULL DEFAULT false,
  ai_model text,
  ai_generation_id uuid,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.saved_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_ideas_user_idea_unique UNIQUE (user_id, idea_id)
);

-- 4. AI Co-Pilot & Generations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Idea Conversation',
  context_type text NOT NULL DEFAULT 'GENERATION' CHECK (context_type IN ('GENERATION', 'REFINEMENT', 'VALIDATION')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  latency_ms integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.idea_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES public.ideas(id) ON DELETE SET NULL,
  model text NOT NULL,
  provider text NOT NULL,
  prompt_version text,
  structured_output jsonb NOT NULL,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  latency_ms integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Audit Events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories (is_active);
CREATE INDEX IF NOT EXISTS idx_ideas_owner_id ON public.ideas (owner_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category_id ON public.ideas (category_id);
CREATE INDEX IF NOT EXISTS idx_ideas_visibility ON public.ideas (visibility);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON public.ideas (status);
CREATE INDEX IF NOT EXISTS idx_ideas_slug ON public.ideas (slug);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_ideas_user_id ON public.saved_ideas (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ideas_idea_id ON public.saved_ideas (idea_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_id ON public.ai_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_idea_generations_user_id ON public.idea_generations (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON public.audit_events (user_id);

-- Profile Auto-Creation Trigger from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Lookup tables (readable by everyone, writable only by service_role)
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read goals" ON public.goals FOR SELECT USING (true);
CREATE POLICY "Public read markets" ON public.markets FOR SELECT USING (true);

-- Profiles
CREATE POLICY "Read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read profile basics" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User Preferences & Onboarding
CREATE POLICY "Users manage own preferences" ON public.user_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own skills" ON public.user_skills FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own interests" ON public.user_interests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON public.user_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own markets" ON public.user_markets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Ideas RLS
-- Owner can do everything with their ideas
CREATE POLICY "Owners full access to own ideas" ON public.ideas FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Public ideas can be read by anyone (auth or anon) if not soft-deleted
CREATE POLICY "Public read accessible ideas" ON public.ideas FOR SELECT
  USING (
    deleted_at IS NULL AND (
      visibility = 'PUBLIC' OR
      visibility = 'UNLISTED' OR
      (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
    )
  );

-- Saved Ideas RLS
CREATE POLICY "Users manage own saved ideas" ON public.saved_ideas FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI Conversations & Messages RLS
CREATE POLICY "Users manage own conversations" ON public.ai_conversations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own ai messages" ON public.ai_messages FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own generations" ON public.idea_generations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Audit events (Users can read own logs)
CREATE POLICY "Users view own audit events" ON public.audit_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "System insert audit events" ON public.audit_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Explicit Grants
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.skills TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.goals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.markets TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_preferences TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_skills TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_interests TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_goals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_markets TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ideas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.saved_ideas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ai_conversations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ai_messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.idea_generations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_events TO anon, authenticated, service_role;
