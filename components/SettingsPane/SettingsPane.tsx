import type { HTMLProps } from 'react';
import { PARAM_DEPENDENCIES, PARAM_SIZING } from '../../lib/constants.ts';
import { isDefined } from '../../lib/guards.ts';
import useHashParam from '../../lib/useHashParam.ts';
import type { DependencyKey } from '../GraphDiagram/graph_util.ts';
import { Pane } from '../Pane.tsx';
import { Toggle } from '../Toggle.tsx';
import ColorizeInput from '../GraphPane/ColorizeInput.tsx';
import RegistryInput from '../InfoPane/RegistryInput.tsx';
import './SettingsPane.scss';

export default function SettingsPane(props: HTMLProps<HTMLDivElement>) {
  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [sizing, setSizing] = useHashParam(PARAM_SIZING);

  const dependencyTypes = (
    (depTypes ?? '').split(/\s*,\s*/) as DependencyKey[]
  ).filter(isDefined);

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

      <hr />

      <RegistryInput />

      <hr />

      <ColorizeInput />
    </Pane>
  );
}
