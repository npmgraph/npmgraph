import { cn } from '../lib/dom.ts';
import * as styles from './Splitter.module.scss';
import tabStyles from './Tab.module.scss';

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
      id="splitter"
      className={cn('bright-hover', tabStyles.tab, styles.splitter)}
      onClick={onClick}
      aria-hidden={!isOpen}
    >
      {blackRightPointingTriangle}
    </div>
  );
}
