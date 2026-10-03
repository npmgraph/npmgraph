import { useGlobalState } from '../lib/GlobalStore.ts';
import { useQuery } from '../lib/useQuery.ts';
import * as styles from './ErrorsBanner.module.scss';

export default function ErrorsBanner() {
  const [graph] = useGlobalState('graph');
  const [query] = useQuery();
  const errors = [...graph.failedEntryModules].filter(([key]) =>
    query.includes(key),
  );

  return (
    errors.length > 0 && (
      <div className={styles.root}>
        {errors.map(([, error]) => error.message).join('; ')}
      </div>
    )
  );
}
