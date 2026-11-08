import simplur from 'simplur';
import { ModuleRows } from '../../ui/Row.tsx';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

export default function ModulesAll() {
  const { moduleInfos, entryModules } = useModuleAnalysis();

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
      <ModuleRows modules={modules} bold={entryModules} />
    </ReportItem>
  );
}
