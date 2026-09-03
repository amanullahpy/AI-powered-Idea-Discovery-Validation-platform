-- Migration: Seed Curated Sample Ideas
-- Phase 0: Sample Public Ideas for Discovery

DO $$
DECLARE
  cat_saas uuid;
  cat_ai uuid;
  cat_side_hustle uuid;
  cat_fyp uuid;
  cat_dev_tools uuid;
  cat_ecommerce uuid;
BEGIN
  SELECT id INTO cat_saas FROM public.categories WHERE slug = 'saas' LIMIT 1;
  SELECT id INTO cat_ai FROM public.categories WHERE slug = 'ai-products' LIMIT 1;
  SELECT id INTO cat_side_hustle FROM public.categories WHERE slug = 'side-hustles' LIMIT 1;
  SELECT id INTO cat_fyp FROM public.categories WHERE slug = 'student-fyp' LIMIT 1;
  SELECT id INTO cat_dev_tools FROM public.categories WHERE slug = 'developer-tools' LIMIT 1;
  SELECT id INTO cat_ecommerce FROM public.categories WHERE slug = 'ecommerce' LIMIT 1;

  INSERT INTO public.ideas (
    title,
    slug,
    short_description,
    description,
    problem,
    solution,
    target_audience,
    monetization,
    category_id,
    difficulty,
    estimated_cost,
    estimated_time,
    mvp_features,
    visibility,
    status,
    ai_generated,
    published_at
  )
  VALUES
    (
      'ContractLens: AI Vendor Agreement Scanner',
      'contractlens-ai-vendor-scanner',
      'Automated clause-by-clause risk auditing and hidden fee detector for SMB vendor contracts.',
      'Small businesses routinely sign SaaS, logistics, and leasing agreements with predatory auto-renewals, punitive liability caps, and hidden escalation clauses without legal counsel.',
      'Small business founders spend $500+/hr on attorney reviews or sign unvetted contracts that lock them into expensive auto-renewals.',
      'A targeted upload tool that runs LLM contract analysis to flag high-risk clauses, calculate 3-year commitment totals, and suggest standardized counter-language.',
      'SMB founders, solo operators, and agency directors managing 10+ software/vendor subscriptions.',
      '$29/contract scan or $79/mo for up to 10 scans with Slack alert integration.',
      cat_ai,
      'INTERMEDIATE',
      '$50 - $250',
      '2 - 4 weeks',
      '["PDF drag-and-drop parser", "Red-line risk scoring engine", "Auto-renewal reminder sync", "Exportable negotiation counter-proposal"]'::jsonb,
      'PUBLIC',
      'SAVED',
      true,
      now()
    ),
    (
      'PodSnippet: Micro-Audio Clipping & Distribution',
      'podsnippet-micro-audio-distribution',
      'Turn long-form podcast RSS feeds into high-converting TikTok/Reels audiograms with automated captions.',
      'Indie podcasters struggle to repurpose 60-minute audio episodes into viral vertical video clips on social media.',
      'Podcasting is inherently zero-growth without short-form visual discovery, but video editing takes 4+ hours per episode.',
      'Listen to RSS feeds, auto-detect the top 3 engaging moments using transcript sentiment, generate branded animated waveform video with subtitles.',
      'Indie podcasters, interviewers, educational content creators.',
      '$19/mo for 20 clips, $49/mo for unlimited with custom font/brand kits.',
      cat_saas,
      'INTERMEDIATE',
      '$100 - $500',
      '3 - 6 weeks',
      '["RSS episode auto-sync", "Transcript highlight picker", "Dynamic waveform generator", "Direct export to TikTok/Reels"]'::jsonb,
      'PUBLIC',
      'SAVED',
      false,
      now()
    ),
    (
      'LocalFlavors: Hyper-Local Artisan Food Directory',
      'localflavors-hyperlocal-artisan-directory',
      'Curated discovery and pre-order engine for neighborhood cottage food bakers, roasters, and sauce artisans.',
      'Artisan home bakers and sauce makers rely on clunky Instagram DMs and bank transfers to manage weekend drops.',
      'Small neighborhood food makers cannot afford commercial commissary fees or heavy DoorDash commission cuts (30%).',
      'A streamlined menu & pickup scheduler with WhatsApp notifications and zero setup fees for sellers.',
      'Neighborhood foodies, cottage kitchen cooks, farmers market sellers.',
      '5% transaction fee on processed customer pre-orders.',
      cat_side_hustle,
      'BEGINNER',
      '$0 - $50',
      '1 - 2 weeks',
      '["Maker profile storefront", "Weekly drop inventory counter", "WhatsApp order confirmations", "Cash / Stripe local checkout"]'::jsonb,
      'PUBLIC',
      'SAVED',
      false,
      now()
    ),
    (
      'CampusPeer: Verified Student Peer Tutoring Exchange',
      'campuspeer-verified-peer-tutoring',
      'Decentralized skill swap and verified grade-based tutoring marketplace for university STEM courses.',
      'University students fail gateway engineering and computer science classes while departmental TA office hours are overwhelmed.',
      'Commercial tutoring services charge $60+/hr with generic tutors unfamiliar with specific university professor syllabus and test formats.',
      'Peer-to-peer network matching students with seniors who got an A in that exact course code, backed by institutional email verification.',
      'Undergraduate college and university students.',
      '10% platform commission on tutoring sessions or monthly campus membership.',
      cat_fyp,
      'BEGINNER',
      '$0 - $50',
      '2 - 3 weeks',
      '["University .edu email verification", "Course code index", "Calendar scheduling integration", "In-app review & rating escrow"]'::jsonb,
      'PUBLIC',
      'SAVED',
      false,
      now()
    ),
    (
      'EnvVault: Zero-Leak Team Environment Variable Manager',
      'envvault-zero-leak-env-manager',
      'Lightweight CLI tool that injects encrypted environment variables into staging/production without storing secrets in CI logs.',
      'Developers accidentally commit API keys or paste production secrets into insecure Slack channels and Notion documents.',
      'Enterprise secret managers (HashiCorp Vault, AWS Secrets Manager) are overly complex for small teams of 2-10 engineers.',
      'A simple terminal tool that encrypts team `.env` files with asymmetric public keys and syncs with encrypted remote stores.',
      'Indie hackers, developer agencies, and small SaaS engineering teams.',
      'Free for solo developers, $12/team seat/month for shared organization vaults.',
      cat_dev_tools,
      'ADVANCED',
      '$50 - $200',
      '3 - 5 weeks',
      '["Cross-platform CLI tool", "End-to-end asymmetric encryption", "Audit log of secret accesses", "GitHub Actions integration"]'::jsonb,
      'PUBLIC',
      'SAVED',
      false,
      now()
    ),
    (
      'PetPacks: Curated Subscription Boxes for Senior Dogs',
      'petpacks-curated-senior-dog-care',
      'Orthopedic toys, joint-care supplements, and easy-to-digest treats tailored for dogs aged 8+.',
      'Standard subscription dog boxes are filled with cheap plastic toys that damage older dogs teeth and treats high in sodium.',
      'Senior pet owners struggle to find high-grade wellness products suited to aging dog breeds and spend heavily at vet clinics.',
      'Customized quarterly delivery based on dog age, weight, and joint health status, formulated by veterinary nutritionists.',
      'Affluent senior dog owners, veterinarians, canine rescue adopters.',
      'Direct-to-consumer recurring subscription at $45/month.',
      cat_ecommerce,
      'BEGINNER',
      '$500 - $1,000',
      '4 - 6 weeks',
      '["Pet health quiz funnel", "Subscription recurrence engine", "Custom breed packaging", "Vet-backed recommendation guide"]'::jsonb,
      'PUBLIC',
      'SAVED',
      false,
      now()
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;
