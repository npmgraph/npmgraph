import QueryInput from './InfoPane/QueryInput.tsx';
import Logo from './Logo.tsx';
import * as styles from './AppHeader.module.scss';

export default function AppHeader() {
  return (
    <div className={styles.root}>
      <Logo />
      <QueryInput className={styles.input} />
    </div>
  );
}
