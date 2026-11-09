import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.ts';
import { useIsTightScreen } from '../hooks/useIsTightScreen.ts';
import QueryInput from './InfoPane/QueryInput.tsx';
import Logo from './Logo.tsx';
import * as styles from './AppHeader.module.scss';
import Tabs from './ui/Tabs.tsx';
import { QueryLink } from './ui/QueryLink.tsx';

export default function AppHeader() {
  useKeyboardShortcuts();
  const isTightScreen = useIsTightScreen();

  return (
    <header className={styles.root}>
      <QueryLink query={[]}>
        <Logo />
      </QueryLink>
      <QueryInput variant="header" />
      {isTightScreen ? null : <Tabs />}
    </header>
  );
}
