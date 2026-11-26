import type { ReactNode, SyntheticEvent } from 'react';
import { $$optional } from 'select-dom';
import { patchHash } from '../../hooks/useLocation.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { sectionName } from '../../hooks/useSectionTarget.ts';
import { PaneType, PARAM_SECTION, PARAM_TAB } from '../../lib/constants.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import { DocumentSection } from './DocumentSection.tsx';
import * as styles from './ReportItem.module.css';

// Sections the user opened or closed, to restore them when the pane is shown again
const toggled = new Map<string, boolean>();

// Remember the toggled section (only what differs from the default, which may change with the data)
// and, like in the report-only view, make a single open section linkable
function storeOpenSection(toggleKey: string, isOpenByDefault: boolean) {
  return (event: SyntheticEvent<HTMLDetailsElement>) => {
    if (event.currentTarget.open === isOpenByDefault) {
      toggled.delete(toggleKey);
    } else {
      toggled.set(toggleKey, event.currentTarget.open);
    }

    const [firstItem, moreThanOpenOpen] = $$optional(
      'details[data-report-item][open]',
    );
    const section = moreThanOpenOpen
      ? null
      : // Also update when closing, since the one left open may be a different section
        // eslint-disable-next-line unicorn/dom-node-dataset -- No greppability
        firstItem?.getAttribute('data-report-item');

    // The section only makes sense together with its tab
    patchHash(parameters => {
      parameters.set(PARAM_TAB, PaneType.REPORT);
      if (section) {
        parameters.set(PARAM_SECTION, section);
      } else {
        parameters.delete(PARAM_SECTION);
      }
    });
  };
}

export function ReportItem({
  title,
  count,
  warn = false,
  description,
  open = false,
  children,
}: {
  title: string;
  count?: number | string;
  warn?: boolean;
  description?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) {
  const [isReportOnly] = useReportOnly();
  const [query] = useQuery();
  const name = sectionName(title);
  const toggleKey = `${query.join(',')}|${name}`;
  const body = (
    <>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </>
  );

  return isReportOnly ? (
    <DocumentSection title={title} count={count} warn={warn}>
      {body}
    </DocumentSection>
  ) : (
    <CollapsibleSection
      open={toggled.get(toggleKey) ?? open}
      warn={warn}
      title={title}
      count={count}
      data-report-item={name}
      onToggle={storeOpenSection(toggleKey, open)}
    >
      {body}
    </CollapsibleSection>
  );
}
