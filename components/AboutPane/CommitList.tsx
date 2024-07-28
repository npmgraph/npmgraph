import type { HTMLProps } from 'react';
import React, { useEffect } from 'react';
import simplur from 'simplur';
import { ago } from '../../lib/ago.js';
import { cn } from '../../lib/dom.js';
import useCommits from '../../lib/useCommits.js';
import './CommitList.scss';

// Note: https://github.com/pvdlg/conventional-changelog-metahub has a nice list of
// cc-types to emoji

export function CommitList({ className, ...props }: HTMLProps<HTMLDivElement>) {
  const [commits, newCount, reset] = useCommits();

  // Reset new commit
  useEffect(() => {
    // Only reset lastVisit time if there are new commits
    if (newCount > 0)
      return reset;
  }, [reset]);

  const commitEls = commits.map((commit, i) => {
    const date = new Date(commit.commit.author.date);
    const { ccType, ccMessage } = commit;

    const ccClasses = cn({ cc: Boolean(ccType), [`cc-${ccType}`]: ccType });

    return (
      <div className={cn('commit-item', ccClasses)} key={i}>
        <div className="commit-top">
          {commit.isNew ? <div className="new-dot" /> : null}
          <span className="message">{ccMessage}</span>
          {ccType
            ? (
                <span className={cn('cc-pill', ccClasses)}>{ccType}</span>
              )
            : null}
        </div>
        <div>
          &mdash;
          {' '}
          <span className="when">{ago(date)}</span>
          <span className="info">
            {' by '}
            <span className="author">{commit.author.login}</span>
          </span>
        </div>
      </div>
    );
  });

  return (
    <div id="commit-list">
      <div id="commit-list-header">
        Recent changes
        {newCount > 0 ? simplur` (${newCount} new)` : null}
      </div>

      <div className={cn('commit-list', className)} {...props}>
        {commitEls}
      </div>
    </div>
  );
}
