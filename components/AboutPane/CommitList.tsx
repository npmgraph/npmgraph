import React, { HTMLProps } from 'react';
import { ago } from '../../lib/ago.js';
import { cn } from '../../lib/dom.js';
import { GithubCommit } from '../../lib/fetch_types.js';

import './CommitList.scss';

// Note: https://github.com/pvdlg/conventional-changelog-metahub has a nice list of
// cc-types to emoji

export function CommitList({
  commits,
  className,
  ...props
}: { commits: GithubCommit[] } & HTMLProps<HTMLDivElement>) {
  const commitEls = commits.map(commit => {
    const date = new Date(commit.commit.author.date);
    let message = commit.commit.message;
    // Parse conventional-commit type
    let ccType = commit.commit.message.match(/^([a-z]+):/)?.[1];
    if (ccType) {
      ccType = ccType.toLowerCase();
      if (ccType.startsWith('break') || ccType.endsWith('!'))
        ccType = 'breaking';
      else if (ccType.startsWith('feat')) ccType = 'feat';
      else if (ccType.startsWith('fix')) ccType = 'fix';
      else ccType = 'other';
      message = message.substring(ccType.length + 1);
    }
    message = message.trim();
    return (
      <div className="commit-item" key={commit.sha}>
        {ccType ? (
          <span className={cn('cc-type', `cc-${ccType}`)}>{ccType}</span>
        ) : null}
        {/* {ccType ? <span className="type">{ccType}</span> : null} */}
        <span className="message">
          {message}
          <span className="info">
            &mdash; <span className="when">{ago(date)}</span>
            {' by '}
            <span className="author">{commit.author.login}</span>
          </span>
        </span>
      </div>
    );
  });

  return (
    <div className={cn('commit-list', className)} {...props}>
      {commitEls}
    </div>
  );
}
