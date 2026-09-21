import type { HTMLProps } from 'react';
import { PARAM_DEPENDENCIES, PARAM_SIZING } from '../../lib/constants.ts';
import { isDefined } from '../../lib/guards.ts';
import useHashParam from '../../lib/useHashParam.ts';
import type { DependencyKey } from '../GraphDiagram/graph_util.ts';
import ColorizeInput from '../GraphPane/ColorizeInput.tsx';
import RegistryInput from '../InfoPane/RegistryInput.tsx';
import { Pane } from '../Pane.tsx';
import { Toggle } from '../Toggle.tsx';

export default function SettingsPane(props: HTMLProps<HTMLDivElement>) {
  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [sizing, setSizing] = useHashParam(PARAM_SIZING);

  const dependencyTypes = (
    (depTypes ?? '').split(/\s*,\s*/) as DependencyKey[]
  ).filter(item => isDefined(item));

  const isIncludeDev = dependencyTypes.includes('devDependencies');
  const isIncludePeer = dependencyTypes.includes('peerDependencies');

  function setDependencyType(type: DependencyKey, include: boolean) {
    const nextTypes = new Set(dependencyTypes);
    if (include) {
      nextTypes.add(type);
    } else {
      nextTypes.delete(type);
    }

    setDepTypes([...nextTypes].toSorted().join(','));
  }

  return (
    <Pane {...props}>
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
    </Pane>
  );
}
