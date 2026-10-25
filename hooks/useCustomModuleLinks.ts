import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'npmgraph-custom-module-links';
const CHANGE_EVENT = 'npmgraph:custom-links-change';

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onChange();
    }
  };

  globalThis.addEventListener('storage', onStorage);
  globalThis.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    globalThis.removeEventListener('storage', onStorage);
    globalThis.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export default function useCustomModuleLinks() {
  const links = useSyncExternalStore(subscribe, getSnapshot, () => '');

  function setLinks(value: string) {
    localStorage.setItem(STORAGE_KEY, value);
    globalThis.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [links, setLinks] as const;
}
