import { type MaintainerAnalysisState } from '../analyzers/analyzeMaintainers.ts';
import { maintainersDetails } from './maintainersDetails.tsx';
import { useMaintainerAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

function maintainersAll({
  modulesByMaintainer,
  emailByMaintainer,
}: MaintainerAnalysisState) {
  const details = maintainersDetails({
    modulesByMaintainer,
    emailByMaintainer,
  });

  if (details.length === 0) {
    return;
  }

  return {
    type: 'info',
    summary: 'Maintainers',
    count: details.length,
    details,
  } as RenderedAnalysis;
}

export default function MaintainersAll() {
  const data = useMaintainerAnalysis();

  return <ReportItem data={data} reporter={maintainersAll} />;
}
