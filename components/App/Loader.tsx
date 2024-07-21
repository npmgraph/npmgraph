import LoadActivity from '../../lib/LoadActivity.js';
import './Loader.scss';

import React, { HTMLProps } from 'react';

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
