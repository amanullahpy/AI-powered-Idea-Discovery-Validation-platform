import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #090d16 0%, #18132b 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '60px 80px',
        }}
      >
        {/* Subtle background glow circle */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%)',
            top: '15px',
            left: '300px',
          }}
        />

        {/* Brand Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '999px',
            padding: '8px 20px',
            color: '#a5b4fc',
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '32px',
          }}
        >
          <span>✨</span>
          <span>AI-Powered Idea Discovery &amp; Validation</span>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '1000px',
          }}
        >
          Discover, Validate &amp; Launch Your Next Big Idea.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Personalized startup &amp; SaaS opportunities tailored to your skills, budget, and timeline.
        </div>

        {/* Bottom Feature Tags */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          {['15+ Categories', 'Match Engine', 'Validation Audits', 'MVP Blueprints'].map(
            (tag, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#c7d2fe',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
