import { appVersion, releaseStage } from '../lib/bugsnag.ts';
import GitHubCorner from './GitHubCorner.tsx';
import QueryInput from './InfoPane/QueryInput.tsx';
import { InputDescription, InputExamples } from './InputHelp.tsx';
import * as styles from './Intro.module.css';
import Logo from './Logo.tsx';
import StickerFarm from './StickerFarm.tsx';
import { Group } from './ui/Group.tsx';

export default function Intro() {
  return (
    <main className={styles.root}>
      <h1 title={`Release: ${appVersion} (${releaseStage})`}>
        <Logo />
      </h1>
      <QueryInput variant="hero" />
      <InputExamples />
      <Group title="Explore npm modules and dependencies">
        <InputDescription isDim />
      </Group>
      <StickerFarm />
      <GitHubCorner />
    </main>
  );
}
