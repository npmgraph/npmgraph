import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { cn } from '../../../lib/dom.js';
import { LICENSES, OSIKeyword } from '../../../lib/licenses.js';
import { Selectable } from '../../Selectable.js';
import { Analyzer } from './Analyzer.js';
import styles from './allModules.module.scss';

type LicenseMapState = {
  modules: Module[];
};

export const missingLicenses: Analyzer<LicenseMapState> = {
  map(graph, { module }, mapState) {
    mapState.modules ??= [];

    if (module.isStub) return;
    const licenses = module.getLicenses();

    if (!licenses.length || licenses[0] === 'unlicensed')
      mapState.modules.push(module);
  },

  reduce(graph, { modules }) {
    if (!modules.length) return;

    const summary = simplur`Unlicensed modules (${modules.length})`;

    const details = modules
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(module => (
        <div className={cn(styles.row)} key={module.key}>
          <Selectable
            className={cn(styles.name)}
            type="exact"
            value={module.key}
          />
        </div>
      ));

    return { summary, details };
  },
};

function createLicenseKeywordAnalyzer(keyword: OSIKeyword) {
  const analyzer: Analyzer<LicenseMapState> = {
    map(graph, { module }, mapState) {
      mapState.modules ??= [];

      if (module.isStub) return;

      const licenses = module.getLicenses();
      if (!licenses?.length) return;
      for (const license of licenses) {
        const keywords = LICENSES[license?.toLowerCase()]?.keywords;
        if (keywords?.includes(keyword)) mapState.modules.push(module);
      }
    },

    reduce(graph, { modules }) {
      if (!modules.length) return;

      const summary = simplur`Modules with "${keyword}" license (${modules.length})`;

      const details = modules
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(module => (
          <div className={cn(styles.row)} key={module.key}>
            <Selectable
              className={cn(styles.name)}
              type="exact"
              value={module.key}
            />
          </div>
        ));

      return { summary, details };
    },
  };

  return analyzer;
}

export const discouragedLicenses = createLicenseKeywordAnalyzer('discouraged');
export const obsoleteLicenses = createLicenseKeywordAnalyzer('retired');
