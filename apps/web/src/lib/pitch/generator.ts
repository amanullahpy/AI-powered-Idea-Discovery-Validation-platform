export interface PitchSlide {
  id: number;
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  bullets: string[];
  metrics?: { label: string; value: string; hint?: string }[];
  speakerNotes: string;
}

export interface UnitEconomicsModel {
  monthlyPrice: number;
  newCustomersPerMonth: number;
  cac: number;
  monthlyChurnPercent: number;
  monthlyFixedCosts: number;
}

export interface ComputedUnitEconomics {
  arpu: number;
  ltv: number;
  ltvCacRatio: number;
  healthRating: 'Critical' | 'Cautious' | 'Healthy' | 'Exceptional';
  paybackMonths: number;
  breakEvenCustomers: number;
  projectedMonth6Mrr: number;
  projectedMonth12Mrr: number;
  projectedMonth12Arr: number;
  netMarginMonth12Percent: number;
}

export interface InvestmentMemo {
  executiveSummary: string;
  problemStatement: string;
  solutionAndValueProp: string;
  marketSizingTAM: string;
  businessModelAndPricing: string;
  competitiveMoat: string;
  targetMilestones: string[];
  keyRisksAndMitigations: string[];
}

export interface GeneratedPitchPackage {
  ideaId?: string;
  ideaTitle: string;
  slides: PitchSlide[];
  memo: InvestmentMemo;
  unitEconomics: UnitEconomicsModel;
}

export interface PitchIdeaInput {
  id?: string;
  title: string;
  problem?: string | null;
  solution?: string | null;
  target_audience?: string | null;
  monetization?: string | null;
  mvp_features?: string[] | null;
  estimated_cost?: string | null;
  estimated_time?: string | null;
  difficulty?: string | null;
  categories?: { name: string } | null;
}

export function calculateUnitEconomics(model: UnitEconomicsModel): ComputedUnitEconomics {
  const arpu = model.monthlyPrice !== undefined && !Number.isNaN(Number(model.monthlyPrice))
    ? Math.max(0, Number(model.monthlyPrice))
    : 29;
  const newPerMonth = model.newCustomersPerMonth !== undefined && !Number.isNaN(Number(model.newCustomersPerMonth))
    ? Math.max(0, Number(model.newCustomersPerMonth))
    : 10;
  const cac = model.cac !== undefined && !Number.isNaN(Number(model.cac))
    ? Math.max(0, Number(model.cac))
    : 50;
  const rawChurn = model.monthlyChurnPercent !== undefined && !Number.isNaN(Number(model.monthlyChurnPercent))
    ? Math.max(0.1, Math.min(100, Number(model.monthlyChurnPercent)))
    : 3.5;
  const churnRate = rawChurn / 100;
  const fixedCosts = model.monthlyFixedCosts !== undefined && !Number.isNaN(Number(model.monthlyFixedCosts))
    ? Math.max(0, Number(model.monthlyFixedCosts))
    : 1000;

  // LTV = ARPU / Churn Rate
  const ltv = churnRate > 0 ? Math.round(arpu / churnRate) : 0;

  // LTV:CAC Ratio
  const ltvCacRatio = cac > 0 ? Number((ltv / cac).toFixed(1)) : (ltv > 0 ? 10 : 0);

  let healthRating: 'Critical' | 'Cautious' | 'Healthy' | 'Exceptional' = 'Healthy';
  if (ltvCacRatio < 1.5) {
    healthRating = 'Critical';
  } else if (ltvCacRatio < 3.0) {
    healthRating = 'Cautious';
  } else if (ltvCacRatio < 5.0) {
    healthRating = 'Healthy';
  } else {
    healthRating = 'Exceptional';
  }

  // Payback period (months) = CAC / ARPU
  const paybackMonths = arpu > 0 ? Number((cac / arpu).toFixed(1)) : 0;

  // Break-even customer count
  const breakEvenCustomers = arpu > 0 ? Math.ceil(fixedCosts / arpu) : 0;

  // Dynamic MRR progression with churn
  let activeCustomers = 0;
  let month6Customers = 0;
  let month12Customers = 0;

  for (let m = 1; m <= 12; m++) {
    activeCustomers = Math.round(activeCustomers * (1 - churnRate)) + newPerMonth;
    if (m === 6) month6Customers = activeCustomers;
    if (m === 12) month12Customers = activeCustomers;
  }

  const projectedMonth6Mrr = month6Customers * arpu;
  const projectedMonth12Mrr = month12Customers * arpu;
  const projectedMonth12Arr = projectedMonth12Mrr * 12;

  // Monthly revenue at month 12 vs (fixed costs + acquisition costs for new cohorts)
  const totalMonth12Costs = fixedCosts + newPerMonth * cac;
  const netMarginMonth12Percent =
    projectedMonth12Mrr > 0
      ? Math.round(((projectedMonth12Mrr - totalMonth12Costs) / projectedMonth12Mrr) * 100)
      : 0;

  return {
    arpu,
    ltv,
    ltvCacRatio,
    healthRating,
    paybackMonths,
    breakEvenCustomers,
    projectedMonth6Mrr,
    projectedMonth12Mrr,
    projectedMonth12Arr,
    netMarginMonth12Percent,
  };
}

export function synthesizePitchPackage(idea: PitchIdeaInput): GeneratedPitchPackage {
  const categoryName = idea.categories?.name || 'Technology Venture';
  const rawFeatures = Array.isArray(idea.mvp_features) && idea.mvp_features.length > 0
    ? idea.mvp_features
    : [
        'Core self-service workflow automation',
        'Intuitive real-time analytics & reporting dashboard',
        'Stripe billing integration with subscription tiers',
        'Team collaboration & permission controls',
      ];

  const defaultUnitEconomics: UnitEconomicsModel = {
    monthlyPrice: 49,
    newCustomersPerMonth: 20,
    cac: 95,
    monthlyChurnPercent: 3.2,
    monthlyFixedCosts: 1800,
  };

  const calculated = calculateUnitEconomics(defaultUnitEconomics);

  const slides: PitchSlide[] = [
    {
      id: 1,
      slug: 'vision',
      category: 'The Hook',
      title: idea.title,
      subtitle: `A high-conviction ${categoryName.toLowerCase()} platform solving acute workflow friction.`,
      bullets: [
        `Purpose-built for modern operators and high-leverage teams in ${categoryName}.`,
        'Eliminating manual fragmentation through intelligent, end-to-end automation.',
        `Targeting a fast-growing market category with built-in product-led distribution.`,
      ],
      metrics: [
        { label: 'Category', value: categoryName },
        { label: 'Stage', value: 'Seed / Early Validation' },
        { label: 'Target Launch', value: idea.estimated_time || '3-4 Weeks' },
      ],
      speakerNotes: `Hook the room immediately: "${idea.title} solves a painful bottleneck in the ${categoryName} space. We are turning multi-hour manual processes into seamless workflows."`,
    },
    {
      id: 2,
      slug: 'problem',
      category: 'The Villain',
      title: 'The Acute Customer Pain',
      subtitle: 'Legacy tools and manual workarounds are costing founders and teams hundreds of hours.',
      bullets: [
        idea.problem || 'Operators spend over 15+ hours weekly juggling disconnected tools and manual spreadsheets.',
        'High error rates and delayed execution lead directly to lost revenue and customer dissatisfaction.',
        'Existing enterprise solutions are bloated, overpriced, and require months of onboarding.',
      ],
      metrics: [
        { label: 'Wasted Time', value: '15+ hrs/week' },
        { label: 'Pain Urgency', value: '8.8 / 10' },
        { label: 'Dissatisfaction', value: '74% with incumbents' },
      ],
      speakerNotes: 'Make the pain tangible. Highlight that buyers are already paying for makeshift solutions or losing money because of this friction.',
    },
    {
      id: 3,
      slug: 'solution',
      category: 'The Superpower',
      title: 'Our Solution & Unfair Advantage',
      subtitle: 'A streamlined, intelligent system built for instant time-to-value.',
      bullets: [
        idea.solution || 'A lightweight, automated platform providing real-time visibility, automated task dispatch, and smart recommendations.',
        'Zero-friction onboarding: users achieve their primary job-to-be-done in under 5 minutes.',
        'Modular architecture designed for rapid feature iteration and seamless ecosystem integrations.',
      ],
      metrics: [
        { label: 'Time-to-Value', value: '< 5 Minutes' },
        { label: 'Friction Reduction', value: '80%' },
        { label: 'Defensibility', value: 'Proprietary Workflow Data' },
      ],
      speakerNotes: 'Focus on the contrast: while legacy incumbents are heavy and fragmented, our platform delivers value instantly on day one.',
    },
    {
      id: 4,
      slug: 'market',
      category: 'The Opportunity',
      title: 'Total Addressable Market Sizing',
      subtitle: 'Capitalizing on an expanding global market with strong secular tailwinds.',
      bullets: [
        'Total Addressable Market (TAM): Global software spend in this vertical reaches $14.2B.',
        'Serviceable Available Market (SAM): Digital-first SMBs and modern teams representing $2.8B.',
        'Serviceable Obtainable Market (SOM): Targeting 2,500 active subscriptions in Year 1-2 ($1.5M ARR).',
      ],
      metrics: [
        { label: 'TAM', value: '$14.2B' },
        { label: 'SAM', value: '$2.8B' },
        { label: 'SOM (Year 2)', value: '$1.5M ARR' },
      ],
      speakerNotes: 'Walk investors through the bottom-up math. We do not need 1% of the entire globe; winning our focused beachhead generates high-margin cash flow.',
    },
    {
      id: 5,
      slug: 'product',
      category: 'Product & MVP',
      title: 'Product Scope & Architecture',
      subtitle: 'Laser-focused on high-retention core features with rock-solid reliability.',
      bullets: rawFeatures.slice(0, 4),
      metrics: [
        { label: 'Tech Stack', value: 'Next.js 16 + Supabase' },
        { label: 'Est. Build Budget', value: idea.estimated_cost || '$500 - $1,500' },
        { label: 'Deployment', value: 'Vercel + Edge DB' },
      ],
      speakerNotes: 'Highlight our lean development philosophy. We have scoped down the MVP strictly to features that directly prove willingness to pay.',
    },
    {
      id: 6,
      slug: 'business-model',
      category: 'Monetization',
      title: 'Business Model & Pricing Tiers',
      subtitle: 'Transparent recurring subscriptions with scalable usage-based expansion.',
      bullets: [
        idea.monetization || 'Tiered SaaS pricing: Starter ($29/mo), Pro ($49/mo), and Enterprise ($149/mo).',
        'Expansion revenue driven by usage volume, team seats, and advanced automation triggers.',
        'High gross margins (85%+) typical of modern cloud and serverless software architecture.',
      ],
      metrics: [
        { label: 'Target ARPU', value: `$${calculated.arpu}/mo` },
        { label: 'Gross Margin', value: '85%+' },
        { label: 'Billing Model', value: 'Annual & Monthly Subscriptions' },
      ],
      speakerNotes: 'Explain how the pricing model aligns with customer value. As customer workflow throughput grows, our subscription expands automatically.',
    },
    {
      id: 7,
      slug: 'gtm',
      category: 'Go-To-Market',
      title: 'Acquisition & Distribution Flywheel',
      subtitle: 'Direct founder-led outreach paired with organic content loops.',
      bullets: [
        'Beachhead Strategy: Niche community launches (ProductHunt, specialized subreddits, founder discords).',
        'Cold Outbound & Value Drops: Targeted LinkedIn/Email outreach sharing benchmark reports.',
        'Viral Product Loops: Public shareable artifacts and watermarked reports driving organic referral signups.',
      ],
      metrics: [
        { label: 'Channel 1', value: 'Niche Community Drops' },
        { label: 'Channel 2', value: 'Product-Led Public Links' },
        { label: 'Target CAC', value: `$${calculated.paybackMonths > 0 ? (calculated.arpu * calculated.paybackMonths).toFixed(0) : '95'}` },
      ],
      speakerNotes: 'Show that we have a concrete distribution plan, not just a build-and-pray assumption. We acquire our first 100 paying customers through direct outreach.',
    },
    {
      id: 8,
      slug: 'competition',
      category: 'Defensibility',
      title: 'Competitive Moat & Asymmetric Advantage',
      subtitle: 'Why incumbents are too sluggish to compete and how we protect our margin.',
      bullets: [
        'Incumbents are constrained by legacy technical debt, bloated feature sets, and enterprise pricing.',
        'Our asymmetric advantage: 10x faster setup time, bespoke vertical customization, and modern UX.',
        'Workflow lock-in: High switching costs created by proprietary templates and integrated historical data.',
      ],
      metrics: [
        { label: 'Speed Advantage', value: '10x Faster Deploy' },
        { label: 'Cost Advantage', value: '60% More Cost-Effective' },
        { label: 'Data Moat', value: 'Bespoke Validation Insights' },
      ],
      speakerNotes: 'Defend why a giant like Salesforce or HubSpot will not crush us: we are serving a focused vertical they deem too small, but which is highly lucrative for us.',
    },
    {
      id: 9,
      slug: 'unit-economics',
      category: 'Financial Model',
      title: 'Unit Economics & 12-Month Projections',
      subtitle: `Demonstrating disciplined capital efficiency and a sustainable ${calculated.healthRating} LTV:CAC profile.`,
      bullets: [
        `Customer Lifetime Value (LTV): $${calculated.ltv} based on $${calculated.arpu}/mo ARPU and ${defaultUnitEconomics.monthlyChurnPercent}% churn.`,
        `Estimated Customer Acquisition Cost (CAC): $${defaultUnitEconomics.cac} with a ${calculated.paybackMonths}-month payback.`,
        `12-Month Run-Rate: Projected ${calculated.projectedMonth12Arr.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} ARR at month 12.`,
      ],
      metrics: [
        { label: 'LTV : CAC', value: `${calculated.ltvCacRatio}x (${calculated.healthRating})` },
        { label: 'CAC Payback', value: `${calculated.paybackMonths} Months` },
        { label: '12-Mo ARR Projection', value: calculated.projectedMonth12Arr.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) },
      ],
      speakerNotes: 'These unit economics prove that every dollar invested in acquisition yields predictable, compounding returns with short payback cycles.',
    },
    {
      id: 10,
      slug: 'the-ask',
      category: 'The Ask',
      title: 'The Ask & Next 12-Month Milestones',
      subtitle: 'Clear execution milestones to scale from validated pilot to profitable category leader.',
      bullets: [
        'Milestone 1: Complete private beta with 20 design partners and achieve 40%+ 4-week retention.',
        'Milestone 2: Launch self-serve billing, scale to 250 paying teams, and hit $12k MRR.',
        'Milestone 3: Expand integrations ecosystem, release enterprise team tier, and reach break-even profitability.',
      ],
      metrics: [
        { label: 'Capital Target', value: '$150k Seed / Angel (or Bootstrapped)' },
        { label: 'Runway', value: '14 Months to Profitability' },
        { label: 'Core KPI', value: '40%+ MoM Active Usage' },
      ],
      speakerNotes: 'Close with clarity and urgency. Summarize the capital or time required and exactly what tangible milestones will be unlocked.',
    },
  ];

  const memo: InvestmentMemo = {
    executiveSummary: `${idea.title} is an early-stage ${categoryName.toLowerCase()} initiative targeting modern operators experiencing severe execution friction. By offering an integrated, frictionless workflow platform, ${idea.title} captures high-intent demand with rapid time-to-value.`,
    problemStatement: idea.problem || 'Target users currently waste 15+ hours per week navigating fragmented legacy solutions, suffering from high error rates and lack of centralized visibility.',
    solutionAndValueProp: idea.solution || 'A modern, lightweight automation suite delivering immediate operational leverage, transparent reporting, and self-service deployment in under 5 minutes.',
    marketSizingTAM: 'The global market for vertical productivity software in this category exceeds $14.2B, with a $2.8B addressable segment among digital-native SMBs.',
    businessModelAndPricing: idea.monetization || `SaaS subscription with a target ARPU of $${calculated.arpu}/month, expanding via seat licenses and API throughput. Projected 85%+ gross software margins.`,
    competitiveMoat: 'Asymmetric positioning against slow enterprise incumbents through superior UX, modern tech stack resilience, and deeply integrated vertical workflows.',
    targetMilestones: [
      '30 Days: Deploy core MVP and complete 10 customer validation discovery sessions.',
      '90 Days: Onboard first 50 paying customers; optimize self-service conversion funnel.',
      '180 Days: Reach $10,000 MRR with sub-3.5% monthly churn and 3.5x+ LTV:CAC.',
      '365 Days: Achieve cashflow break-even with over 200 active enterprise and SMB accounts.',
    ],
    keyRisksAndMitigations: [
      'Customer Acquisition Saturation: Mitigated via product-led viral artifacts and proprietary benchmark reports.',
      'Platform Feature Creep: Mitigated via strict 2-week agile sprint scoping around verified user pain points.',
      'Incumbent Response: Incumbents are hindered by enterprise contracts and lack incentive to serve this nimble beachhead.',
    ],
  };

  return {
    ideaId: idea.id,
    ideaTitle: idea.title,
    slides,
    memo,
    unitEconomics: defaultUnitEconomics,
  };
}

export function exportDeckToMarkdown(pkg: GeneratedPitchPackage): string {
  const parts: string[] = [];

  parts.push(`# ${pkg.ideaTitle} — Pitch Deck & Venture Blueprint`);
  parts.push(`Generated by IdeaForge Pitch Studio\n`);

  pkg.slides.forEach((slide) => {
    parts.push(`---`);
    parts.push(`## Slide ${slide.id}: ${slide.title} [${slide.category}]`);
    parts.push(`*${slide.subtitle}*\n`);

    parts.push(`### Key Takeaways:`);
    slide.bullets.forEach((b) => {
      parts.push(`- ${b}`);
    });

    if (slide.metrics && slide.metrics.length > 0) {
      parts.push(`\n### Key Metrics:`);
      slide.metrics.forEach((m) => {
        parts.push(`- **${m.label}:** ${m.value}`);
      });
    }

    parts.push(`\n> **Speaker Notes:** ${slide.speakerNotes}\n`);
  });

  parts.push(`\n---\n# 1-Page Executive Investment Memo\n`);
  parts.push(`## Executive Summary\n${pkg.memo.executiveSummary}\n`);
  parts.push(`## Problem Statement\n${pkg.memo.problemStatement}\n`);
  parts.push(`## Solution & Value Proposition\n${pkg.memo.solutionAndValueProp}\n`);
  parts.push(`## Market Opportunity (TAM/SAM/SOM)\n${pkg.memo.marketSizingTAM}\n`);
  parts.push(`## Business Model & Economics\n${pkg.memo.businessModelAndPricing}\n`);
  parts.push(`## Competitive Advantage & Defensibility\n${pkg.memo.competitiveMoat}\n`);

  parts.push(`## 12-Month Target Milestones:`);
  pkg.memo.targetMilestones.forEach((m) => parts.push(`- ${m}`));

  parts.push(`\n## Key Risks & Mitigations:`);
  pkg.memo.keyRisksAndMitigations.forEach((r) => parts.push(`- ${r}`));

  return parts.join('\n');
}
