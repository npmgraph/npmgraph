import React, { HTMLProps } from 'react';
import { cn } from '../../lib/dom.js';
import { SponsorIcon } from '../Icons.js';
import './GithubSponsorButton.scss';

export default function GithubSponsorButton({
  className,
  username,
  ...props
}: HTMLProps<HTMLAnchorElement> & { username: string }) {
  return (
    <a
      href={`https://github.com/sponsors/${username}`}
      className={cn('github-sponsor', className)}
      target="_blank"
      {...props}
    >
      <SponsorIcon />
      <span>Sponsor @{username}</span>
    </a>
  );
}
