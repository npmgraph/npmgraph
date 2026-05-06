import QueryInput from './InfoPane/QueryInput.tsx';
import Logo from './Logo.tsx';
import * as styles from './AppHeader.module.scss';
import Tabs from './Tabs.tsx';
import { useKeyboardShortcuts } from './useKeyboardShortcuts.ts';

export default function AppHeader() {
  useKeyboardShortcuts();

  return (
    <div className={styles.root}>
      <a href="/"><Logo /></a>
      <QueryInput className={styles.input} />
      <Tabs className={styles.tabs} />
    </div>
  );
}
