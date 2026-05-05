import type { HTMLProps } from 'react';
import type LoadActivity from '../../lib/LoadActivity.ts';
import * as styles from './Loader.module.scss';

export function Loader({
  activity,
}: { activity: LoadActivity } & HTMLProps<HTMLDivElement>) {
  return (
    <>
      <div className={styles.progressBar} />
      <div className={styles.loader}>{activity.title} ...</div>
    </>
  );
}
