# Product Requirements Document (PRD)
## AI-Powered Idea Discovery & Validation Platform

**Status:** Approved Baseline  
**Base Repository:** `imbhargav5/nextbase-nextjs-supabase-starter` (Next.js 16 + Supabase + Tailwind + shadcn/ui)  
**Target Delivery:** Phased Implementation (P0 MVP → P1 Expansion → P2 Scaling)  

---

## 1. Executive Summary & Core Purpose

The **AI-Powered Idea Discovery & Validation Platform** is a specialized platform designed to guide entrepreneurs, makers, developers, students, and indie creators through the entire lifecycle of discovering, personalizing, generating, saving, validating, comparing, and launching actionable business and project ideas.

### Product Lifecycle Flow
```text
Discover → Personalize → Generate → Save → Refine → Validate → Compare → Plan → Build → Launch
```

### Critical Architectural Mandate
- **Preserve NextBase Design & Conventions:** Build directly on top of the existing NextBase boilerplate. Do **not** replace or rebuild UI components, layouts, routing patterns, Tailwind CSS, or shadcn/ui styling.
- **Single Source of Auth & DB:** Strictly leverage Supabase Auth and PostgreSQL with Row Level Security (RLS).
- **Server-First & Type-Safe:** Follow NextBase conventions: Server Components for reads, `next-safe-action` with Zod schemas for mutations, and TanStack Query where interactive client cache is needed.
- **Modular Domain Architecture:** Organize code cleanly by domain (`auth`, `profiles`, `onboarding`, `ideas`, `ai`, `discovery`, `saved-ideas`).

---

## 2. Supported Idea Categories (Extensible Taxonomy)

Categories are **strictly database-driven** and support parent/child hierarchies, slugs, icons, and descriptions without requiring frontend or backend code restructuring:
1. **Startup**
2. **SaaS** (Micro-SaaS, B2B, B2C, Vertical SaaS)
3. **Mobile Apps** (iOS, Android, Cross-platform)
4. **Web Apps**
5. **AI Products** (Agents, Wrappers, Workflows, Fine-tuned tools)
6. **Side Hustles**
7. **Small / Local Business**
8. **E-commerce** (D2C, Dropshipping, Digital Products)
9. **Student / Final Year Projects (FYP)**
10. **Research & Academic**
11. **Freelance & Agency Offerings**
12. **Content & Media**
13. **Developer Tools & Infrastructure**
14. **Automation & Workflows**
15. **Physical / Hybrid Hardware Products**

---

## 3. User Experience & Route Architecture

### Public & Auth Routes
- `/` — Landing page with hero, value proposition, featured public ideas, and CTA.
- `/login` — Supabase Email + Password authentication.
- `/sign-up` — Account registration with email confirmation.
- `/forgot-password` & `/update-password` — Password reset flows.
- `/ideas/[slug]` — SEO-optimized public view of published or unlisted ideas.

### Protected Application Routes (`(app-pages)` layout with collapsible Sidebar)
- `/onboarding` — Multi-step, skippable personalization questionnaire (interests, skills, goals, budget, time, experience, market).
- `/dashboard` — Personalized home dashboard with "Ideas picked for you", AI prompt entry point ("What do you want to build?"), and quick activity stats.
- `/ai` — Conversational AI idea co-pilot: prompt, multi-turn refinement, constraint tuning, and direct saving.
- `/ideas` — "My Ideas" workspace with tabs: All, Private, Public, Unlisted, Saved, In Validation, Building, Archived.
- `/ideas/[id]` — Detailed private idea cockpit: overview, problem/solution, MVP scope, financial/time estimates, AI validation analysis, roadmap, and origin conversation link.
- `/discover` — Public idea directory with category taxonomy, keyword search, difficulty/budget/time filters, and recommendation sort.
- `/saved` — Dedicated bookmarked ideas gallery.
- `/profile` — User profile, bio, public ideas showcase.
- `/settings` — Profile, account, and editable personalization preferences (allowing users to re-tune their onboarding answers anytime).

---

## 4. Domain Model & Database Schema

All database structures are defined via versioned Supabase migrations with strict RLS policies, foreign keys, and indexes.

### 4.1 Lookup & Onboarding Tables
- **`categories`**:
  - `id` (UUID, PK), `parent_id` (UUID, FK self), `name` (TEXT), `slug` (TEXT UNIQUE), `description` (TEXT), `icon` (TEXT), `sort_order` (INT), `is_active` (BOOLEAN).
- **`skills`**:
  - `id` (UUID, PK), `category` (TEXT - Tech/Business/Design/Marketing), `name` (TEXT UNIQUE), `slug` (TEXT UNIQUE).
- **`goals`**:
  - `id` (UUID, PK), `title` (TEXT), `description` (TEXT), `slug` (TEXT UNIQUE).
- **`markets`**:
  - `id` (UUID, PK), `name` (TEXT), `code` (TEXT UNIQUE), `region` (TEXT).

### 4.2 Profiles & Personalization
- **`profiles`**:
  - `id` (UUID, PK, references `auth.users.id` ON DELETE CASCADE), `username` (TEXT UNIQUE), `display_name` (TEXT), `avatar_url` (TEXT), `bio` (TEXT), `onboarding_completed` (BOOLEAN DEFAULT false), `created_at`, `updated_at`.
- **`user_preferences`**:
  - `id` (UUID, PK), `user_id` (UUID, FK `profiles.id`), `experience_level` (`BEGINNER` | `INTERMEDIATE` | `ADVANCED` | `EXPERT`), `available_time` (`LESS_THAN_1_HR` | `1_TO_2_HRS` | `2_TO_4_HRS` | `4_TO_8_HRS` | `FULL_TIME`), `budget_bracket` (`ZERO` | `1_TO_50` | `50_TO_250` | `250_TO_1000` | `1000_PLUS` | `NOT_SURE`), `created_at`, `updated_at`.
- **`user_skills`**:
  - `user_id` (UUID, FK), `skill_id` (UUID, FK), PK (`user_id`, `skill_id`).
- **`user_interests`**:
  - `user_id` (UUID, FK), `category_id` (UUID, FK), PK (`user_id`, `category_id`).
- **`user_goals`**:
  - `user_id` (UUID, FK), `goal_id` (UUID, FK), PK (`user_id`, `goal_id`).
- **`user_markets`**:
  - `user_id` (UUID, FK), `market_id` (UUID, FK), PK (`user_id`, `market_id`).

### 4.3 Core Ideas Domain
- **`ideas`**:
  - `id` (UUID, PK), `owner_id` (UUID, FK `profiles.id`), `title` (TEXT), `slug` (TEXT UNIQUE), `short_description` (TEXT), `description` (TEXT), `problem` (TEXT), `solution` (TEXT), `target_audience` (TEXT), `monetization` (TEXT), `category_id` (UUID, FK `categories.id`), `difficulty` (`BEGINNER` | `INTERMEDIATE` | `ADVANCED` | `HARD`), `estimated_cost` (TEXT), `estimated_time` (TEXT), `mvp_features` (JSONB), `visibility` (`PRIVATE` | `PUBLIC` | `UNLISTED` DEFAULT `PRIVATE`), `status` (`DRAFT` | `SAVED` | `VALIDATING` | `BUILDING` | `LAUNCHED` | `ARCHIVED`), `ai_generated` (BOOLEAN DEFAULT false), `ai_model` (TEXT), `ai_generation_id` (UUID), `deleted_at` (TIMESTAMPTZ NULL), `created_at`, `updated_at`, `published_at`.
- **`saved_ideas`**:
  - `id` (UUID, PK), `user_id` (UUID, FK `profiles.id`), `idea_id` (UUID, FK `ideas.id`), `notes` (TEXT), `created_at`, UNIQUE (`user_id`, `idea_id`).

### 4.4 AI & Observability
- **`ai_conversations`**:
  - `id` (UUID, PK), `user_id` (UUID, FK `profiles.id`), `title` (TEXT), `context_type` (`GENERATION` | `REFINEMENT` | `VALIDATION`), `created_at`, `updated_at`.
- **`ai_messages`**:
  - `id` (UUID, PK), `conversation_id` (UUID, FK `ai_conversations.id` ON DELETE CASCADE), `role` (`user` | `assistant` | `system`), `content` (TEXT), `metadata` (JSONB), `input_tokens` (INT), `output_tokens` (INT), `latency_ms` (INT), `created_at`.
- **`idea_generations`**:
  - `id` (UUID, PK), `conversation_id` (UUID, FK `ai_conversations.id`), `user_id` (UUID, FK `profiles.id`), `idea_id` (UUID, FK `ideas.id` NULL), `model` (TEXT), `provider` (TEXT), `prompt_version` (TEXT), `structured_output` (JSONB), `input_tokens` (INT), `output_tokens` (INT), `latency_ms` (INT), `created_at`.
- **`audit_events`**:
  - `id` (UUID, PK), `user_id` (UUID NULL), `event_type` (TEXT), `entity_type` (TEXT), `entity_id` (TEXT), `metadata` (JSONB), `ip_address` (TEXT), `created_at`.

---

## 5. Security & Row Level Security (RLS) Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `categories`, `skills`, `goals`, `markets` | Public (active only) | Service role only | Service role only | Service role only |
| `profiles` | Authenticated users | Owner (`auth.uid() = id`) | Owner | Owner |
| `user_preferences`, `user_*` | Owner | Owner | Owner | Owner |
| `ideas` | Owner OR `visibility = 'PUBLIC'` OR `visibility = 'UNLISTED'` (direct slug/id only) | Owner | Owner | Owner |
| `saved_ideas` | Owner | Owner | Owner | Owner |
| `ai_conversations`, `ai_messages` | Owner | Owner | Owner | Owner |
| `idea_generations` | Owner | Owner | Owner | Service role only |
| `audit_events` | Owner (own logs) | Authenticated / Service | None (immutable) | None (immutable) |

---

## 6. AI Co-Pilot Architecture & Guardrails

1. **Provider Abstraction (`AIProvider` interface):**
   ```ts
   interface AIProvider {
     generateIdea(prompt: string, userContext?: UserPersonalization): Promise<StructuredIdeaOutput>;
     continueConversation(messages: AIMessage[], userContext?: UserPersonalization): Promise<AIResponse>;
     refineIdea(existingIdea: StructuredIdeaOutput, instructions: string): Promise<StructuredIdeaOutput>;
     validateIdea(idea: IdeaEntity): Promise<ValidationReport>;
   }
   ```
2. **Structured Outputs with Zod Validation:**
   AI never dumps arbitrary prose into database records. The response is validated through `StructuredIdeaSchema`:
   - `title`, `short_description`, `category_slug`, `problem`, `solution`, `target_audience`, `monetization`, `difficulty`, `estimated_cost`, `estimated_time`, `mvp_features` (array of strings), `why_it_fits`.
3. **No Direct DB Access for AI:** AI models never execute raw SQL or mutate database records directly. Mutations are orchestrated strictly through validated Server Actions.
4. **Rate Limiting:** Protect generation actions against abuse with configurable per-user / per-minute allowances.
5. **Private By Default:** All generated ideas are marked `visibility = 'PRIVATE'` until the user explicitly clicks Publish.

---

## 7. Recommendation & Match Scoring Engine

A deterministic scoring engine maps an Idea's attributes against the active User's profile preferences:
- **Interests/Category Match (30%):** Does the category overlap with user's selected interests?
- **Skills Match (25%):** Are required skills present in user's profile?
- **Budget Fit (15%):** Does the estimated cost fit within user's budget bracket?
- **Time Commitment Fit (15%):** Does the estimated weekly hours align with user availability?
- **Market Alignment (15%):** Does the target audience match user's selected focus markets?

Outputs an intuitive percentage score (e.g., `88% Match for you`) with transparent "Why this fits you" breakdowns.

---

## 8. Logging, Observability & Error Handling

- **Application Error Codes:** `AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `AI_PROVIDER_ERROR`, `AI_OUTPUT_INVALID`, `DATABASE_ERROR`, `INTERNAL_ERROR`.
- **Structured JSON Logging:** Includes timestamp, requestId, userId, route, action, duration, and status code. No secrets, credentials, or cookies are ever logged.
- **Audit Trails:** Key lifecycle actions (`USER_SIGNED_UP`, `ONBOARDING_COMPLETED`, `IDEA_CREATED`, `IDEA_PUBLISHED`, `IDEA_SAVED`, `AI_GENERATION_COMPLETED`) recorded in `audit_events`.
