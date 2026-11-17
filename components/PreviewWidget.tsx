import { useMemo, useState } from 'react';
import useLocation from '../hooks/useLocation.ts';
import GlobeIcon from '../images/icons/globe.svg?react';
import PullRequestIcon from '../images/icons/pull-request.svg?react';
import XIcon from '../images/icons/x.svg?react';
import * as utilities from './ui/utilities.module.css';
import * as styles from './PreviewWidget.module.css';
import Tooltip from './ui/Tooltip.tsx';
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
        <Tooltip label="Open pull request">
          {props => (
            <Button
              {...props}
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PullRequestIcon />
            </Button>
          )}
        </Tooltip>
      ) : null}
      <Tooltip label="Compare to production npmgraph">
        {props => (
          <Button
            {...props}
            href={npmgraphUrl}
            target="_blank"
            className={utilities.brightHover}
            rel="noopener noreferrer"
          >
            <GlobeIcon />
          </Button>
        )}
      </Tooltip>
      <Tooltip label="Hide widget until reload">
        {props => (
          <Button
            {...props}
            className={utilities.brightHover}
            type="button"
            onClick={() => {
              setIsHidden(true);
            }}
          >
            <XIcon />
          </Button>
        )}
      </Tooltip>
    </ButtonGroup>
  );
}
