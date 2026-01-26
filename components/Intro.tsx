import GitHubCorner from './GitHubCorner.tsx';
import QueryInput from './InfoPane/QueryInput.tsx';
import InputHelp from './InputHelp.tsx';
import * as styles from './Intro.module.scss';
import Logo from './Logo.tsx';

export default function Intro() {
  return (
    <div className={styles.root}>
      <h1>
        <Logo />
      </h1>
      <h2>Explore npm modules and dependencies</h2>
      <QueryInput />
      <InputHelp />
      <GitHubCorner />
    </div>
  );
}
