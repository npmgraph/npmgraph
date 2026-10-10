import useCollapse from '../../hooks/useCollapse.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import type Module from '../../lib/Module.ts';
import { getRepoUrlForModule } from '../../lib/repo-util.ts';
import { QueryLink } from '../ui/QueryLink.tsx';
import * as utilities from '../ui/utilities.module.scss';
import * as styles from './ModulePane.module.scss';

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a target="_blank" href={href} className={utilities.brightHover}>
      {children}
    </a>
  );
}

export function ModuleActions({ module }: { module: Module }) {
  const [collapse, setCollapse] = useCollapse();
  const [graph] = useGlobalState('graph');

  const isSingleEntryModule =
    graph.entryModules.size === 1 &&
    [...graph.entryModules][0]?.key === module.key;

  return (
    <div className={styles.linkGroup}>
      {isSingleEntryModule ? null : (
        <>
          <label>
            <input
              type="checkbox"
              checked={collapse.includes(module.name)}
              className={utilities.brightHover}
              onChange={() => {
                if (collapse.includes(module.name)) {
                  setCollapse(collapse.filter(name => name !== module.name));
                } else {
                  setCollapse([...collapse, module.name]);
                }
              }}
            />
            Collapse
          </label>
          <QueryLink
            className={utilities.brightHover}
            query={module.key}
            style={{ textDecoration: 'none' }}
          >
            Focus
          </QueryLink>
        </>
      )}
    </div>
  );
}

export function ModuleExternalLinks({ module }: { module: Module }) {
  const npmUrl = `https://www.npmjs.com/package/${module.name}/v/${module.version}`;
  const packageUrl = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
  const repoUrl = getRepoUrlForModule(module);
  const homepageUrl =
    module.package.homepage &&
    !module.package.homepage.startsWith('https://github.com/')
      ? module.package.homepage
      : null;

  return (
    <div className={styles.linkGroup}>
      <ExternalLink href={npmUrl}>npm</ExternalLink>
      {repoUrl && <ExternalLink href={repoUrl}>repo</ExternalLink>}
      {homepageUrl && <ExternalLink href={homepageUrl}>website</ExternalLink>}
      <ExternalLink href={packageUrl}>package.json</ExternalLink>
    </div>
  );
}
