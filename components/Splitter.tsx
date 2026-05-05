import { cn } from '../lib/dom.ts';
import styles from './Splitter.module.scss';
import tabStyles from './Tab.module.scss';

const tabClassNames = tabStyles as Record<string, string>;

const blackRightPointingTriangle = '\u{25B6}';
const blackLeftPointingTriangle = '\u{25C0}';

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
      className={cn('bright-hover', tabClassNames.root, styles.root)}
      onClick={onClick}
    >
      {isOpen ? blackRightPointingTriangle : blackLeftPointingTriangle}
    </div>
  );
}
