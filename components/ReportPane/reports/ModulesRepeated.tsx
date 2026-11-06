import { getModuleKey } from '../../../lib/module-util.ts';
import { Row, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import * as styles from './ModulesRepeated.module.scss';

export default function ModulesRepeated() {
  const { moduleInfos } = useModuleAnalysis();
  const versionsByName: Record<string, string[]> = {};

  for (const { module } of moduleInfos.values()) {
    (versionsByName[module.name] ??= []).push(module.version);
  }

  const repeated = Object.entries(versionsByName)
    .filter(([, versions]) => versions.length > 1)
    .toSorted(([a], [b]) => a.localeCompare(b));

  if (repeated.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Modules with multiple versions"
      count={repeated.length}
      description={
        <>
          Module repetition is a result of incompatible version constraints, and
          may lead to increased bundle and <code>node_modules</code> directory
          size. Consider asking <em>upstream</em> module owners to update to the
          latest version or loosen the version constraint.
        </>
      }
    >
      <Rows>
        {repeated.map(([name, versions]) => (
          <Row key={name}>
            <Selectable className={styles.name} value={name} />
            {versions.map(version => (
              <Selectable
                key={version}
                label={version}
                value={getModuleKey(name, version)}
              />
            ))}
          </Row>
        ))}
      </Rows>
    </ReportItem>
  );
}
