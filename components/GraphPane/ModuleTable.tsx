import React, { Fragment } from 'react';
import { Selectable } from '../Selectable.js';

import type Module from '../../lib/Module.js';
import * as styles from './ModuleTable.module.scss';

export type ModuleTableData = Map<string, Module[]>;

export function ModuleTable({ data }: { data: ModuleTableData }) {
  const moduleNames = Array.from(data.keys()).sort();

  const rows = moduleNames.map(name => {
    const modules = data.get(name)!;
    modules.sort((a, b) => a.version.localeCompare(b.version));

    return modules.length === 1 ? (
      <div className={styles.rootRow} key={name}>
        <Selectable
          className={styles.rootName}
          type="exact"
          value={modules[0].key}
          label={modules[0].name}
        />
        <span></span>
      </div>
    ) : (
      <Fragment key={name}>
        <div className={styles.rootRow}>
          <Selectable
            className={styles.rootName}
            type="name"
            value={modules[0].name}
          />

          {modules.map(m => (
            <Selectable
              className={styles.rootVersion}
              type="exact"
              label={`@${m.version}`}
              key={m.version}
              value={m.key}
            />
          ))}
        </div>
      </Fragment>
    );
  });

  return <div className={styles.root}>{rows}</div>;
}
