import { useSyncExternalStore } from 'react';

export const DEFAULT_CUSTOM_MODULE_LINKS = [
  'npm, https://www.npmjs.com/package/{+name}/v/{version}',
  'repo, {repository}',
  'website, {homepage}',
  'package.json, https://cdn.jsdelivr.net/npm/{+name}@{version}/package.json',
].join('\n');

const STORAGE_KEY = 'npmgraph-module-link-providers';
const LEGACY_STORAGE_KEY = 'npmgraph-custom-module-links';
const CHANGE_EVENT = 'npmgraph:custom-links-change';

function getSnapshot() {
  const customLinks = localStorage.getItem(STORAGE_KEY);
  if (customLinks !== null) {
    return customLinks;
  }

  const legacyCustomLinks = localStorage.getItem(LEGACY_STORAGE_KEY);
  return legacyCustomLinks?.trim()
    ? `${DEFAULT_CUSTOM_MODULE_LINKS}\n${legacyCustomLinks}`
    : DEFAULT_CUSTOM_MODULE_LINKS;
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
