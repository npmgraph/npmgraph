import QueryInput from './InfoPane/QueryInput.tsx';
import Logo from './Logo.tsx';
import * as styles from './AppHeader.module.scss';
import Tabs from './ui/Tabs.tsx';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.ts';
import { QueryLink } from './ui/QueryLink.tsx';
import ErrorsBanner from './ErrorsBanner.tsx';

export default function AppHeader() {
  useKeyboardShortcuts();

  return (
    <div className={styles.root}>
      <QueryLink query={[]}>
        <Logo />
      </QueryLink>
      <QueryInput className={styles.input} />
      <Tabs className={styles.tabs} />
      <ErrorsBanner />
    </div>
  );
}
