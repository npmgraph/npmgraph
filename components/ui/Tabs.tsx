import type { HTMLProps } from 'react';
import { $, $$ } from 'select-dom';
import { PaneType, PARAM_HIDE } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { useIsTightScreen } from '../../hooks/useIsTightScreen.ts';
import * as utilities from './utilities.module.css';
import { Splitter } from './Splitter.tsx';
import * as styles from './Tabs.module.scss';

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

  const visibleTabs = tabs.filter(tab => tab.visible !== false);
  // Roving tabindex: only one tab is in the tab order (the first one when none is selected)
  const focusablePane = (
    visibleTabs.find(tab => isInspectorOpen && currentPane === tab.pane) ??
    visibleTabs[0]
  )?.pane;

  return (
    <div className={cn(styles.root, className)}>
      <div
        role="tablist"
        aria-label="Inspector panels"
        className={styles.list}
        onKeyDown={event => {
          const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
          if (!keys.includes(event.key)) {
            return;
          }

          const buttons = $$('[role="tab"]', event.currentTarget);
          const index = buttons.indexOf(document.activeElement as HTMLElement);
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? buttons.length - 1
                : (index +
                    (event.key === 'ArrowRight' ? 1 : -1) +
                    buttons.length) %
                  buttons.length;
          event.preventDefault();
          buttons[next]?.focus();
        }}
      >
        {visibleTabs.map(({ pane: tabPane, label }) => {
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
                id={`tab-${tabPane}`}
                aria-selected={isSelected}
                aria-controls={
                  tabPane === PaneType.GRAPH ? undefined : 'inspector'
                }
                tabIndex={tabPane === focusablePane ? 0 : -1}
                className={utilities.brightHover}
                onClick={() => {
                  // Like mobile apps, tapping the current tab scrolls to the top
                  if (isSelected && tabPane !== PaneType.GRAPH) {
                    // The page scrolls on tight screens, the inspector otherwise
                    const scroller = isTightScreen
                      ? document.documentElement
                      : $('#inspector');
                    scroller?.scrollTo({ top: 0, behavior: 'smooth' });

                    return;
                  }

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
