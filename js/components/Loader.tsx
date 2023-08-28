import '/css/Components.scss';

import React, { HTMLProps } from 'react';
import { LoadActivity } from '../util.js';

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
