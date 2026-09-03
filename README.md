# IdeaForge — AI-Powered Idea Discovery & Validation Platform

<div align="center">

![IdeaForge Logo](./apps/web/public/logos/ideaforge-logo.svg)

### Discover, personalize, validate, and launch high-conviction business and project ideas.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix%20Primitives-black?style=flat-square)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

[Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Database Schema](#database-schema--security) • [AI Co-pilot](#ai-co-pilot--synthesizer) • [Taxonomy](#taxonomy--categories)

</div>

---

## Executive Summary

Most software projects, side hustles, and startups fail before writing a single line of code because founders build solutions without validating customer pain, defensibility, or personal skill-market fit.

**IdeaForge** is an open-source, full-stack platform designed to guide entrepreneurs, indie makers, students, and engineers through the entire ideation lifecycle:

```text
Discover → Personalize → Brainstorm → Save → Refine → Validate → Compare → Plan → Build → Launch
```

Built upon a production-grade **Next.js 16 (App Router)** and **Supabase (PostgreSQL + RLS)** foundation, IdeaForge provides personalized recommendations, AI-powered conversational scoping, structured validation audits, and automated MVP blueprints.

---

## Features

### 1. Personalized Idea Match Engine
- **Multi-Step Onboarding Questionnaire:** Personalizes recommendations based on your technical skills, weekly time availability, capital budget, domain interests, and target markets.
- **Weighted Compatibility Scoring:** Dynamic algorithm scores every concept against your profile (`0%` to `100%` match) with transparent breakdowns of why an idea fits your background.
- **Profile Tuning:** Update your skills, budget brackets, and goals anytime via `/settings` to recalculate recommendation rankings in real time.

### 2. Extensible 15+ Idea Taxonomy
- **Database-Driven Hierarchy:** Browse and filter opportunities across 15 initial categories:
  - **SaaS** (Micro-SaaS, B2B, B2C, Vertical SaaS)
  - **AI Products** (Autonomous Agents, API Wrappers, Multi-modal tools)
  - **Mobile Apps** (iOS, Android, Cross-platform)
  - **Web Applications**
  - **Developer Tools & Infrastructure**
  - **Side Hustles & Solopreneur Ventures**
  - **Small / Local Business Automation**
  - **E-Commerce & Digital Products**
  - **Final Year Projects (FYP) & Academic Research**
  - **Workflow Automation & No-Code Systems**
- **Rich Filtering:** Filter by category, difficulty level (Beginner / Intermediate / Advanced), budget bracket, and time commitment.

### 3. Conversational AI Idea Co-Pilot
- **Multi-Turn Brainstorming:** Chat with your AI co-pilot (`/ai`) to explore niches, pivot directions, and challenge assumptions.
- **Constraint Tuning:** Instruct the AI to *"make it simpler for a solo dev"*, *"reduce timeline to 2 weeks"*, or *"shift monetization to usage-based pricing"*.
- **Structured Idea Synthesis:** Powered by Gemini AI with an integrated zero-config synthesizer fallback, returning actionable JSON specifications (MVP features, target personas, pricing tiers, and risks).
- **Direct Save to Cockpit:** One-click save from AI chats directly into your private ideas workspace.

### 4. Deep Validation Cockpit & Moat Audits
- **Validation Checklist:** Pre-populated checklists covering problem verification, willingness-to-pay signals, competitor moats, and customer acquisition channels.
- **Competitor & Risk Matrix:** Inspect existing market solutions, identify gaps, and document risk factors before investing development hours.
- **Unit Economics & Financial Estimations:** View estimated initial capital, runway requirements, target pricing, and break-even targets.

### 5. Private Workspace & Lifecycle Management
- **Full Idea Lifecycle:** Track ideas across stages: `Discovered` → `Evaluating` → `Validating` → `Building` → `Archived`.
- **Visibility Controls:** Toggle ideas between **Private** (strictly protected by Supabase RLS), **Public** (indexed in directory), and **Unlisted** (shareable via private link).
- **Side-by-Side Comparison:** Compare multiple ideas simultaneously across effort, capital, market size, and match scores.

### 6. Public Directory & SEO Pages
- **Public Showcase (`/discover`):** Fast, paginated discovery directory with real-time text search and category badges.
- **SEO-Optimized Public Pages (`/ideas/public/[slug]`):** Static and dynamic rendering with OpenGraph tags, JSON-LD schema, and social cards.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router, Server Components, Server Actions, Turbopack |
| **UI Runtime** | [React 19](https://react.dev/) | React 19 concurrent features & Suspense |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Modern utility styling via `@tailwindcss/postcss` |
| **Design System** | [shadcn/ui](https://ui.shadcn.com/) + Radix | Accessible primitives (Dialogs, Sidebars, Sheets, Toasts) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type checking end-to-end |
| **Database** | [Supabase](https://supabase.com/) | Managed PostgreSQL 15+ with strict Row Level Security (RLS) |
| **Authentication** | Supabase Auth (`@supabase/ssr`) | Email/password, Magic link, session cookie SSR resilience |
| **Server Actions** | [`next-safe-action`](https://next-safe-action.dev/) | Type-safe, Zod-validated server mutations |
| **Client State** | TanStack Query | Query caching for client-interactive views |
| **AI Engine** | Google Gemini + Fallback Synthesizer | Conversational ideation & structured schema synthesis |
| **Monorepo** | [Turborepo](https://turbo.build/) + `pnpm` | Fast monorepo pipelines (`build`, `test`, `lint`, `typecheck`) |
| **Linter / Formatter** | `oxlint` + `oxfmt` | High-performance Oxc tooling |

---

## Architecture Overview

```
AI-powered-Idea-Discovery-Validation-platform/
├── apps/
│   ├── web/                                 # Next.js 16 Web Application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (external-pages)/        # Public landing, discover, about
│   │   │   │   ├── (auth-pages)/            # Sign-in, sign-up, password recovery
│   │   │   │   ├── (app-pages)/             # Authenticated workspace shell:
│   │   │   │   │   ├── dashboard/           # Personalized home cockpit
│   │   │   │   │   ├── ai/                  # AI conversational co-pilot
│   │   │   │   │   ├── ideas/               # CRUD ideas & detail views
│   │   │   │   │   ├── saved/               # Bookmarked ideas & comparisons
│   │   │   │   │   ├── onboarding/          # Personalization wizard
│   │   │   │   │   └── settings/            # Profile preferences & answers
│   │   │   ├── components/                  # shadcn/ui & IdeaForge components
│   │   │   ├── config/                      # site.ts brand & navigation config
│   │   │   ├── data/                        # Server actions partitioned by domain:
│   │   │   │   ├── ai/                      # AI chat & synthesis actions
│   │   │   │   ├── ideas/                   # Idea CRUD & bookmarks
│   │   │   │   └── user/                    # Profiles & onboarding preferences
│   │   │   ├── lib/
│   │   │   │   ├── ai/                      # Gemini provider & local synthesizer
│   │   │   │   ├── recommendations/         # Personalization match scoring engine
│   │   │   │   └── observability/           # Structured application logger
│   │   │   └── rsc-data/                    # Server-Component-only Supabase queries
│   │   └── public/                          # Logos, favicons, static media
│   └── database/
│       └── supabase/
│           ├── migrations/                  # Versioned SQL migrations:
│           │   ├── 20260903000000_create_idea_platform_schema.sql
│           │   ├── 20260903000001_seed_initial_taxonomy.sql
│           │   └── 20260903000002_seed_sample_ideas.sql
├── docs/                                    # PRD & Implementation Task Breakdowns
├── packages/                                # Shared TypeScript configurations
├── turbo.json                               # Turborepo task definitions
└── package.json
```

---

## Database Schema & Security

IdeaForge implements strict **Row Level Security (RLS)** at the PostgreSQL layer. Data isolation is guaranteed even if application-level checks fail:

- **`categories`**, **`skills`**, **`goals`**, **`markets`**: Database-backed taxonomy; public read, service-role admin write.
- **`profiles`**: Linked directly to `auth.users.id`. Auto-created via triggers/server actions upon registration.
- **`user_preferences`**, **`user_skills`**, **`user_goals`**, **`user_markets`**: Personalization records keyed by `user_id = auth.uid()`.
- **`ideas`**:
  - `owner_id = auth.uid()` owns full read/write permissions.
  - Public ideas (`visibility = 'public'`) allow global read access.
  - Unlisted ideas (`visibility = 'unlisted'`) allow direct slug access.
- **`idea_validation_items`**: Checklists, hypotheses, and proof metrics per idea.
- **`saved_ideas`**: Bookmarks and custom user notes per idea.
- **`ai_conversations`** & **`ai_messages`**: Private AI brainstorming session histories.
- **`audit_events`**: Append-only security and activity logging.

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x+` (Node 24 supported)
- **Package Manager**: `pnpm` (version 10+)
- **Supabase**: Local CLI or hosted Supabase project

### 1. Clone & Install

```bash
git clone https://github.com/amanullahpy/AI-powered-Idea-Discovery-Validation-platform.git
cd AI-powered-Idea-Discovery-Validation-platform
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project credentials in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Google Gemini API Key for AI Co-pilot
# If omitted, IdeaForge gracefully falls back to the built-in local idea synthesizer
GEMINI_API_KEY=your_gemini_api_key_here
```

> [!TIP]
> Never commit `.env` or `.env.local` to Git. Ensure secret keys remain strictly local or in your production deployment environment secrets.

### 3. Run Database Migrations

Apply the migrations to set up the schema, RLS policies, and seed dataset:

**Option A — Hosted Supabase Project:**
```bash
pnpm supabase link --project-ref <your-project-ref>
pnpm supabase db push
```

**Option B — Local Supabase Stack:**
```bash
pnpm database#start
```

Migrations automatically seed:
1. Complete 15-category taxonomy (`20260903000001_seed_initial_taxonomy.sql`)
2. Comprehensive sample ideas with MVP blueprints (`20260903000002_seed_sample_ideas.sql`)

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## AI Co-Pilot & Synthesizer

The AI engine (`apps/web/src/lib/ai/provider.ts`) supports two operating modes:

1. **Gemini Pro Integration:** Set `GEMINI_API_KEY` to connect directly to Google Gemini for contextual, multi-turn ideation and dynamic market critique.
2. **Local Synthesizer Fallback:** If no API key is provided, the platform automatically utilizes an offline heuristic synthesizer that formats prompts into structured MVP specs without external network dependencies or API costs.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js Turbopack development server |
| `pnpm build` | Create optimized production build across monorepo |
| `pnpm test` | Run Vitest unit & integration test suite |
| `pnpm typecheck` | Run `tsc --noEmit` across all workspace packages |
| `pnpm lint` | Run `oxlint` fast static analysis |
| `pnpm gen-types` | Regenerate TypeScript types from remote Supabase schema |
| `pnpm gen-types-local` | Regenerate TypeScript types from local Supabase container |

---

## Contributing

Contributions, feedback, and feature suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

IdeaForge is distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.

<div align="center">
  <sub>Crafted with passion for builders, creators, and founders worldwide.</sub>
</div>
