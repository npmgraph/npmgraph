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
      <h2 title={`Release: ${appVersion} (${releaseStage})`}>
        <Logo />
      </h2>
      <QueryInput variant="hero" />
      <InputExamples />
      <h2 className={styles.label}>Explore npm modules and dependencies</h2>
      <InputDescription isDim />
      <StickerFarm />
      <GitHubCorner />
    </main>
  );
}
