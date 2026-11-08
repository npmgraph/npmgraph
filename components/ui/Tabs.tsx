import type { HTMLProps } from 'react';
import { $ } from 'select-dom';
import { PaneType, PARAM_HIDE } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import useTab, { selectTab } from '../../hooks/useTab.ts';
import { useIsTightScreen } from '../../hooks/useIsTightScreen.ts';
import * as utilities from './utilities.module.css';
import { Splitter } from './Splitter.tsx';
import * as styles from './Tabs.module.scss';

export default function Tabs({ className }: HTMLProps<HTMLInputElement>) {
  const pane = useTab();
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
                    // Like mobile apps, tapping the current tab scrolls to the top
                    if (isSelected && tabPane !== PaneType.GRAPH) {
                      // The page scrolls on tight screens, the inspector otherwise
                      const scroller = isTightScreen
                        ? document.documentElement
                        : $('#inspector');
                      scroller?.scrollTo({
                        top: 0,
                        behavior: matchMedia('(prefers-reduced-motion)').matches
                          ? 'instant'
                          : 'smooth',
                      });

                      return;
                    }

                    selectTab(tabPane);
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
