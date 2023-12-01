import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { LICENSES } from '../../../lib/licenses.js';
import { GraphModuleInfo } from '../../GraphDiagram/graph_util.js';
import { Selectable } from '../../Selectable.js';
import styles from './AllLicensesAnalyzer.module.scss';
import { Analyzer } from './Analyzer.js';

export type LicenseMapState = {
  modulesByLicense: Record<string, Module[]>;
};

export class AllLicensesAnalyzer extends Analyzer {
  modulesByLicense: Record<string, Module[]> = {};

  map({ module }: GraphModuleInfo) {
    this.modulesByLicense ??= {};

    if (module.isStub) return;

    const licenses = module.getLicenses();

    if (!licenses.length) {
      licenses.push('');
    }

    for (let license of licenses) {
      license = license.toLowerCase();
      this.modulesByLicense[license] ??= [];
      this.modulesByLicense[license].push(module);
    }
  }

  reduce() {
    const details = Object.entries(this.modulesByLicense)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([license, modules]) => {
        const keywords = LICENSES[license.toLowerCase()]?.keywords;

        return (
          <div className={styles.root} key={license}>
            <div className={styles.license}>
              <Selectable
                type="license"
                value={license}
                label={license || '(unlicensed)'}
              />
              {keywords ? (
                <div className={styles.keywords}>
                  {keywords.map(k => (
                    <span className={styles.keyword} key={k}>
                      {k}
                    </span>
                  ))}
                </div>
              ) : null}
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

    const summary = simplur`All licenses (${details.length})`;
    return { summary, details };
  }
}
