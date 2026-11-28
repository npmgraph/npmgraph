import { describe, expect, it } from 'vitest';
import { formatWeeklyDownloads, getPopularityTier } from './downloads-util.ts';

describe('formatWeeklyDownloads', () => {
  it('formats large numbers cleanly with compact units', () => {
    expect(formatWeeklyDownloads(157_124_978)).toBe('157 million');
    expect(formatWeeklyDownloads(25_000_000)).toBe('25 million');
    expect(formatWeeklyDownloads(6_871_891)).toBe('6.9 million');
    expect(formatWeeklyDownloads(1_500_000)).toBe('1.5 million');
  });

  it('formats thousands cleanly', () => {
    expect(formatWeeklyDownloads(450_000)).toBe('450 thousand');
    expect(formatWeeklyDownloads(25_000)).toBe('25 thousand');
    expect(formatWeeklyDownloads(11_040)).toBe('11 thousand');
  });

  it('formats small download counts', () => {
    expect(formatWeeklyDownloads(777)).toBe('777');
    expect(formatWeeklyDownloads(0)).toBe('0');
  });
});

describe('getPopularityTier', () => {
  it('identifies top tier / superstar packages (100M+/wk)', () => {
    const tier = getPopularityTier(150_000_000);
    expect(tier.tier).toBe(5);
    expect(tier.bars).toBe(5);
    expect(tier.label).toContain('Superstar');
  });

  it('identifies extremely popular packages (10M–100M/wk)', () => {
    const tier = getPopularityTier(25_000_000);
    expect(tier.tier).toBe(4);
    expect(tier.bars).toBe(4);
  });

  it('identifies very popular packages (1M–10M/wk)', () => {
    const tier = getPopularityTier(6_000_000);
    expect(tier.tier).toBe(3);
    expect(tier.bars).toBe(3);
  });

  it('identifies popular packages (100k–1M/wk)', () => {
    const tier = getPopularityTier(500_000);
    expect(tier.tier).toBe(2);
    expect(tier.bars).toBe(2);
  });

  it('identifies moderate packages (10k–100k/wk)', () => {
    const tier = getPopularityTier(25_000);
    expect(tier.tier).toBe(1);
    expect(tier.bars).toBe(1);
  });

  it('identifies niche/low download packages (<10k/wk)', () => {
    const tier = getPopularityTier(500);
    expect(tier.tier).toBe(0);
    expect(tier.bars).toBe(0);
  });
});
