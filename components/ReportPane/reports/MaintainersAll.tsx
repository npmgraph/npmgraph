import { useMaintainerAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import { MaintainerRows } from './MaintainerRows.tsx';

export default function MaintainersAll() {
  const { modulesByMaintainer, emailByMaintainer } = useMaintainerAnalysis();

  if (modulesByMaintainer.size === 0) {
    return null;
  }

  return (
    <ReportItem title="Maintainers" count={modulesByMaintainer.size}>
      <MaintainerRows
        modulesByMaintainer={modulesByMaintainer}
        emailByMaintainer={emailByMaintainer}
      />
    </ReportItem>
  );
}
