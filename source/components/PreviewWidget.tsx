import PullRequestIcon from 'octicons-plain-react/GitPullRequest';
import GlobeIcon from 'octicons-plain-react/Globe';
import XIcon from 'octicons-plain-react/X';
import { useMemo, useState } from 'react';
import { useHashParameters } from '../hooks/useHashParam.ts';
import useLocation from '../hooks/useLocation.ts';
import { Button, ButtonGroup } from './Button.tsx';
import * as styles from './PreviewWidget.module.css';
import * as utilities from './ui/utilities.module.css';

function getNpmgraphJsOrgUrl(search: string, hash: string) {
  const url = new URL('https://npmgraph.js.org/');
  url.search = search;
  url.hash = hash;
  return url.href;
}

export default function PreviewWidget() {
  const [isHidden, setIsHidden] = useState(false);
  const [locationUrl] = useLocation();
  const [hashParameters] = useHashParameters();
  const hash = hashParameters.toString();
  const isProductionHost = locationUrl.hostname === 'npmgraph.js.org';
  const prNumber = useMemo(
    () => import.meta.env.VERCEL_GIT_PULL_REQUEST_ID?.trim(),
    [],
  );
  const prUrl = prNumber
    ? `https://github.com/npmgraph/npmgraph/pull/${prNumber}`
    : null;
  const npmgraphUrl = useMemo(
    () => getNpmgraphJsOrgUrl(locationUrl.search, hash),
    [locationUrl.search, hash],
  );

  if (isHidden || isProductionHost) {
    return null;
  }

  return (
    <ButtonGroup square vertical className={styles.root}>
      {prUrl ? (
        <Button
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open pull request"
        >
          <PullRequestIcon />
        </Button>
      ) : null}
      <Button
        href={npmgraphUrl}
        target="_blank"
        className={utilities.brightHover}
        rel="noopener noreferrer"
        title="Compare to production npmgraph"
      >
        <GlobeIcon />
      </Button>
      <Button
        className={utilities.brightHover}
        title="Hide widget until reload"
        type="button"
        onClick={() => {
          setIsHidden(true);
        }}
      >
        <XIcon />
      </Button>
    </ButtonGroup>
  );
}
