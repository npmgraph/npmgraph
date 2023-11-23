import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { Selectable } from '../../Selectable.js';
import { Diagnostic } from './Diagnostic.js';
import styles from './allMaintainers.module.scss';

export const allMaintainers: Diagnostic<{
  modulesByMaintainer: Record<string, Module[]>;
}> = {
  map(graph, { module }, mapState) {
    mapState.modulesByMaintainer ??= {};

    if (module.isStub) return;

    const { maintainers } = module.package;
    if (!maintainers) {
      console.log('No maintainers for package', module);
      return;
    }

    for (const maintainer of maintainers) {
      const name =
        typeof maintainer === 'string' ? maintainer : maintainer.name;

      if (!name) continue;

      mapState.modulesByMaintainer[name] ??= [];
      mapState.modulesByMaintainer[name].push(module);
    }
  },

  reduce(graph, { modulesByMaintainer }) {
    const details = Object.entries(modulesByMaintainer)
      .filter(([, v]) => v.length > 1)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, modules]) => {
        return (
          <div className={styles.root} key={name}>
            <Selectable
              className={styles.maintainer}
              type="maintainer"
              value={name}
            />

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
