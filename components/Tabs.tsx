import type { HTMLProps } from 'react';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { cn } from '../lib/dom.ts';
import useHashParam from '../lib/useHashParam.ts';
import * as utilities from './utilities.module.scss';

import { Splitter } from './Splitter.tsx';
import * as styles from './Tabs.module.scss';

function Tab({
  active,
  className,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  active: boolean;
}) {
  return (
    <div
      className={cn(styles.tab, className, { [styles.active]: active })}
      {...props}
    >
      <button type="button" className={utilities.brightHover}>
        {children}
      </button>
    </div>
  );
}

export default function Tabs({ className }: HTMLProps<HTMLInputElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const [hide, setHide] = useHashParam(PARAM_HIDE);

  const isInspector = hide === null;
  return (
    <div className={[styles.root, className].join(' ')}>
      <Tab
        active={isInspector && pane === PaneType.INFO}
        onClick={() => {
          setHide(null);
          setPane(PaneType.INFO);
        }}
      >
        Info
      </Tab>
      <Tab
        active={isInspector && pane === PaneType.REPORT}
        onClick={() => {
          setHide(null);
          setPane(PaneType.REPORT);
        }}
      >
        Report
      </Tab>
      <Tab
        className={styles.tabMobileOnly}
        active={isInspector && pane === PaneType.GRAPH}
        onClick={() => {
          setHide(null);
          setPane(PaneType.GRAPH);
        }}
      >
        Graph
      </Tab>
      <Tab
        active={isInspector && pane === PaneType.MODULE}
        onClick={() => {
          setHide(null);
          setPane(PaneType.MODULE);
        }}
      >
        Module
      </Tab>
      <Tab
        active={isInspector && pane === PaneType.SETTINGS}
        onClick={() => {
          setHide(null);
          setPane(PaneType.SETTINGS);
        }}
      >
        Settings
      </Tab>
      <Splitter
        isOpen={isInspector}
        onClick={() => {
          setHide(true);
        }}
      />
    </div>
  );
}
