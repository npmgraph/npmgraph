import useCustomModuleLinks from '../../hooks/useCustomModuleLinks.ts';
import useCollapse from '../../hooks/useCollapse.ts';
import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import { toggleItem } from '../../lib/array-util.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { hasDependencies } from '../../lib/graph-util.ts';
import type Module from '../../lib/Module.ts';
import { getRepoUrlForModule } from '../../lib/repo-util.ts';
import { parseCustomModuleLinks } from './module-links.ts';
import * as styles from './ModulePane.module.scss';
import { Button, ButtonCheckbox, ButtonGroup } from '../Button.tsx';
import { QueryLink } from '../ui/QueryLink.tsx';

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
  const [customLinks] = useCustomModuleLinks();
  const repoUrl = getRepoUrlForModule(module);
  const homepageUrl =
    module.package.homepage &&
    !module.package.homepage.startsWith('https://github.com/')
      ? module.package.homepage
      : undefined;

  return (
    <div>
      <ButtonGroup className={styles.moduleLinks}>
        {parseCustomModuleLinks(customLinks, module.name, module.version, {
          repository: repoUrl,
          homepage: homepageUrl,
        }).map(({ label, href }) => (
          <ExternalLink key={`${label}:${href}`} href={href}>
            {label}
          </ExternalLink>
        ))}
      </ButtonGroup>
    </div>
  );
}
