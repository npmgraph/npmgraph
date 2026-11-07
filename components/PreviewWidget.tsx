import { useMemo, useState } from 'react';
import useLocation from '../hooks/useLocation.ts';
import JsOrgIcon from '../images/icons/js-org.svg?react';
import PullRequestIcon from '../images/icons/pull-request.svg?react';
import XIcon from '../images/icons/x.svg?react';
import * as utilities from './ui/utilities.module.css';
import * as styles from './PreviewWidget.module.css';
import { Button, ButtonGroup } from './Button.tsx';

function getNpmgraphJsOrgUrl(locationUrl: URL) {
  const url = new URL('https://npmgraph.js.org/');
  url.search = locationUrl.search;
  url.hash = locationUrl.hash;
  return url.href;
}

export default function PreviewWidget() {
  const [isHidden, setIsHidden] = useState(false);
  const [locationUrl] = useLocation();
  const isProductionHost = locationUrl.hostname === 'npmgraph.js.org';
  const prNumber = useMemo(
    () => import.meta.env.VERCEL_GIT_PULL_REQUEST_ID?.trim(),
    [],
  );
  const prUrl = prNumber
    ? `https://github.com/npmgraph/npmgraph/pull/${prNumber}`
    : null;
  const npmgraphUrl = useMemo(
    () => getNpmgraphJsOrgUrl(locationUrl),
    [locationUrl],
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
        <JsOrgIcon />
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
