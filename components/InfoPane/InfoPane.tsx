import React, { HTMLProps } from 'react';
import { Pane } from '../Pane.js';
import { QueryLink } from '../QueryLink.js';
import { default as FileUploadControl } from './FileUploadControl.js';
import QueryInput from './QueryInput.js';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane style={{ display: 'flex', flexDirection: 'column' }} {...props}>
      <h3>
        NPM Name or <code>package.json</code> URL
      </h3>

      <QueryInput />

      <p>
        For example:
        <QueryLink query="express">&quot;express&quot;</QueryLink>
        &mdash;
        <QueryLink query={['minimatch', 'cross-env', 'rimraf']}>
          &quot;minimatch, cross-env, rimraf&quot;
        </QueryLink>
        &mdash;{' '}
        <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
          npmgraph's package.json on GitHub
        </QueryLink>
        .
      </p>

      <h3>
        Upload a <code>package.json</code> file
      </h3>

      <FileUploadControl />
    </Pane>
  );
}
