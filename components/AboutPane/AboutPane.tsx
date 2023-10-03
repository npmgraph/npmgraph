import React, { HTMLProps } from 'react';

import { GithubCommit } from '../../lib/fetch_types.js';
import { Pane } from '../Pane.js';
import './AboutPane.scss';
import { CommitList } from './CommitList.js';
import GithubSponsorButton from './GithubSponsorButton.js';

export default function AboutPane({
  commits,
  ...props
}: { commits: GithubCommit[] } & HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <p>
        <code>npmgraph</code> is an opensource project. If you'd like to show
        your support please consider sponsoring one the maintainers:
      </p>
      <div id="sponsor-buttons">
        <GithubSponsorButton username="broofa" />
        <GithubSponsorButton username="fregante" />
      </div>
      <p>Here's what we've been up to since you last visited:</p>
      <hr />
      <CommitList commits={commits} />
    </Pane>
  );
}
