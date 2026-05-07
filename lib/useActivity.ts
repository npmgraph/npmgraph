import { useEffect, useState } from 'react';
import type LoadActivity from './LoadActivity.ts';

let activity: LoadActivity;
export function setActivityForApp(ack: LoadActivity) {
  activity = ack;
}

export function useActivity() {
  const [_tick, setTick] = useState(true);
  if (!activity) throw new Error('Activity not set');

  // Use a functional update to avoid stale closure over `bool`
  useEffect(() => {
    activity.onChange = () => setTick(t => !t);
    return () => {
      activity.onChange = null;
    };
  }, []);

  return activity;
}
