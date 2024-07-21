import React, { HTMLProps } from 'react';
import simplur from 'simplur';
import { DependencyKey } from '../GraphDiagram/graph_util.js';
import ColorizeInput from './ColorizeInput.js';
import { ExternalLink } from '../ExternalLink.js';
import { GithubIcon } from '../Icons.js';
import { Pane } from '../Pane.js';
import './AboutPane.scss';
import { CommitList } from './CommitList.js';
import GithubSponsorButton from './GithubSponsorButton.js';
import { version as VERSION } from '../../package.json';
import { Toggle } from '../Toggle.js';
import useHashParam from '../../lib/useHashParam.js';
import { PARAM_DEPENDENCIES, PARAM_SIZING } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import useCollapse from '../../lib/useCollapse.js';

export default function AboutPane(props: HTMLProps<HTMLDivElement>) {
  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);

  const dependencyTypes = (
    (depTypes ?? '').split(/\s*,\s*/) as DependencyKey[]
  ).filter(isDefined);

  const [collapse, setCollapse] = useCollapse();
  const [sizing, setSizing] = useHashParam(PARAM_SIZING);
  const includeDev = dependencyTypes.includes('devDependencies');

  return (
    <Pane {...props}>
      <Toggle
        checked={includeDev}
        style={{ marginTop: '1rem' }}
        onChange={() => setDepTypes(includeDev ? '' : 'devDependencies')}
      >
        Include devDependencies
      </Toggle>

      <Toggle
        checked={sizing === ''}
        style={{ marginTop: '1rem' }}
        onChange={() => setSizing(sizing === null)}
      >
        Size modules by unpacked size
      </Toggle>

      <ColorizeInput />

      <div
        style={{
          fontSize: '90%',
          color: 'var(--text-dim)',
          marginTop: '1em',
        }}
      >
        {collapse.length ? (
          <span>
            {simplur`${collapse.length} module[|s] collapsed `}
            <button onClick={() => setCollapse([])}>Expand All</button>
          </span>
        ) : (
          <span>(Shift-click modules in graph to expand/collapse)</span>
        )}
      </div>
      <hr />
      <h3>About npmgraph</h3>
      <p>
        {'\xa9'} npmgraph Contributors &mdash; v{VERSION} &mdash; <ExternalLink
          href="https://github.com/npmgraph/npmgraph"
          icon={GithubIcon}
        >
          GitHub repo
        </ExternalLink>
      </p>

      <p>
        <GithubSponsorButton username="broofa"/>
      </p>

      <hr />

      <CommitList />
    </Pane>
  );
}
