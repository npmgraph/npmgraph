import { useEffect, useId, useRef, useState, type HTMLProps } from 'react';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { cn } from '../../lib/dom.ts';
import { PARAM_DEPENDENCIES, PARAM_SIZING } from '../../lib/constants.ts';
import useCustomModuleLinks, {
  DEFAULT_CUSTOM_MODULE_LINKS,
} from '../../hooks/useCustomModuleLinks.ts';
import type { DependencyKey } from '../../lib/graph-util.ts';
import {
  getCustomModuleLinksError,
  parseCustomModuleLinks,
} from '../ModulePane/module-links.ts';
import ColorizeInput from '../ReportPane/ColorizeInput.tsx';
import RegistryInput from '../InfoPane/RegistryInput.tsx';
import { Pane } from '../ui/Pane.tsx';
import { CollapsibleSection } from '../ui/Section.tsx';
import { Toggle } from '../ui/Toggle.tsx';
import { Button, ButtonGroup } from '../Button.tsx';
import * as styles from './ViewPane.module.css';

export default function ViewPane(props: HTMLProps<HTMLDivElement>) {
  const [customLinks, setCustomLinks] = useCustomModuleLinks();
  const [shouldOpenPreferences] = useState(
    () => customLinks !== DEFAULT_CUSTOM_MODULE_LINKS,
  );
  const customLinksRef = useRef<HTMLTextAreaElement>(null);
  const customLinksId = useId();
  const hasDefaultLinks = customLinks === DEFAULT_CUSTOM_MODULE_LINKS;
  const [dependencyTypes, setDepTypes] = useQueryState(
    PARAM_DEPENDENCIES,
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [sizing, setSizing] = useQueryState(PARAM_SIZING);
  const customLinksError = getCustomModuleLinksError(customLinks);

  useEffect(() => {
    customLinksRef.current?.setCustomValidity(customLinksError);
  }, [customLinksError]);

  const isIncludeDev = dependencyTypes.includes('devDependencies');
  const isIncludePeer = dependencyTypes.includes('peerDependencies');

  function setDependencyType(type: DependencyKey, shouldInclude: boolean) {
    const nextTypes = new Set<string>(dependencyTypes);

    if (shouldInclude) {
      nextTypes.add(type);
    } else {
      nextTypes.delete(type);
    }

    void setDepTypes([...nextTypes].toSorted());
  }

  return (
    <Pane {...props}>
      <Toggle
        checked={isIncludeDev}
        onChange={() => {
          setDependencyType('devDependencies', !isIncludeDev);
        }}
      >
        Include devDependencies
      </Toggle>

      <Toggle
        checked={isIncludePeer}
        onChange={() => {
          setDependencyType('peerDependencies', !isIncludePeer);
        }}
      >
        Include peerDependencies
      </Toggle>

      <Toggle
        checked={sizing === ''}
        onChange={() => {
          void setSizing(sizing === null ? '' : null);
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
        open={shouldOpenPreferences}
      >
        <div className={styles.customLinksHeader}>
          <label htmlFor={customLinksId}>
            Custom link providers for Module tab
          </label>
          {!hasDefaultLinks && (
            <Button
              onClick={() => {
                setCustomLinks(DEFAULT_CUSTOM_MODULE_LINKS);
              }}
            >
              Reset to defaults
            </Button>
          )}
        </div>
        <textarea
          ref={customLinksRef}
          id={customLinksId}
          aria-label="Custom link providers for Module tab"
          className={cn(
            styles.customLinks,
            hasDefaultLinks ? styles.customLinksDefault : undefined,
          )}
          placeholder="npmx,https://npmx.dev/package/{name}@{version}"
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
        <div className={styles.customLinksPreviewRow}>
          Preview
          <ButtonGroup
            aria-label="Preview of Module tab link buttons"
            className={styles.customLinksPreview}
            role="group"
          >
            {parseCustomModuleLinks(customLinks, {
              name: 'package',
              version: '1.0.0',
              repository: 'https://example.com/repository',
              homepage: 'https://example.com/homepage',
            }).map(({ label }) => (
              <Button key={label} disabled>
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <p className={styles.customLinksHelp}>
          CSV: one link per line with label,URL columns.
          <br />
          {'{name} and {version} are URL-encoded;'}
          <br />
          {
            '{+name} and {+version} preserve reserved characters, e.g. @eslint/css'
          }
        </p>
      </CollapsibleSection>
    </Pane>
  );
}
