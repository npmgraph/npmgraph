import { useSyncExternalStore } from 'react';
import useCollapse from '../../hooks/useCollapse.ts';
import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import { toggleItem } from '../../lib/array-util.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { hasDependencies } from '../../lib/graph-util.ts';
import type Module from '../../lib/Module.ts';
import { getRepoUrlForModule } from '../../lib/repo-util.ts';
import { parseCustomModuleLinks } from './module-links.ts';
import { Button, ButtonCheckbox, ButtonGroup } from '../Button.tsx';
import { QueryLink } from '../ui/QueryLink.tsx';

const CUSTOM_LINKS_STORAGE_KEY = 'npmgraph-custom-module-links';
const CUSTOM_LINKS_CHANGE_EVENT = 'npmgraph:custom-links-change';

function getCustomLinksSnapshot() {
  return localStorage.getItem(CUSTOM_LINKS_STORAGE_KEY) ?? '';
}

function subscribeToCustomLinks(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CUSTOM_LINKS_STORAGE_KEY) {
      onChange();
    }
  };

  globalThis.addEventListener('storage', onStorage);
  globalThis.addEventListener(CUSTOM_LINKS_CHANGE_EVENT, onChange);

  return () => {
    globalThis.removeEventListener('storage', onStorage);
    globalThis.removeEventListener(CUSTOM_LINKS_CHANGE_EVENT, onChange);
  };
}

function setCustomLinks(value: string) {
  localStorage.setItem(CUSTOM_LINKS_STORAGE_KEY, value);
  globalThis.dispatchEvent(new Event(CUSTOM_LINKS_CHANGE_EVENT));
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button target="_blank" href={href}>
      {children}
    </Button>
  );
}

export function ModuleActions({ module }: { module: Module }) {
  const [collapse, setCollapse] = useCollapse();
  const [graph] = useGlobalState('graph');
  const dependencyTypes = useDependencyTypes();

  // Collapsing a module without dependencies only dims it
  const canCollapse = hasDependencies(
    module,
    dependencyTypes,
    graph.moduleInfos.get(module.key)?.level,
  );

  const isSingleEntryModule =
    graph.entryModules.size === 1 &&
    [...graph.entryModules][0]?.key === module.key;

  return (
    <ButtonGroup>
      {isSingleEntryModule ? null : (
        <>
          {canCollapse && (
            <ButtonCheckbox
              checked={collapse.includes(module.name)}
              onChange={() => {
                setCollapse(toggleItem(collapse, module.name));
              }}
            >
              Collapse
            </ButtonCheckbox>
          )}
          <QueryLink component={Button} query={module.key}>
            Focus
          </QueryLink>
        </>
      )}
    </ButtonGroup>
  );
}

export function ModuleExternalLinks({ module }: { module: Module }) {
  const customLinks = useSyncExternalStore(
    subscribeToCustomLinks,
    getCustomLinksSnapshot,
    () => '',
  );
  const npmUrl = `https://www.npmjs.com/package/${module.name}/v/${module.version}`;
  const packageUrl = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
  const repoUrl = getRepoUrlForModule(module);
  const homepageUrl =
    module.package.homepage &&
    !module.package.homepage.startsWith('https://github.com/')
      ? module.package.homepage
      : null;

  return (
    <div>
      <ButtonGroup>
        <ExternalLink href={npmUrl}>npm</ExternalLink>
        {repoUrl && <ExternalLink href={repoUrl}>repo</ExternalLink>}
        {homepageUrl && <ExternalLink href={homepageUrl}>website</ExternalLink>}
        <ExternalLink href={packageUrl}>package.json</ExternalLink>
        {parseCustomModuleLinks(customLinks, module.key).map(
          ({ label, href }) => (
            <ExternalLink key={`${label}:${href}`} href={href}>
              {label}
            </ExternalLink>
          ),
        )}
      </ButtonGroup>
      <details>
        <summary>Custom links</summary>
        <label>
          One per line: label,url or label:url. Use %s for the raw package key
          or %e for its URL-encoded form.
          <textarea
            aria-label="Custom module links"
            value={customLinks}
            placeholder="npmx,https://npmx.dev/package/%s"
            rows={3}
            style={{ display: 'block', boxSizing: 'border-box', width: '100%' }}
            onChange={event => {
              setCustomLinks(event.currentTarget.value);
            }}
          />
        </label>
      </details>
    </div>
  );
}
