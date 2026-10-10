import type { HTMLProps } from 'react';
import { PARAM_DEPENDENCIES, PARAM_SIZING } from '../../lib/constants.ts';
import { isDefined } from '../../lib/guards.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import type { DependencyKey } from '../../lib/graph-util.ts';
import ColorizeInput from '../ReportPane/ColorizeInput.tsx';
import RegistryInput from './RegistryInput.tsx';
import { Pane } from '../ui/Pane.tsx';
import { Toggle } from '../ui/Toggle.tsx';
import { cn } from '../../lib/dom.ts';
import { useParsedQuery } from '../../hooks/useQuery.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import InputHelp from '../InputHelp.tsx';
import * as utilities from '../ui/utilities.module.scss';
import FilePicker from './FilePicker.tsx';
import * as styles from './InfoPane.module.scss';
import { Section } from '../ui/Section.tsx';

function isGithubUrl(url: URL | null) {
  return url ? /^github.com$|\.github.com$/.test(url?.host ?? '') : false;
}

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  const [value] = useParsedQuery();
  const valueAsURL = URL.parse(value.trim());

  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [sizing, setSizing] = useHashParam(PARAM_SIZING);

  const dependencyTypes = (
    (depTypes ?? '').split(/\s*,\s*/) as DependencyKey[]
  ).filter(item => isDefined(item));

  const isIncludeDev = dependencyTypes.includes('devDependencies');
  const isIncludePeer = dependencyTypes.includes('peerDependencies');

  function setDependencyType(type: DependencyKey, shouldInclude: boolean) {
    const nextTypes = new Set(dependencyTypes);

    if (shouldInclude) {
      nextTypes.add(type);
    } else {
      nextTypes.delete(type);
    }

    setDepTypes([...nextTypes].toSorted().join(','));
  }

  return (
    <Pane {...props}>
      {isGithubUrl(valueAsURL) ? (
        <div className={styles.tip}>
          Note: URLs that refer to private GitHub repos or gists should use the
          URL shown when{' '}
          <ExternalLink href="https://docs.github.com/en/enterprise-cloud@latest/repositories/working-with-files/using-files/viewing-a-file#viewing-or-copying-the-raw-file-content">
            viewing the "Raw" file
          </ExternalLink>
          .
        </div>
      ) : null}
      {valueAsURL ? (
        <div className={styles.tip}>
          Note: {valueAsURL.host} must allow CORS requests from the{' '}
          {location.host} domain for this to work
        </div>
      ) : null}

      <InputHelp heading="npmgraph supports looking up:" />

      <p>It also accepts package.json:</p>
      <ul>
        <li>Drag and drop a file anywhere on the page</li>
        <li>Paste package.json (file or text)</li>
        <li>
          <FilePicker label="Choose file" /> from your computer
        </li>
      </ul>

      <Section title="Settings">
        <Toggle
          checked={isIncludeDev}
          style={{ marginTop: '1rem' }}
          onChange={() => {
            setDependencyType('devDependencies', !isIncludeDev);
          }}
        >
          Include devDependencies
        </Toggle>

        <Toggle
          checked={isIncludePeer}
          style={{ marginTop: '1rem' }}
          onChange={() => {
            setDependencyType('peerDependencies', !isIncludePeer);
          }}
        >
          Include peerDependencies
        </Toggle>

        <Toggle
          checked={sizing === ''}
          style={{ marginTop: '1rem' }}
          onChange={() => {
            setSizing(sizing === null);
          }}
        >
          Size modules by unpacked size
        </Toggle>

        <hr />

        <RegistryInput />

        <hr />

        <ColorizeInput />
      </Section>
      <footer>
        <p>
          <a
            href="https://github.com/npmgraph/npmgraph"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(utilities.brightHover, 'external-link')}
          >
            GitHub repo
          </a>
          {' | '}
          <a
            href="https://github.com/sponsors/broofa"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(utilities.brightHover, 'external-link')}
          >
            Sponsor
          </a>
        </p>
      </footer>
    </Pane>
  );
}
