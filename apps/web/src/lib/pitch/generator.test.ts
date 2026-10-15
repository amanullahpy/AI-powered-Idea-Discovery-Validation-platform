import { describe, it, expect } from 'vitest';
import {
  calculateUnitEconomics,
  synthesizePitchPackage,
  exportDeckToMarkdown,
  type UnitEconomicsModel,
} from './generator';

describe('Pitch Studio Generator & Unit Economics', () => {
  describe('calculateUnitEconomics', () => {
    it('calculates healthy unit economics accurately', () => {
      const model: UnitEconomicsModel = {
        monthlyPrice: 50,
        newCustomersPerMonth: 20,
        cac: 100,
        monthlyChurnPercent: 2.5, // 2.5% churn -> LTV = 50 / 0.025 = 2000
        monthlyFixedCosts: 2000,
      };

      const result = calculateUnitEconomics(model);

      expect(result.arpu).toBe(50);
      expect(result.ltv).toBe(2000);
      expect(result.ltvCacRatio).toBe(20.0);
      expect(result.healthRating).toBe('Exceptional');
      expect(result.paybackMonths).toBe(2.0); // 100 / 50 = 2 months
      expect(result.breakEvenCustomers).toBe(40); // 2000 / 50 = 40 customers
      expect(result.projectedMonth12Arr).toBeGreaterThan(0);
      expect(result.netMarginMonth12Percent).toBeGreaterThan(0);
    });

    it('handles critical LTV:CAC ratios when CAC is high', () => {
      const model: UnitEconomicsModel = {
        monthlyPrice: 20,
        newCustomersPerMonth: 10,
        cac: 300,
        monthlyChurnPercent: 10, // LTV = 20 / 0.1 = 200, CAC = 300 -> Ratio = 0.7x
        monthlyFixedCosts: 5000,
      };

      const result = calculateUnitEconomics(model);

      expect(result.ltv).toBe(200);
      expect(result.ltvCacRatio).toBe(0.7);
      expect(result.healthRating).toBe('Critical');
      expect(result.paybackMonths).toBe(15.0);
    });

    it('safely handles zero and negative edge cases without dividing by zero', () => {
      const model: UnitEconomicsModel = {
        monthlyPrice: 0,
        newCustomersPerMonth: 0,
        cac: 0,
        monthlyChurnPercent: 0,
        monthlyFixedCosts: 0,
      };

      const result = calculateUnitEconomics(model);

      expect(result.arpu).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(result.ltv)).toBe(true);
      expect(Number.isFinite(result.ltvCacRatio)).toBe(true);
      expect(result.paybackMonths).toBe(0);
      expect(result.breakEvenCustomers).toBe(0);
    });
  });

  describe('synthesizePitchPackage', () => {
    it('generates a full 10-slide pitch deck and 1-page memo for an idea', () => {
      const idea = {
        id: 'test-idea-123',
        title: 'B2B Micro-SaaS Invoicing',
        problem: 'Freelancers lose $4,000 yearly due to late and unpaid client invoices.',
        solution: 'Automated invoice factoring and escalation bots for independent consultants.',
        target_audience: 'Freelancers, Boutique Agencies, Solopreneurs',
        monetization: 'Tiered subscription at $39/month + 1% payment processing fee',
        mvp_features: [
          'Stripe invoice syncing',
          'Automated polite reminder emails',
          'Late fee accrual engine',
          'Cash-flow analytics portal',
        ],
        difficulty: 'Intermediate',
        estimated_cost: '$800',
        estimated_time: '2-3 Weeks',
        categories: { name: 'FinTech SaaS' },
      };

      const pkg = synthesizePitchPackage(idea);

      expect(pkg.ideaId).toBe('test-idea-123');
      expect(pkg.ideaTitle).toBe('B2B Micro-SaaS Invoicing');
      expect(pkg.slides).toHaveLength(10);

      // Verify essential slides exist
      const slideTitles = pkg.slides.map((s) => s.category);
      expect(slideTitles).toContain('The Hook');
      expect(slideTitles).toContain('The Villain');
      expect(slideTitles).toContain('The Superpower');
      expect(slideTitles).toContain('The Opportunity');
      expect(slideTitles).toContain('Financial Model');
      expect(slideTitles).toContain('The Ask');

      // Verify slide details
      const problemSlide = pkg.slides.find((s) => s.slug === 'problem');
      expect(problemSlide?.bullets[0]).toContain('Freelancers lose $4,000 yearly');
      expect(problemSlide?.speakerNotes).toBeDefined();

      // Verify Memo
      expect(pkg.memo.executiveSummary).toContain('B2B Micro-SaaS Invoicing');
      expect(pkg.memo.problemStatement).toContain('Freelancers lose $4,000');
      expect(pkg.memo.targetMilestones.length).toBeGreaterThanOrEqual(4);
      expect(pkg.memo.keyRisksAndMitigations.length).toBeGreaterThanOrEqual(3);
    });

    it('falls back gracefully when optional idea fields are missing or empty', () => {
      const minimalIdea = {
        title: 'Minimal Stealth Project',
      };

      const pkg = synthesizePitchPackage(minimalIdea);

      expect(pkg.ideaTitle).toBe('Minimal Stealth Project');
      expect(pkg.slides).toHaveLength(10);
      expect(pkg.slides[0].bullets.length).toBeGreaterThan(0);
      expect(pkg.memo.executiveSummary).toBeDefined();
    });
  });

  describe('exportDeckToMarkdown', () => {
    it('produces properly formatted markdown containing all slides and the investment memo', () => {
      const pkg = synthesizePitchPackage({
        title: 'DevOps Automated Canaries',
        problem: 'Flaky releases trigger midnight outages.',
        solution: 'Automated rollback orchestrator for Kubernetes clusters.',
      });

      const md = exportDeckToMarkdown(pkg);

      expect(md).toContain('# DevOps Automated Canaries — Pitch Deck & Venture Blueprint');
      expect(md).toContain('## Slide 1: DevOps Automated Canaries [The Hook]');
      expect(md).toContain('## Slide 9: Unit Economics & 12-Month Projections [Financial Model]');
      expect(md).toContain('# 1-Page Executive Investment Memo');
      expect(md).toContain('## Executive Summary');
      expect(md).toContain('## 12-Month Target Milestones:');
    });
  });
});
