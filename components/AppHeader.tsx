import QueryInput from './InfoPane/QueryInput.tsx';
import Logo from './Logo.tsx';
import * as styles from './AppHeader.module.scss';
import Tabs from './ui/Tabs.tsx';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.ts';
import { useIsTightScreen } from '../hooks/useIsTightScreen.ts';
import { QueryLink } from './ui/QueryLink.tsx';
import ErrorsBanner from './ErrorsBanner.tsx';

export default function AppHeader() {
  useKeyboardShortcuts();
  const isTightScreen = useIsTightScreen();

  return (
    <div className={styles.root}>
      <QueryLink query={[]}>
        <Logo />
      </QueryLink>
      <QueryInput className={styles.input} />
      {isTightScreen ? null : <Tabs />}
      <ErrorsBanner />
    </div>
  );
}
