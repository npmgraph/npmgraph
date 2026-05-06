import * as indexStyles from '../index.module.scss';
import { cn } from '../lib/dom.ts';
import * as styles from './Splitter.module.scss';
import * as tabStyles from './Tabs.module.scss';

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
      className={cn(indexStyles.brightHover, tabStyles.tab, styles.splitter)}
      onClick={onClick}
      aria-hidden={!isOpen}
    >
      {blackRightPointingTriangle}
    </div>
  );
}
