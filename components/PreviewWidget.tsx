import { useMemo, useState } from 'react';
import useLocation from '../lib/useLocation.ts';
import { GithubIcon, OffsiteLinkIcon, XIcon } from './Icons.tsx';
import * as styles from './PreviewWidget.module.scss';

// eslint-disable-next-line node/prefer-global/process
const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID?.trim();
const prUrl = prNumber
  ? `https://github.com/npmgraph/npmgraph/pull/${prNumber}`
  : 'https://github.com/npmgraph/npmgraph/pulls';

function getNpmgraphJsOrgUrl(locationHref: URL) {
  const url = new URL('https://npmgraph.js.org/');
  url.search = locationHref.search;
  url.hash = locationHref.hash;
  return url.toString();
}

export default function PreviewWidget() {
  const [isHidden, setIsHidden] = useState(false);
  const [locationHref] = useLocation();
  const npmgraphUrl = useMemo(
    () => getNpmgraphJsOrgUrl(locationHref),
    [locationHref],
  );

  if (isHidden) {
    return null;
  }

  return (
    <aside className={styles.root}>
      <a
        href={prUrl}
        aria-label="Open pull request"
        title="Open pull request"
      >
        <GithubIcon />
      </a>
      <a
        href={npmgraphUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open current query on npmgraph.js.org"
        title="Open current query on npmgraph.js.org"
      >
        <OffsiteLinkIcon />
      </a>
      <button
        aria-label="Hide widget"
        onClick={() => setIsHidden(true)}
        title="Hide widget until reload"
        type="button"
      >
        <XIcon />
      </button>
    </aside>
  );
}
