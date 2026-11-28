import useCollapse from '../../hooks/useCollapse.ts';
import useCustomModuleLinks from '../../hooks/useCustomModuleLinks.ts';
import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import { toggleItem } from '../../lib/array-util.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { hasDependencies } from '../../lib/graph-util.ts';
import type Module from '../../lib/Module.ts';
import { getRepoUrlForModule } from '../../lib/repo-util.ts';
import { Button, ButtonCheckbox, ButtonGroup } from '../Button.tsx';
import { QueryLink } from '../ui/QueryLink.tsx';
import { Toolbar, ToolbarSection } from '../ui/Toolbar.tsx';
import { parseCustomModuleLinks } from './module-links.ts';

function useIsSingleEntryModule(module: Module) {
  const [graph] = useGlobalState('graph');
  return (
    graph.entryModules.size === 1 &&
    [...graph.entryModules][0]?.key === module.key
  );
}

function ModuleCollapseToggle({ module }: { module: Module }) {
  const [collapse, setCollapse] = useCollapse();
  const [graph] = useGlobalState('graph');
  const dependencyTypes = useDependencyTypes();
  const isSingleEntryModule = useIsSingleEntryModule(module);

  // Collapsing a module without dependencies only dims it
  const canCollapse = hasDependencies(
    module,
    dependencyTypes,
    graph.moduleInfos.get(module.key)?.level,
  );

  if (isSingleEntryModule || !canCollapse) {
    return null;
  }

  const isCollapsed = collapse.includes(module.name);

  return (
    <ButtonGroup>
      <ButtonCheckbox
        checked={isCollapsed}
        onChange={() => {
          setCollapse(toggleItem(collapse, module.name));
        }}
      >
        Collapse
      </ButtonCheckbox>
    </ButtonGroup>
  );
}

function getLinkContent(label: string, href: string) {
  const { hostname } = new URL(href);

  switch (label.toLowerCase()) {
    case 'website':
      return hostname === 'github.com' ? label : hostname.replace(/^www\./, '');

    default:
      return label;
  }
}

function ModuleLinkButton({
  label,
  href,
  ...props
}: { label: string; href: string } & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Button {...props} target="_blank" href={href}>
      {getLinkContent(label, href)}
    </Button>
  );
}

export function ModuleLinks({ module }: { module: Module }) {
  const [customLinks] = useCustomModuleLinks();
  const isSingleEntryModule = useIsSingleEntryModule(module);
  const repoUrl = getRepoUrlForModule(module);
  const homepageUrl =
    module.package.homepage &&
    !module.package.homepage.startsWith('https://github.com/')
      ? module.package.homepage
      : undefined;
  const links = parseCustomModuleLinks(customLinks, {
    name: module.name,
    version: module.version,
    repository: repoUrl,
    homepage: homepageUrl,
    fromRegistry: Boolean(module.packument),
  });

  return (
    <Toolbar>
      {isSingleEntryModule ? null : (
        <ToolbarSection>
          <ModuleCollapseToggle module={module} />
          {/* Opens in the current view, unlike the customizable links */}
          <QueryLink component={Button} query={module.key}>
            npmgraph
          </QueryLink>
        </ToolbarSection>
      )}
      <ToolbarSection>
        {links.map(({ label, href }) => (
          <ModuleLinkButton
            key={`${label}:${href}`}
            label={label}
            href={href}
          />
        ))}
      </ToolbarSection>
    </Toolbar>
  );
}
