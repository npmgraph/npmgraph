import { appVersion, releaseStage } from '../lib/bugsnag.ts';
import GitHubCorner from './GitHubCorner.tsx';
import QueryInput from './InfoPane/QueryInput.tsx';
import { InputDescription, InputExamples } from './InputHelp.tsx';
import * as styles from './Intro.module.css';
import Logo from './Logo.tsx';
import StickerFarm from './StickerFarm.tsx';

export default function Intro() {
  return (
    <main className={styles.root}>
      <h1 title={`Release: ${appVersion} (${releaseStage})`}>
        <Logo />
      </h1>
      <QueryInput variant="hero" />
      <InputExamples />
      <div className={styles.description}>
        <h3>Explore npm modules and dependencies</h3>
        <InputDescription isDim />
      </div>
      <StickerFarm />
      <GitHubCorner />
    </main>
  );
}
