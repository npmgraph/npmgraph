import simplur from 'simplur';
import { type ModuleAnalysisState } from '../analyzers/analyzeModules.ts';
import { ModuleList } from './ModuleList.tsx';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import useReport from '../useReport.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

function modulesAll({ moduleInfos, entryModules }: ModuleAnalysisState) {
  if (moduleInfos.size === 0) {
    return;
  }

  const modules = [...moduleInfos.values()]
    .map(({ module }) => module)
    .toSorted((a, b) => a.key.localeCompare(b.key));
  const details = [
    <ModuleList key="modules" modules={modules} entryModules={entryModules} />,
  ];

  const count = simplur`${entryModules.size} top level, ${
    moduleInfos.size - entryModules.size
  } dependenc[y|ies]`;

  return {
    type: 'info',
    summary: 'Modules',
    count,
    details,
  } as RenderedAnalysis;
}

export default function ModulesAll() {
  const report = useReport(useModuleAnalysis(), modulesAll);

  return <ReportItem report={report} />;
}
