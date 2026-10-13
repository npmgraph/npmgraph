import { useMemo, useState } from 'react';
import useLocation from '../hooks/useLocation.ts';
import GithubIcon from 'jsx:../images/icons/github.svg';
import OffsiteLinkIcon from 'jsx:../images/icons/offsite-link.svg';
import XIcon from 'jsx:../images/icons/x.svg';
import * as utilities from './ui/utilities.module.scss';
import * as styles from './PreviewWidget.module.scss';
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
    // eslint-disable-next-line unicorn/no-optional-chaining-on-undeclared-variable -- False positie
    () => process.env.VERCEL_GIT_PULL_REQUEST_ID?.trim(),
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
    <ButtonGroup vertical className={styles.root}>
      {prUrl ? (
        <Button
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open pull request"
        >
          <GithubIcon />
        </Button>
      ) : null}
      <Button
        href={npmgraphUrl}
        target="_blank"
        className={utilities.brightHover}
        rel="noopener noreferrer"
        title="Compare to production npmgraph"
      >
        <OffsiteLinkIcon />
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
