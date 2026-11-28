import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { foreachDownstream, hasDependencies } from '../../lib/graph-util.ts';
import human from '../../lib/human.ts';
import type Module from '../../lib/Module.ts';
import { Section } from '../ui/Section.tsx';
import ModuleBundleSize from './ModuleBundleSize.tsx';
import { Stat, Stats } from './Stats.tsx';

const formatSize = (bytes?: number) => (bytes ? human(bytes, 'B') : <i>n/a</i>);

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
      <Stats>
        <Stat label="Unpacked">{formatSize(unpackedSize)}</Stat>
        {hasDependencies(module, dependencyTypes) && (
          <Stat label="Unpacked + deps">
            {formatSize(unpackedSize && unpackedSize + downstreamUnpackedSize)}
          </Stat>
        )}
      </Stats>
      <ModuleBundleSize module={module} />
    </Section>
  );
}
