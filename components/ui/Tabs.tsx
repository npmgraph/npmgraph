import type { HTMLProps } from 'react';
import { PaneType, PARAM_HIDE, type PaneTypes } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { cn, getScroller } from '../../lib/dom.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { useTab } from '../../hooks/useTab.ts';
import { useIsTightScreen } from '../../hooks/useIsTightScreen.ts';
import * as utilities from './utilities.module.css';
import { Splitter } from './Splitter.tsx';
import * as styles from './Tabs.module.scss';

const GRAPH = 'graph';

export default function Tabs({ className }: HTMLProps<HTMLInputElement>) {
  const [tab, selectTab] = useTab();
  const [isGraphVisible, setGraphVisible] = useGlobalState('isGraphVisible');
  const isTightScreen = useIsTightScreen();
  const [hide, setHide] = useHashParam(PARAM_HIDE);
  const [isReportOnly] = useReportOnly();
  const isInspectorOpen = hide === null || isReportOnly;
  // The report-only view doesn't change the selected tab
  const currentTab = isReportOnly ? PaneType.REPORT : tab;
  const isGraphShown = isTightScreen && isGraphVisible && !isReportOnly;

  // The graph isn't a tab, it's a view that takes turns with the inspector
  const tabs: Array<{
    id: PaneTypes | typeof GRAPH;
    label: string;
    visible?: boolean;
  }> = [
    { id: GRAPH, label: 'Graph', visible: isTightScreen || isReportOnly },
    { id: PaneType.INFO, label: 'Info' },
    { id: PaneType.REPORT, label: 'Report' },
    { id: PaneType.MODULE, label: 'Module' },
    { id: PaneType.VIEW, label: 'View' },
  ];

  return (
    <div className={cn(styles.root, className)}>
      <div role="tablist" aria-label="Inspector panels" className={styles.list}>
        {tabs
          .filter(tab => tab.visible !== false)
          .map(({ id, label }) => {
            const isSelected =
              isInspectorOpen &&
              (id === GRAPH
                ? isGraphShown
                : !isGraphShown && currentTab === id);

            return (
              <div
                key={id}
                className={cn(styles.tab, {
                  [styles.active]: isSelected,
                })}
              >
                <button
                  type="button"
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={isSelected}
                  aria-controls={id === GRAPH ? undefined : 'inspector'}
                  className={
                    isSelected
                      ? utilities.brightHover
                      : utilities.brightHoverBackdrop
                  }
                  onClick={() => {
                    // Like mobile apps, tapping the current tab scrolls to the top
                    if (isSelected && id !== GRAPH) {
                      // Also store the tab, in case it was only the default
                      selectTab(id);
                      getScroller(isTightScreen)?.scrollTo({
                        top: 0,
                        behavior: matchMedia('(prefers-reduced-motion)').matches
                          ? 'instant'
                          : 'smooth',
                      });

                      return;
                    }

                    if (id === GRAPH) {
                      setHide(null);
                      setGraphVisible(true);
                      return;
                    }

                    selectTab(id);
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
