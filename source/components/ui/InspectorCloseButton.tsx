import { cn } from '../../lib/dom.ts';
import * as styles from './InspectorCloseButton.module.scss';
import * as tabStyles from './Tabs.module.scss';
import * as utilities from './utilities.module.css';

const blackRightPointingTriangle = '\u{25B6}';

export function InspectorCloseButton({
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
      className={cn(
        utilities.brightHoverBackdrop,
        tabStyles.tab,
        styles.button,
      )}
      aria-hidden={!isOpen}
      onClick={onClick}
    >
      {blackRightPointingTriangle}
    </button>
  );
}
