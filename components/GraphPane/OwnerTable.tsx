import React, { Fragment } from 'react';
import { Selectable } from '../Selectable.js';

import Module from '../../lib/Module.js';
import styles from './OwnerTable.module.scss';

export type OwnerTableData = Map<string, Module[]>;

export function OwnerTable({ data }: { data: OwnerTableData }) {
  const moduleNames = Array.from(data.keys()).sort();

  const rows = moduleNames.map(name => {
    const modules = data.get(name)!;
    return (
      <Fragment key={name}>
        <div className={styles.rootName}>
          <Selectable type="maintainer" value={name} />
        </div>

        <div className={styles.rootVersions}>
          {modules
            .sort(({ version: a }, { version: b }) => {
              return a.localeCompare(b);
            })
            .map(m => (
              <Selectable type="exact" key={m.key} value={m.key} />
            ))}
        </div>
      </Fragment>
    );
  });

  return <div className={styles.root}>{rows}</div>;
}
