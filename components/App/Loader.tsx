import type LoadActivity from '../../lib/LoadActivity.js';
import './Loader.scss';

import React, { type HTMLProps } from 'react';

export function Loader({
  activity,
}: { activity: LoadActivity } & HTMLProps<HTMLDivElement>) {
  return (
    <div className="loader">
      <div className="bg" />
      {activity.title} ...
    </div>
  );
}
