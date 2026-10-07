import { useEffect, useReducer } from 'react';
import type LoadActivity from '../lib/LoadActivity.ts';

let activity: LoadActivity;
export function setActivityForApp(ack: LoadActivity) {
  activity = ack;
}

export function useActivity() {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  if (!activity) {
    throw new Error('Activity not set');
  }

  useEffect(() => {
    const current = activity;
    current.onChange = rerender;
    return () => {
      if (current.onChange === rerender) {
        current.onChange = undefined;
      }
    };
  }, []);

  return activity;
}
