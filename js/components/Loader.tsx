import LoadActivity from '../util/LoadActivity.js';
import '/css/Components.scss';

import React, { HTMLProps } from 'react';

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
