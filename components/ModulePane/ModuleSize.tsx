import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import type Module from '../../lib/Module.ts';
import { foreachDownstream, hasDependencies } from '../../lib/graph-util.ts';
import human from '../../lib/human.ts';
import { Section } from '../ui/Section.tsx';
import ModuleBundleSize from './ModuleBundleSize.tsx';
import * as styles from './ModulePane.module.scss';

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
      <div className={styles.sizeGrid}>
        <span>Unpacked Size (module only):</span>
        {unpackedSize ? (
          <strong>{human(unpackedSize, 'B')}</strong>
        ) : (
          <i>not available</i>
        )}
        {hasDependencies(module, dependencyTypes) && (
          <>
            <span>Unpacked Size (module + dependencies):</span>
            {unpackedSize ? (
              <strong>
                {human(unpackedSize + downstreamUnpackedSize, 'B')}
              </strong>
            ) : (
              <i>not available</i>
            )}
          </>
        )}
      </div>
      <ModuleBundleSize module={module} />
    </Section>
  );
}
