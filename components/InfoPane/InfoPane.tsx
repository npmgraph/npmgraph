import React, { HTMLProps } from 'react';
import { Pane } from '../Pane.js';
import { QueryLink } from '../QueryLink.js';
import { default as FileUploadControl } from './FileUploadControl.js';
import QueryInput from './QueryInput.js';
import { ExternalLink } from '../ExternalLink.js';
import { GithubIcon } from '../Icons.js';
import { CommitList } from './CommitList.js';
import GithubSponsorButton from './GithubSponsorButton.js';
import { version as VERSION } from '../../package.json';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <h3>
        NPM name(s) or <code>package.json</code> URL
      </h3>

      <QueryInput />

      <p>
        For example, try{' '}
        <QueryLink query="express">
          <code>express</code>
        </QueryLink>
        ,{' '}
        <QueryLink query={['minimatch', 'cross-env', 'rimraf']}>
          <code>minimatch, cross-env, rimraf</code>
        </QueryLink>
        , or{' '}
        <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
          npmgraph's package.json on GitHub
        </QueryLink>
        .
      </p>

      <FileUploadControl />

      <hr />

      <p style={{ textAlign: 'center' }}>
        {'\xa9'} npmgraph Contributors &mdash; v{VERSION} &mdash;{' '}
        <ExternalLink
          href="https://github.com/npmgraph/npmgraph"
          icon={GithubIcon}
        >
          GitHub repo
        </ExternalLink>
        <GithubSponsorButton username="broofa" />
      </p>

      <hr />

      <CommitList />
    </Pane>
  );
}
