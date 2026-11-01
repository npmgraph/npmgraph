import { useGlobalState } from '../lib/GlobalStore.ts';

export default function useGraph() {
  return useGlobalState('graph')[0];
}
