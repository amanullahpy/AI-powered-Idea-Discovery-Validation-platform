import { describe, expect, it } from 'vitest';
import { generateIdeaMarkdown } from './idea-exporter';

describe('generateIdeaMarkdown', () => {
  it('generates a clean markdown string from idea properties', () => {
    const sampleIdea = {
      title: 'DevGuard: Realtime Secret Scanner',
      short_description: 'CLI tool preventing API keys in Git commits.',
      problem: 'Engineers commit production API keys by accident.',
      solution: 'Local git pre-commit hook that analyzes entropy and entropy patterns.',
      target_audience: 'Software engineering teams and solo devs',
      monetization: '$10/developer/month',
      difficulty: 'INTERMEDIATE',
      estimated_cost: '$50 - $200',
      estimated_time: '2 - 3 weeks',
      mvp_features: ['CLI scanner', 'Pre-commit hook', 'Slack alert webhook'],
    };

    const md = generateIdeaMarkdown(sampleIdea);

    expect(md).toContain('# DevGuard: Realtime Secret Scanner');
    expect(md).toContain('> CLI tool preventing API keys in Git commits.');
    expect(md).toContain('## 🛑 Problem Statement');
    expect(md).toContain('Engineers commit production API keys by accident.');
    expect(md).toContain('## 💡 Proposed Solution');
    expect(md).toContain('## 🚀 MVP Features (Phase 1)');
    expect(md).toContain('- [ ] CLI scanner');
    expect(md).toContain('- [ ] Pre-commit hook');
    expect(md).toContain('- [ ] Slack alert webhook');
  });

  it('handles partial or missing fields gracefully', () => {
    const partialIdea = {
      title: 'Simple Note App',
    };

    const md = generateIdeaMarkdown(partialIdea);
    expect(md).toContain('# Simple Note App');
    expect(md).toContain('Not specified');
    expect(md).toContain('No problem statement documented.');
  });
});
