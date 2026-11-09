import type { HTMLProps } from 'react';
import type LoadActivity from '../../lib/LoadActivity.ts';
import * as styles from './Loader.module.css';

export function Loader({
  activity,
}: { activity: LoadActivity } & HTMLProps<HTMLDivElement>) {
  return (
    <>
      <div className={styles.progressBar} />
      <div className={styles.loader} role="status">
        {activity.title} ...
      </div>
    </>
  );
}
