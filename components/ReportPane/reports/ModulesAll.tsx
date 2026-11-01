import simplur from 'simplur';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import { ModuleList } from './ModuleList.tsx';

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
      <ModuleList modules={modules} entryModules={entryModules} />
    </ReportItem>
  );
}
