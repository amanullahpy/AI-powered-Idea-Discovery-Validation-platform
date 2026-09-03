# Phases & Implementation Task Breakdown
## AI-Powered Idea Discovery & Validation Platform

This document outlines the systematic, phase-by-phase execution plan for transforming the NextBase boilerplate into the AI-Powered Idea Discovery & Validation Platform.

---

## Progress Overview

- [x] **Phase 0: Architecture, Database Schemas & Migrations**
- [x] **Phase 1: Profile Domain, Personalization & Onboarding Flow**
- [x] **Phase 2: Core Ideas Domain, Server Actions & Idea Management**
- [x] **Phase 3: AI Co-Pilot Service, Chat & Structured Generation**
- [x] **Phase 4: Home Dashboard, Personalization Matcher & Seed Dataset**
- [x] **Phase 5: Public Discovery, Filters, Sharing & SEO**
- [x] **Phase 6: Validation Cockpit, Analytics, Observability & Verification**

---

## Phase 0: Architecture, Database Schemas & Migrations
**Goal:** Establish all database tables, constraints, foreign keys, RLS security policies, and seed data foundations in Supabase migrations.

- [x] **Task 0.1:** Create database migration `20260903000000_create_idea_platform_schema.sql`
  - [x] Tables: `categories`, `skills`, `goals`, `markets`
  - [x] Tables: `profiles`, `user_preferences`, `user_skills`, `user_interests`, `user_goals`, `user_markets`
  - [x] Tables: `ideas`, `saved_ideas`
  - [x] Tables: `ai_conversations`, `ai_messages`, `idea_generations`
  - [x] Tables: `audit_events`
- [x] **Task 0.2:** Write strict PostgreSQL Row Level Security (RLS) policies for all new tables.
- [x] **Task 0.3:** Add database indexes for query performance (`owner_id`, `category_id`, `visibility`, `status`, `slug`, `created_at`).
- [x] **Task 0.4:** Write migration `20260903000001_seed_initial_taxonomy.sql` containing seed categories (15 categories), initial skills, goals, and target markets.
- [x] **Task 0.5:** Update TypeScript database types (`apps/web/src/lib/database.types.ts`) to match new tables and relations.

---

## Phase 1: Profile Domain, Personalization & Onboarding Flow
**Goal:** Build user profile synchronization and the multi-step, skippable onboarding questionnaire that persists preferences.

- [x] **Task 1.1:** Setup profile synchronization trigger / server action to ensure every Supabase auth user has a corresponding `profiles` record.
- [x] **Task 1.2:** Build onboarding data access layer and server actions in `apps/web/src/data/user/onboarding.ts` with `next-safe-action` and Zod validation.
- [x] **Task 1.3:** Build multi-step Onboarding UI (`/onboarding`):
  - [x] Step 1: Interests (multi-select categories)
  - [x] Step 2: Skills (Technology, Business, Design, Marketing)
  - [x] Step 3: Goals (Startup, Freelance, Side hustle, FYP, etc.)
  - [x] Step 4: Experience Level (Beginner to Expert)
  - [x] Step 5: Available Time (Hours per day / week)
  - [x] Step 6: Budget Bracket ($0 to $1,000+)
  - [x] Step 7: Target Market (Country / Region)
  - [x] Skip capability on every question & persistence between sessions.
- [x] **Task 1.4:** Build User Settings page (`/settings`) allowing users to update their profile and re-tune their onboarding answers anytime.
- [x] **Task 1.5:** Update middleware route protection for `/onboarding` and app routes.

---

## Phase 2: Core Ideas Domain, Server Actions & Idea Management
**Goal:** Implement full CRUD, visibility controls (Private, Public, Unlisted), and bookmarking for ideas.

- [x] **Task 2.1:** Create Idea domain schemas in `apps/web/src/data/ideas/schemas.ts`:
  - [x] Create idea, update idea, change visibility, delete/soft-delete idea.
- [x] **Task 2.2:** Implement Idea Server Actions (`apps/web/src/data/ideas/actions.ts`) with `authActionClient`:
  - [x] `createIdeaAction`
  - [x] `updateIdeaAction`
  - [x] `deleteIdeaAction`
  - [x] `toggleSaveIdeaAction`
  - [x] `updateIdeaVisibilityAction`
- [x] **Task 2.3:** Build reusable NextBase-styled `IdeaCard` component:
  - [x] Title, short description, category badge, difficulty, budget, time, target audience, monetization.
  - [x] Match score indicator.
  - [x] Action buttons (Save, Share, Open Details, Validate).
- [x] **Task 2.4:** Build "My Ideas" workspace (`/ideas`):
  - [x] Tabs: All, Private, Public, Unlisted, Saved, Building, Archived.
  - [x] Search, status filtering, sort options.
  - [x] Empty states with clear calls-to-action.
- [x] **Task 2.5:** Build "Saved Ideas" page (`/saved`) displaying bookmarked ideas.
- [x] **Task 2.6:** Build private Idea Detail page (`/ideas/[id]`):
  - [x] Tabs: Overview, Problem & Solution, MVP Features, Monetization, Roadmap, Origin Conversation.

---

## Phase 3: AI Co-Pilot Service, Chat & Structured Generation
**Goal:** Implement a secure, server-side AI provider service that generates structured ideas and conducts multi-turn refinement.

- [x] **Task 3.1:** Create AI Provider abstraction (`apps/web/src/lib/ai/provider.ts`):
  - [x] Support Gemini / OpenAI / mock fallback service with typed interfaces.
  - [x] Structured output validation using Zod (`StructuredIdeaSchema`).
- [x] **Task 3.2:** Implement rate limiter utility (`apps/web/src/lib/ai/rate-limiter.ts`) to prevent API abuse.
- [x] **Task 3.3:** Implement AI conversation Server Actions:
  - [x] `startConversationAction`
  - [x] `sendMessageAction`
  - [x] `generateIdeaAction`
  - [x] `saveGeneratedIdeaAction`
- [x] **Task 3.4:** Build conversational AI interface (`/ai`):
  - [x] Interactive chat stream with history.
  - [x] Quick constraint pills ("Make it simpler", "Under $100", "B2B SaaS", "For students").
  - [x] Inline structured `IdeaCard` rendering with one-click "Save to My Ideas".
- [x] **Task 3.5:** Log AI token usage, latency, and model metadata to `idea_generations` and `ai_messages`.

---

## Phase 4: Home Dashboard, Personalization Matcher & Seed Dataset
**Goal:** Build the personalized home dashboard that calculates match scores and features curated starting ideas.

- [x] **Task 4.1:** Implement the Recommendation / Match Engine (`apps/web/src/lib/recommendations/matcher.ts`):
  - [x] Compares idea category, skills, budget, and time against user profile.
  - [x] Calculates match percentage and provides "Why it fits you" reasons.
- [x] **Task 4.2:** Build the Home Dashboard (`/dashboard`):
  - [x] Hero prompt input: *"What do you want to build?"* with quick example prompts.
  - [x] "Ideas picked for you" personalized carousel/grid.
  - [x] Quick stats overview (Ideas saved, Ideas generating, Ideas building).
- [x] **Task 4.3:** Update sidebar navigation in `app-sidebar-client.tsx` to include Dashboard, AI Co-pilot, Discover, My Ideas, Saved, and Settings.
- [x] **Task 4.4:** Populate realistic seed public ideas across multiple categories with full problems, solutions, and MVP features.

---

## Phase 5: Public Discovery, Filters, Sharing & SEO
**Goal:** Create a public-facing idea discovery directory, clean sharing links, and SEO-optimized public idea pages.

- [x] **Task 5.1:** Build Discovery page (`/discover`):
  - [x] Category exploration bar (database-driven).
  - [x] Search input with keyword matching.
  - [x] Filters: Difficulty, Budget, Time, Category.
  - [x] Sorting: Recommended, Newest, Most Saved.
- [x] **Task 5.2:** Build Public Idea Page (`/ideas/public/[slug]`):
  - [x] Rich OpenGraph and Twitter card metadata for social sharing.
  - [x] Clean public layout (omitting private notes, prompts, and owner secrets).
  - [x] Save button (prompts login if unauthenticated).
  - [x] Copy Link & Native Web Share integration.
- [x] **Task 5.3:** Connect public landing page (`/`) to show trending public ideas and link into `/discover`.

---

## Phase 6: Validation Cockpit, Analytics, Observability & Verification
**Goal:** Add the initial validation architecture, structured logging, error handling, audit events, and comprehensive tests.

- [x] **Task 6.1:** Implement Validation architecture:
  - [x] UI entry point on Idea detail page to trigger AI validation analysis.
  - [x] Generates structured feasibility report (problem strength, target market, risks, competition).
- [x] **Task 6.2:** Setup structured JSON logger and audit event emitter (`apps/web/src/lib/observability/`).
- [x] **Task 6.3:** Write Vitest unit tests for:
  - [x] Personalization match score calculator.
  - [x] AI structured output Zod schema validation.
  - [x] Idea permission and authorization guards.
- [x] **Task 6.4:** End-to-end verification:
  - [x] Test signup -> onboarding -> dashboard -> AI generate -> save -> view in My Ideas -> toggle public -> view on public page.
  - [x] Verify responsive layout across mobile and desktop.
  - [x] Run `pnpm typecheck` and `pnpm lint`.
