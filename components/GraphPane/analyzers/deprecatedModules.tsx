import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { Selectable } from '../../Selectable.js';
import { Analyzer } from './Analyzer.js';
import styles from './deprecatedModules.module.scss';

export const deprecatedModules: Analyzer<{
  deprecated: Module[];
}> = {
  map(graph, { module }, mapState) {
    mapState.deprecated ??= [];
    if (module.package.deprecated) {
      mapState.deprecated.push(module);
    }
  },

  reduce(graph, { deprecated }) {
    if (deprecated.length <= 0) return;

    const details = deprecated
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(module => {
        return (
          <div className={styles.root} key={module.key}>
            <Selectable type="exact" value={module.key} />
            {': '}
            <span className={styles.body}>
              &rdquo;{module.package.deprecated}&ldquo;
            </span>
          </div>
        );
      });

    const summary = simplur`Deprecated modules (${deprecated.length})`;
    return { summary, details };
  },
};
