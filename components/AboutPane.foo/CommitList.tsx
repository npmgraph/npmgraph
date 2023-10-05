import React, { HTMLProps } from 'react';
import { cn } from '../../lib/dom.js';
import { GithubCommit } from '../../lib/fetch_types.js';

import { ago } from '../../lib/ago.js';
import './CommitList.scss';

// Note: https://github.com/pvdlg/conventional-changelog-metahub has a nice list of
// cc-types to emoji

export function CommitList({
  commits,
  className,
  ...props
}: { commits: GithubCommit[] } & HTMLProps<HTMLDivElement>) {
  const commitEls = commits.map((commit, i) => {
    const date = new Date(commit.commit.author.date);
    let message = commit.commit.message;

    // Parse conventional-commit type
    let ccType = commit.commit.message.match(/^([a-z]+):/)?.[1];
    if (ccType) {
      message = message.substring(ccType.length + 1);
      ccType = ccType.toLowerCase();
      if (ccType.startsWith('break') || ccType.endsWith('!'))
        ccType = 'breaking';
      else if (ccType.startsWith('feat')) ccType = 'feat';
      else if (ccType.startsWith('fix')) ccType = 'fix';
      else if (ccType.startsWith('doc')) ccType = 'docs';
      else if (ccType.startsWith('refactor')) ccType = 'refactor';
      else ccType = 'other';
    }
    message = message
      .replace(/\n[\S\s]*/m, '')
      .trim()
      .replace(/^[a-z]/, c => c.toUpperCase());
    const ccClasses = cn({
      cc: Boolean(ccType),
      [`cc-${ccType}`]: ccType,
    });
    return (
      <div className={cn('commit-item', ccClasses)} key={i}>
        {commit.isNew ? <div className="new-dot" /> : null}
        <span className="message">{message}</span>
        {ccType ? (
          <span className={cn('cc-pill', ccClasses)}>{ccType}</span>
        ) : null}
        <div>
          &mdash; <span className="when">{ago(date)}</span>
          <span className="info">
            {' by '}
            <span className="author">{commit.author.login}</span>
          </span>
        </div>
      </div>
    );
  });

  return (
    <div id="commit-list" className={cn('commit-list', className)} {...props}>
      {commitEls}
    </div>
  );
}
