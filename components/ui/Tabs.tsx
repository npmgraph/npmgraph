import type { HTMLProps } from 'react';
import { PaneType, PARAM_HIDE } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import * as utilities from './utilities.module.scss';

import { Splitter } from './Splitter.tsx';
import * as styles from './Tabs.module.scss';
import { useIsTightScreen } from '../../hooks/useIsTightScreen.ts';

export default function Tabs({ className }: HTMLProps<HTMLInputElement>) {
  const [currentPane, setCurrentPane] = useGlobalState('pane');
  const isTightScreen = useIsTightScreen();
  const [hide, setHide] = useHashParam(PARAM_HIDE);
  const isInspectorOpen = hide === null;

  const tabs = [
    { pane: PaneType.GRAPH, label: 'Graph', visible: isTightScreen },
    { pane: PaneType.INFO, label: 'Info' },
    { pane: PaneType.REPORT, label: 'Report' },
    { pane: PaneType.MODULE, label: 'Module' },
    { pane: PaneType.SETTINGS, label: 'View' },
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
                    setCurrentPane(tabPane);
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
