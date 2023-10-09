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

      <p>
        Want to show your appreciation?
        <GithubSponsorButton username="broofa" style={{ marginLeft: '1rem' }} />
      </p>

      <CommitList />
    </Pane>
  );
}
