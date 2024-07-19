import React, { HTMLProps } from 'react';
import { ExternalLink } from '../ExternalLink.js';
import { GithubIcon } from '../Icons.js';
import { Pane } from '../Pane.js';
import './AboutPane.scss';
import { CommitList } from './CommitList.js';
import GithubSponsorButton from './GithubSponsorButton.js';
import { version as VERSION } from '../../package.json';

export default function AboutPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <p>
        {'\xa9'} npmgraph Contributors &mdash; v{VERSION}
      </p>
      <p style={{ lineHeight: '1.5rem' }}>
        Questions or comments? Visit the{' '}
        <ExternalLink
          href="https://github.com/npmgraph/npmgraph"
          icon={GithubIcon}
        >
          GitHub repo
        </ExternalLink>
      </p>

      <p>
        Want to show your appreciation?
        <GithubSponsorButton username="broofa" style={{ marginLeft: '1rem' }} />
      </p>

      <CommitList />
    </Pane>
  );
}
