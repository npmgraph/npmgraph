import AlertFillIcon from 'octicons-plain-react/AlertFill';
import simplur from 'simplur';
import { cn } from '../../../lib/dom.ts';
import { ModuleRows } from '../../ui/Row.tsx';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import * as styles from './ModulesAll.module.css';

export default function ModulesAll() {
  const { moduleInfos, entryModules, weights } = useModuleAnalysis();

  if (moduleInfos.size === 0) {
    return null;
  }

  const modules = [...moduleInfos.values()]
    .map(({ module }) => module)
    .toSorted((a, b) => a.key.localeCompare(b.key));

  return (
    <ReportItem
      title="Modules"
      count={simplur`${entryModules.size} top level, ${
        moduleInfos.size - entryModules.size
      } dependenc[y|ies]`}
    >
      <ModuleRows
        modules={modules}
        bold={entryModules}
        trailing={module => {
          const weight = weights.get(module.key);
          if (!weight) {
            return null;
          }

          const dependents = [
            ...new Set(
              [...(moduleInfos.get(module.key)?.upstream ?? [])].map(
                ({ module: upstreamModule }) => upstreamModule.name,
              ),
            ),
          ].toSorted();
          const title = [
            simplur`Pulls in ${weight.pulls} module[|s]`,
            dependents.length > 0 &&
              `Required by ${dependents.slice(0, 5).join(', ')}${dependents.length > 5 ? ', …' : ''}`,
          ]
            .filter(Boolean)
            .join('. ');

          return (
            <span
              className={cn(styles.weight, { [styles.heavy]: weight.heavy })}
              title={title}
            >
              <span aria-hidden className={styles.icon}>
                {weight.heavy ? <AlertFillIcon /> : null}
              </span>
              +{weight.pulls}
            </span>
          );
        }}
      />
    </ReportItem>
  );
}
