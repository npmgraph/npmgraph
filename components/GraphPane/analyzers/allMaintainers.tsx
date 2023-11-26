import { Maintainer } from '@npm/types';
import md5 from 'md5';
import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { report } from '../../../lib/bugsnag.js';
import { Selectable } from '../../Selectable.js';
import { Analyzer } from './Analyzer.js';
import styles from './allMaintainers.module.scss';

export type MaintainerMapState = {
  modulesByMaintainer: Record<string, Module[]>;
  maintainerEmails: Record<string, string>;
};

function normalizeMaintainer(maintainer: Maintainer | string) {
  return !maintainer || typeof maintainer === 'string'
    ? { name: maintainer }
    : maintainer;
}

export const allMaintainers: Analyzer<MaintainerMapState> = {
  map(graph, { module }, mapState) {
    mapState.modulesByMaintainer ??= {};
    mapState.maintainerEmails ??= {};

    if (module.isStub) return;

    const { maintainers } = module.package;
    if (!maintainers) {
      report.error(new Error(`No maintainers for package ${module.key}`));
      return;
    }

    for (const m of maintainers) {
      const maintainer = normalizeMaintainer(m);

      // Combine information the maintainer across multiple modules (increases
      // the odds of us having an email to generate gravatar image from)
      if (maintainer.email && maintainer.name) {
        mapState.maintainerEmails[maintainer.name] = maintainer.email;
      }

      if (!maintainer.name) {
        report.error(new Error(`Nameless maintainer "${m}" in ${module.key}`));
        maintainer.name = '\u{26A0}\u{FE0F} (unnamed maintainer)';
      }

      mapState.modulesByMaintainer[maintainer.name] ??= [];
      mapState.modulesByMaintainer[maintainer.name].push(module);
    }
  },

  reduce(graph, { modulesByMaintainer, maintainerEmails }) {
    const details = Object.entries(modulesByMaintainer)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, modules]) => {
        const email = maintainerEmails[name];
        let img: JSX.Element | null = null;
        if (email) {
          img = (
            <img
              loading="lazy"
              src={`https://www.gravatar.com/avatar/${md5(email)}?s=32`}
            />
          );
        }

        return (
          <div className={styles.root} key={name}>
            <div className={styles.maintainer}>
              {img}
              <Selectable type="maintainer" value={name} />
            </div>

            <div className={styles.modules}>
              {modules.map(m => (
                <Selectable type="exact" value={m.key} key={m.key} />
              ))}
            </div>
          </div>
        );
      });

    if (details.length <= 0) return;

    const summary = simplur`All maintainers (${details.length})`;
    return { summary, details };
  },
};
