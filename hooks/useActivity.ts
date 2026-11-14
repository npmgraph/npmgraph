import { useSyncExternalStore } from 'react';
import type LoadActivity from '../lib/LoadActivity.ts';

let activity: LoadActivity;
export function setActivityForApp(ack: LoadActivity) {
  activity = ack;
}

export function getActivity() {
  return activity;
}

// Requests can start while another component renders (see `usePromise`), and React doesn't allow updating this one then
function subscribe(listener: () => void) {
  return activity.subscribe(() => {
    queueMicrotask(listener);
  });
}

const getVersion = () => activity.version;

export function useActivity() {
  if (!activity) {
    throw new Error('Activity not set');
  }

  useSyncExternalStore(subscribe, getVersion);
  return activity;
}
