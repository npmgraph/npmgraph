import { useQuery } from './useQuery.ts';

export function DiagramTitle({ defaultTitle }: { defaultTitle: string }) {
  const [query] = useQuery();

  if (query.length === 0) return defaultTitle;
  return `npmgraph - Dependencies for ${query.join(', ')}`;
}
