import type { HTMLProps } from 'react';
import type LoadActivity from '../../lib/LoadActivity.js';
import './Loader.scss';

export function Loader({
  activity,
}: { activity: LoadActivity } & HTMLProps<HTMLDivElement>) {
  return (
    <>
      <div className="progress-bar" />
      <div className="loader">{activity.title} ...</div>
    </>
  );
}
