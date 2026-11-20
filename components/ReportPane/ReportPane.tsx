import ShareIcon from 'octicons-plain-react/Share';
import ScreenFullIcon from 'octicons-plain-react/ScreenFull';
import ScreenNormalIcon from 'octicons-plain-react/ScreenNormal';
import useGraph from '../../hooks/useGraph.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { cn } from '../../lib/dom.ts';
import { flashError } from '../../lib/flash.ts';
import { Button } from '../Button.tsx';
import { Pane } from '../ui/Pane.tsx';
import AnalysisProvider from './analyzers/AnalysisProvider.tsx';
import CollapsedModules from './CollapsedModules.tsx';
import * as styles from './ReportPane.module.scss';
import Licenses from './reports/Licenses.tsx';
import MaintainersAll from './reports/MaintainersAll.tsx';
import MaintainersSolo from './reports/MaintainersSolo.tsx';
import ModuleReplacementsNative from './reports/ModuleReplacementsNative.tsx';
import ModuleVulnerabilities from './reports/ModuleVulnerabilities.tsx';
import ModulesAll from './reports/ModulesAll.tsx';
import ModulesDeprecated from './reports/ModulesDeprecated.tsx';
import ModulesOutdated from './reports/ModulesOutdated.tsx';
import ModulesRepeated from './reports/ModulesRepeated.tsx';
import PeerDependenciesAll from './reports/PeerDependenciesAll.tsx';
import PeerDependenciesMissing from './reports/PeerDependenciesMissing.tsx';

async function share() {
  try {
    await navigator.share({ title: document.title, url: location.href });
  } catch (error) {
    // Dismissing the share sheet rejects with an `AbortError`
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      flashError(error);
    }
  }
}

export default function ReportPane({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const graph = useGraph();
  const [isReportOnly, setReportOnly] = useReportOnly();

  if (!graph.moduleInfos) {
    return <div>Loading</div>;
  }

  if (graph.moduleInfos.size === 0) {
    return (
      <Pane centered className={className} {...props}>
        <p>No modules to report on.</p>
      </Pane>
    );
  }

  return (
    <Pane
      className={cn(className, { [styles.document]: isReportOnly })}
      {...props}
    >
      <div className={styles.toolbar}>
        {isReportOnly ? (
          <div className={styles.actions}>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                onClick={() => {
                  void share();
                }}
              >
                Share
                <ShareIcon />
              </Button>
            )}
            <Button
              onClick={() => {
                setReportOnly(false);
              }}
            >
              Close
              <ScreenNormalIcon />
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.description}>
              You can view a shareable report without the graph
            </div>
            <Button
              onClick={() => {
                setReportOnly(true);
              }}
            >
              Expand
              <ScreenFullIcon />
            </Button>
          </>
        )}
      </div>
      {!isReportOnly && <CollapsedModules />}
      <AnalysisProvider>
        <ModulesAll />
        <PeerDependenciesAll />
        <MaintainersAll />
        <Licenses />

        <ModuleVulnerabilities />
        <ModulesDeprecated />
        <ModulesOutdated />
        <ModulesRepeated />
        <PeerDependenciesMissing />
        <MaintainersSolo />
        <ModuleReplacementsNative />
      </AnalysisProvider>
    </Pane>
  );
}
