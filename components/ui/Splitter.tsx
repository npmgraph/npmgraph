import { cn } from '../../lib/dom.ts';
import * as styles from './Splitter.module.scss';
import * as tabStyles from './Tabs.module.scss';
import * as utilities from './utilities.module.scss';

const blackRightPointingTriangle = '\u{25B6}';

export function Splitter({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={isOpen ? 'Hide side panel' : 'Show side panel'}
      aria-expanded={isOpen}
      className={cn(utilities.brightHover, tabStyles.tab, styles.splitter)}
      aria-hidden={!isOpen}
      onClick={onClick}
    >
      {blackRightPointingTriangle}
    </button>
  );
}
