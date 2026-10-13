import useCollapse from '../../hooks/useCollapse.ts';
import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { hasDependencies } from '../../lib/graph-util.ts';
import type Module from '../../lib/Module.ts';
import { getRepoUrlForModule } from '../../lib/repo-util.ts';
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
                setCollapse(
                  collapse.includes(module.name)
                    ? collapse.filter(name => name !== module.name)
                    : [...collapse, module.name],
                );
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
  const npmUrl = `https://www.npmjs.com/package/${module.name}/v/${module.version}`;
  const packageUrl = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
  const repoUrl = getRepoUrlForModule(module);
  const homepageUrl =
    module.package.homepage &&
    !module.package.homepage.startsWith('https://github.com/')
      ? module.package.homepage
      : null;

  return (
    <ButtonGroup>
      <ExternalLink href={npmUrl}>npm</ExternalLink>
      {repoUrl && <ExternalLink href={repoUrl}>repo</ExternalLink>}
      {homepageUrl && <ExternalLink href={homepageUrl}>website</ExternalLink>}
      <ExternalLink href={packageUrl}>package.json</ExternalLink>
    </ButtonGroup>
  );
}
