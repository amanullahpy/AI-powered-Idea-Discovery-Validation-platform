-- Migration: Seed Initial Taxonomy
-- Seed Categories, Skills, Goals, and Markets

-- 1. Seed Categories (15 Extensible Core Categories)
INSERT INTO public.categories (name, slug, description, icon, sort_order, is_active)
VALUES
  ('Startup', 'startup', 'High-growth, venture-scalable companies solving large market problems.', 'Rocket', 1, true),
  ('SaaS', 'saas', 'Subscription software products for B2B workflows or B2C utility.', 'Cloud', 2, true),
  ('Mobile Apps', 'mobile-apps', 'Native or cross-platform iOS and Android mobile applications.', 'Smartphone', 3, true),
  ('Web Apps', 'web-apps', 'Interactive web tools, portals, platforms, and lightweight utilities.', 'Globe', 4, true),
  ('AI Products', 'ai-products', 'Autonomous agents, workflow automations, and LLM-powered wrappers.', 'Cpu', 5, true),
  ('Side Hustles', 'side-hustles', 'Low-overhead ventures generating quick, resilient supplementary income.', 'Coins', 6, true),
  ('Small Business', 'small-business', 'Community-driven, service, retail, and local commercial ventures.', 'Store', 7, true),
  ('E-commerce', 'ecommerce', 'Digital products, direct-to-consumer brands, and niche marketplaces.', 'ShoppingBag', 8, true),
  ('Student / FYP Projects', 'student-fyp', 'Academic capstone projects, portfolio showcases, and research prototypes.', 'GraduationCap', 9, true),
  ('Research & Academic', 'research-academic', 'Data science, algorithm discovery, and deep-tech empirical studies.', 'Microscope', 10, true),
  ('Freelance & Agency', 'freelance-agency', 'Specialized consulting, design systems, and dev-as-a-service offerings.', 'Briefcase', 11, true),
  ('Content & Media', 'content-media', 'Newsletters, niche media publications, educational courses, and communities.', 'Video', 12, true),
  ('Developer Tools', 'developer-tools', 'CLI utilities, libraries, APIs, and infrastructure engineering products.', 'Terminal', 13, true),
  ('Automation & Workflows', 'automation', 'No-code pipelines, webhook connectors, and operations automations.', 'Wrench', 14, true),
  ('Hardware & Physical', 'hardware-physical', 'IoT gadgets, smart accessories, and hybrid hardware-software products.', 'Layers', 15, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- 2. Seed Skills (Tech, Business, Design, Marketing)
INSERT INTO public.skills (category, name, slug)
VALUES
  -- Technology
  ('Tech', 'JavaScript / TypeScript', 'javascript-typescript'),
  ('Tech', 'React / Next.js', 'react-nextjs'),
  ('Tech', 'Node.js / Express', 'nodejs-express'),
  ('Tech', 'Python / Django / FastAPI', 'python-fastapi'),
  ('Tech', 'Mobile (React Native / Flutter / Swift)', 'mobile-development'),
  ('Tech', 'AI / LLM Engineering & Prompting', 'ai-llm-engineering'),
  ('Tech', 'SQL & Database Architecture', 'sql-databases'),
  ('Tech', 'DevOps, Cloud & Docker', 'devops-cloud'),
  ('Tech', 'No-Code / Low-Code (Bubble, Webflow)', 'no-code-tools'),
  -- Business
  ('Business', 'Sales & B2B Outreach', 'sales-outreach'),
  ('Business', 'Product Strategy & Roadmap', 'product-management'),
  ('Business', 'Financial Modeling & Pricing', 'finance-pricing'),
  ('Business', 'Operations & Project Management', 'operations-management'),
  -- Design
  ('Design', 'UI / UX & Figma Prototyping', 'ui-ux-design'),
  ('Design', 'Brand Identity & Visual Design', 'brand-visual-design'),
  ('Design', 'Copywriting & Narrative', 'copywriting-storytelling'),
  -- Marketing
  ('Marketing', 'SEO & Organic Growth', 'seo-organic-growth'),
  ('Marketing', 'Social Media & Community Building', 'social-media-growth'),
  ('Marketing', 'Paid Ads (Meta / Google / TikTok)', 'paid-advertising'),
  ('Marketing', 'Cold Email & Lead Generation', 'cold-email-leads')
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Goals
INSERT INTO public.goals (title, description, slug)
VALUES
  ('Build a Venture-backed Startup', 'Raise funding and build a high-growth scalable enterprise.', 'venture-startup'),
  ('Launch a Bootstrapped SaaS', 'Generate profitable monthly recurring revenue (MRR).', 'bootstrapped-saas'),
  ('Create a Profitable Side Hustle', 'Generate $500–$3,000/mo alongside a primary job.', 'profitable-side-hustle'),
  ('Complete University FYP / Academic Project', 'Deliver a standout capstone project with distinction.', 'academic-fyp'),
  ('Start Freelancing or Agency Work', 'Monetize specialized design, development, or consulting skills.', 'freelancing-agency'),
  ('Build an AI Product or Tool', 'Leverage modern foundation models to solve painful workflows.', 'ai-product'),
  ('Grow an Audience or Media Brand', 'Build a targeted community, newsletter, or content brand.', 'audience-media'),
  ('Explore Ideas & Get Inspired', 'Browse high-potential trends and discover fresh opportunities.', 'get-inspired')
ON CONFLICT (slug) DO NOTHING;

-- 4. Seed Target Markets
INSERT INTO public.markets (name, code, region)
VALUES
  ('Global (All Markets)', 'GLOBAL', 'Worldwide'),
  ('United States & Canada', 'US_CA', 'North America'),
  ('Europe & United Kingdom', 'EU_UK', 'Europe'),
  ('Middle East & North Africa (MENA)', 'MENA', 'Middle East'),
  ('Pakistan', 'PK', 'South Asia'),
  ('India', 'IN', 'South Asia'),
  ('Southeast Asia (ASEAN)', 'SEA', 'Asia Pacific'),
  ('Latin America (LATAM)', 'LATAM', 'Americas'),
  ('Australia & New Zealand', 'ANZ', 'Oceania')
ON CONFLICT (code) DO NOTHING;
