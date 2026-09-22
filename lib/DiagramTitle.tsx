import { useQuery } from './useQuery.ts';

export function DiagramTitle({ defaultTitle }: { defaultTitle: string }) {
  const [query] = useQuery();

  return query.length === 0
    ? defaultTitle
    : `npmgraph - Dependencies for ${query.join(', ')}`;
}
