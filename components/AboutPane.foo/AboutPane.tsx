import React, { HTMLProps, useEffect } from 'react';

import simplur from 'simplur';
import { ExternalLink } from '../ExternalLink.js';
import { Pane } from '../Pane.js';
import useCommits from '../useCommits.js';
import './AboutPane.scss';
import { CommitList } from './CommitList.js';
import GithubSponsorButton from './GithubSponsorButton.js';
import { GithubIcon, ZoomHorizontalIcon } from './Icons.js';

export default function AboutPane(props: HTMLProps<HTMLDivElement>) {
  const [commits, newCount, reset] = useCommits();
  console.log('Rendering about');
  // Reset new commit
  useEffect(() => {
    // Only reset lastVisit time if there are new commits
    // if (newCount > 0) return reset;
  }, [reset]);

  return (
    <Pane {...props}>
      <ExternalLink href="https://github.com/npmgraph/npmgraph">
        Visit us on Github <GithubIcon />
      </ExternalLink>
      <ZoomHorizontalIcon />

      <p>
        Hi, thanks for taking an interest in this project. We're hosted over on
        GitHub, if you want all the gory details.
      </p>
      <p>If you'd like to support us (yay!), you can sponsor us here:</p>
      <div id="sponsor-buttons">
        <GithubSponsorButton username="broofa" />
        <GithubSponsorButton username="fregante" />
      </div>
      <p>
        And if you need a reason for that, there's{' '}
        {simplur`${newCount} new commit[|s]`} that may be of interest...
      </p>
      <hr />
      <CommitList commits={commits} />
    </Pane>
  );
}
