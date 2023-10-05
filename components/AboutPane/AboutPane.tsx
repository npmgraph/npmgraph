import React, { HTMLProps } from 'react';
import { ExternalLink } from '../ExternalLink.js';
import { GithubIcon } from '../Icons.js';
import { Pane } from '../Pane.js';
import './AboutPane.scss';
import { CommitList } from './CommitList.js';
import GithubSponsorButton from './GithubSponsorButton.js';

export default function AboutPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <div style={{ lineHeight: '1.5rem' }}>
        Questions or comments? Visit the{' '}
        <ExternalLink
          href="https://github.com/npmgraph/npmgraph"
          icon={GithubIcon}
        >
          Github repo
        </ExternalLink>
      </div>

      <p>Adoration and praise? Sponsor us! 😁</p>
      <div id="sponsor-buttons">
        <GithubSponsorButton username="broofa" />
        <GithubSponsorButton username="fregante" />
      </div>

      <CommitList />
    </Pane>
  );
}
