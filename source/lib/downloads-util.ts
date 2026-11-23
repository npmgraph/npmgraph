import human from './human.ts';

export type PopularityTier = {
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  bars: number;
  label: string;
};

export function getPopularityTier(downloads: number): PopularityTier {
  if (downloads >= 100_000_000) {
    return { tier: 5, bars: 5, label: 'Superstar (100M+/wk)' };
  }

  if (downloads >= 10_000_000) {
    return { tier: 4, bars: 4, label: 'Extremely popular (10M–100M/wk)' };
  }

  if (downloads >= 1_000_000) {
    return { tier: 3, bars: 3, label: 'Very popular (1M–10M/wk)' };
  }

  if (downloads >= 100_000) {
    return { tier: 2, bars: 2, label: 'Popular (100k–1M/wk)' };
  }

  return downloads >= 10_000
    ? { tier: 1, bars: 1, label: 'Moderate (10k–100k/wk)' }
    : { tier: 0, bars: 0, label: 'Niche (<10k/wk)' };
}

export function formatWeeklyDownloads(downloads: number): string {
  const h = human(downloads, '', 2).trim();
  return h.replaceAll(/\s+/g, '');
}
