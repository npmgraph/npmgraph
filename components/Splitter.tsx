import { cn } from '../lib/dom.ts';
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
    <div
      className={cn(utilities.brightHover, tabStyles.tab, styles.splitter)}
      onClick={onClick}
      aria-hidden={!isOpen}
    >
      {blackRightPointingTriangle}
    </div>
  );
}
