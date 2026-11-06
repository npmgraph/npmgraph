import simplur from 'simplur';
import { use, useState } from 'react';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import { ModuleFilterContext } from '../ModuleFilterContext.ts';
import { ModuleList } from './ModuleList.tsx';

export default function ModulesAll() {
  const { moduleInfos, entryModules } = useModuleAnalysis();
  const filter = use(ModuleFilterContext);
  // Open the section as soon as the person starts filtering
  const [isOpened, setIsOpened] = useState(false);
  if (filter && !isOpened) {
    setIsOpened(true);
  }

  if (moduleInfos.size === 0) {
    return null;
  }

  const modules = [...moduleInfos.values()]
    .map(({ module }) => module)
    .toSorted((a, b) => a.key.localeCompare(b.key));

  return (
    <ReportItem
      title="Modules"
      open={isOpened}
      count={simplur`${entryModules.size} top level, ${
        moduleInfos.size - entryModules.size
      } dependenc[y|ies]`}
    >
      <ModuleList modules={modules} entryModules={entryModules} />
    </ReportItem>
  );
}
