import { useEffect, useReducer } from 'react';
import type LoadActivity from '../lib/LoadActivity.ts';

let activity: LoadActivity;
export function setActivityForApp(ack: LoadActivity) {
  activity = ack;
}

export function getActivity() {
  return activity;
}

export function useActivity() {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  if (!activity) {
    throw new Error('Activity not set');
  }

  useEffect(() => {
    const current = activity;
    // Requests can start while another component renders (see `usePromise`), and React doesn't allow updating this one then
    const onChange = () => {
      queueMicrotask(rerender);
    };

    current.onChange = onChange;
    return () => {
      if (current.onChange === onChange) {
        current.onChange = undefined;
      }
    };
  }, []);

  return activity;
}
