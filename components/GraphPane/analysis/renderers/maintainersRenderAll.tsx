import md5 from 'md5';
import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import { Selectable } from '../../../Selectable.js';
import { RenderedAnalysis } from '../Analyzer.js';
import { MaintainerAnalysisState } from '../analyzeMaintainers.js';
import styles from './maintainersRenderAll.module.scss';

export function maintainersRenderAll({
  modulesByMaintainer,
  emailByMaintainer,
}: MaintainerAnalysisState): RenderedAnalysis {
  const details = Array.from(modulesByMaintainer.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, modules]) => {
      console.log('NAME', name, modules);
      const email = emailByMaintainer.get(name);
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
        <div className={cn(styles.root, 'zebra-row')} key={name}>
          <div className={styles.maintainer}>
            {img}
            <Selectable type="maintainer" value={name} />
          </div>

          <div className={styles.modules}>
            {[...modules.values()].map(m => (
              <Selectable type="exact" value={m.key} key={m.key} />
            ))}
          </div>
        </div>
      );
    });

  if (details.length <= 0) return;

  const summary = simplur`All maintainers (${details.length})`;
  return { type: 'info', summary, details };
}
