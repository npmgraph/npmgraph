import { useGlobalState } from '../../lib/GlobalStore.ts';
import { Panel } from '../ui/Panel.tsx';
import ReportPane from './ReportPane.tsx';

export default function ReportPanel() {
  const [isOpen, setOpen] = useGlobalState('isReportPanelOpen');

  return (
    <Panel
      title="Report"
      isOpen={isOpen}
      onToggle={() => {
        setOpen(!isOpen);
      }}
    >
      <ReportPane />
    </Panel>
  );
}
