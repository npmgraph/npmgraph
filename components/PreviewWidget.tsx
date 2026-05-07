import { useMemo, useState } from 'react';
import useLocation from '../lib/useLocation.ts';
import { GithubIcon, OffsiteLinkIcon, XIcon } from './Icons.tsx';
import * as styles from './PreviewWidget.module.scss';

function getNpmgraphJsOrgUrl(locationHref: URL) {
  const url = new URL('https://npmgraph.js.org/');
  url.search = locationHref.search;
  url.hash = locationHref.hash;
  return url.href;
}

export default function PreviewWidget() {
  const [isHidden, setIsHidden] = useState(false);
  const [locationHref] = useLocation();
  const prNumber = useMemo(() => {
    // eslint-disable-next-line node/prefer-global/process
    return process.env.VERCEL_GIT_PULL_REQUEST_ID?.trim();
  }, []);
  const prUrl = prNumber
    ? `https://github.com/npmgraph/npmgraph/pull/${prNumber}`
    : null;
  const npmgraphUrl = useMemo(
    () => getNpmgraphJsOrgUrl(locationHref),
    [locationHref],
  );

  if (isHidden) {
    return null;
  }

  return (
    <aside className={styles.root}>
      {prUrl ? (
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open pull request"
          title="Open pull request"
        >
          <GithubIcon />
        </a>
      ) : null}
      <a
        href={npmgraphUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open current query on npmgraph.js.org"
        title="Compare to production npmgraph"
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
