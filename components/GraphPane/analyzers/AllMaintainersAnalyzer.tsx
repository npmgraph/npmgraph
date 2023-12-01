import { Maintainer } from '@npm/types';
import md5 from 'md5';
import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { report } from '../../../lib/bugsnag.js';
import { GraphModuleInfo } from '../../GraphDiagram/graph_util.js';
import { Selectable } from '../../Selectable.js';
import styles from './AllMaintainersAnalyzer.module.scss';
import { Analyzer } from './Analyzer.js';

export type MaintainerMapState = {
  modulesByMaintainer: Record<string, Module[]>;
  maintainerEmails: Record<string, string>;
};

function normalizeMaintainer(maintainer: Maintainer | string) {
  return !maintainer || typeof maintainer === 'string'
    ? { name: maintainer }
    : maintainer;
}

export class AllMaintainersAnalyzer extends Analyzer {
  modulesByMaintainer: Record<string, Module[]> = {};
  maintainerEmails: Record<string, string> = {};

  map({ module }: GraphModuleInfo) {
    if (module.isStub) return;

    const { maintainers } = module.package;

    // Consider adding "no maintainer" here? This will all the
    // SoloMaintainersAnalyzer to identifiy modules with no maintainers, which
    // may be helpful.
    if (!maintainers) return;

    for (const m of maintainers) {
      const maintainer = normalizeMaintainer(m);

      // Combine information the maintainer across multiple modules (increases
      // the odds of us having an email to generate gravatar image from)
      if (maintainer.email && maintainer.name) {
        this.maintainerEmails[maintainer.name] = maintainer.email;
      }

      if (!maintainer.name) {
        report.error(new Error(`Nameless maintainer "${m}" in ${module.key}`));
        maintainer.name = '\u{26A0}\u{FE0F} (unnamed maintainer)';
      }

      this.modulesByMaintainer[maintainer.name] ??= [];
      this.modulesByMaintainer[maintainer.name].push(module);
    }
  }

  reduce() {
    const details = Object.entries(this.modulesByMaintainer)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, modules]) => {
        const email = this.maintainerEmails[name];
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
  }
}
