import { useEffect, useRef, type HTMLProps } from 'react';
import { PARAM_DEPENDENCIES, PARAM_SIZING } from '../../lib/constants.ts';
import { isDefined } from '../../lib/guards.ts';
import useCustomModuleLinks from '../../hooks/useCustomModuleLinks.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import type { DependencyKey } from '../../lib/graph-util.ts';
import { getCustomModuleLinksError } from '../ModulePane/module-links.ts';
import ColorizeInput from '../ReportPane/ColorizeInput.tsx';
import RegistryInput from '../InfoPane/RegistryInput.tsx';
import { Pane } from '../ui/Pane.tsx';
import { CollapsibleSection } from '../ui/Section.tsx';
import { Toggle } from '../ui/Toggle.tsx';
import * as styles from './ViewPane.module.scss';

export default function ViewPane(props: HTMLProps<HTMLDivElement>) {
  const [customLinks, setCustomLinks] = useCustomModuleLinks();
  const customLinksRef = useRef<HTMLTextAreaElement>(null);
  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [sizing, setSizing] = useHashParam(PARAM_SIZING);
  const customLinksError = getCustomModuleLinksError(customLinks);

  useEffect(() => {
    customLinksRef.current?.setCustomValidity(customLinksError);
  }, [customLinksError]);

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

      <CollapsibleSection
        title="Local preferences"
        open={Boolean(customLinks.trim())}
        className={styles.localPreferences}
      >
        <label>
          Custom link providers for Module tab
          <textarea
            ref={customLinksRef}
            aria-label="Custom link providers for Module tab"
            className={styles.customLinks}
            placeholder="npmx,https://npmx.dev/package/%s"
            rows={1}
            value={customLinks}
            onChange={event => {
              const { currentTarget } = event;
              currentTarget.setCustomValidity(
                getCustomModuleLinksError(currentTarget.value),
              );
              currentTarget.reportValidity();
              setCustomLinks(currentTarget.value);
            }}
          />
        </label>
        <p className={styles.customLinksHelp}>
          CSV: one link per line with label,url columns. Use %s for the package
          name or %e for its URL-encoded form.
        </p>
      </CollapsibleSection>
    </Pane>
  );
}
