import { useEffect } from 'react';
import { hideLinkStatusAfterClick } from '../lib/hide-link-status.ts';

export default function useHideLinkStatus() {
  useEffect(hideLinkStatusAfterClick, []);
}
