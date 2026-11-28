import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { foreachDownstream, hasDependencies } from '../../lib/graph-util.ts';
import type Module from '../../lib/Module.ts';
import { Section } from '../ui/Section.tsx';
import ModuleBundleSize from './ModuleBundleSize.tsx';
import { SizeBar } from './SizeBar.tsx';

export function ModuleSize({ module }: { module: Module }) {
  const [graph] = useGlobalState('graph');
  const dependencyTypes = useDependencyTypes();
  const { unpackedSize } = module;

  let downstreamUnpackedSize = 0;
  if (graph) {
    foreachDownstream(module, graph, m => {
      downstreamUnpackedSize += m.unpackedSize ?? 0;
    });
  }

  return (
    <Section title="Module Size">
      <SizeBar
        title="Unpacked size"
        size={unpackedSize}
        sizeLabel="module"
        total={
          unpackedSize && hasDependencies(module, dependencyTypes)
            ? unpackedSize + downstreamUnpackedSize
            : undefined
        }
        totalLabel="with dependencies"
      />
      <ModuleBundleSize module={module} />
    </Section>
  );
}
