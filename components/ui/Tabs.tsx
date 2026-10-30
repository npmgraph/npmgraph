import type { HTMLProps } from 'react';
import { PaneType, PARAM_HIDE } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import * as utilities from './utilities.module.scss';

import { Splitter } from './Splitter.tsx';
import * as styles from './Tabs.module.scss';
import { useIsTightScreen } from '../../hooks/useIsTightScreen.ts';

export default function Tabs({ className }: HTMLProps<HTMLInputElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const isTightScreen = useIsTightScreen();
  const [hide, setHide] = useHashParam(PARAM_HIDE);
  const [isReportOnly] = useReportOnly();
  const isInspectorOpen = hide === null || isReportOnly;
  // The report-only view doesn't change the stored pane
  const currentPane = isReportOnly ? PaneType.REPORT : pane;

  const tabs = [
    {
      pane: PaneType.GRAPH,
      label: 'Graph',
      visible: isTightScreen || isReportOnly,
    },
    { pane: PaneType.INFO, label: 'Info' },
    { pane: PaneType.REPORT, label: 'Report' },
    { pane: PaneType.MODULE, label: 'Module' },
    { pane: PaneType.VIEW, label: 'View' },
  ];

  return (
    <div className={cn(styles.root, className)}>
      <div role="tablist" aria-label="Inspector panels" className={styles.list}>
        {tabs
          .filter(tab => tab.visible !== false)
          .map(({ pane: tabPane, label }) => {
            const isSelected = isInspectorOpen && currentPane === tabPane;

            return (
              <div
                key={tabPane}
                className={cn(styles.tab, {
                  [styles.active]: isSelected,
                })}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={utilities.brightHover}
                  onClick={() => {
                    setHide(null);
                    // The graph isn't a tab on wide screens, so go back to the report
                    setPane(
                      !isTightScreen && tabPane === PaneType.GRAPH
                        ? PaneType.REPORT
                        : tabPane,
                    );
                  }}
                >
                  {label}
                </button>
              </div>
            );
          })}
      </div>

      <Splitter
        isOpen={isInspectorOpen}
        onClick={() => {
          setHide(true);
        }}
      />
    </div>
  );
}
