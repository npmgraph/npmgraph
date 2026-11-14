import { Suspense, use, useMemo } from 'react';
import type Module from '../../lib/Module.ts';
import {
  fetchAdvisories,
  type Advisory,
} from '../ReportPane/reports/advisories.ts';
import { AdvisoryRow } from '../ReportPane/reports/ModuleVulnerabilities.tsx';
import { Rows } from '../ui/Row.tsx';
import { Section } from '../ui/Section.tsx';

function Advisories({ advisories }: { advisories: Promise<Advisory[]> }) {
  const list = use(advisories);
  if (list.length === 0) {
    return null;
  }

  return (
    <Section title="Vulnerabilities" count={list.length} type="warn">
      <Rows>
        {list.map(advisory => (
          <AdvisoryRow key={advisory.id} advisory={advisory} />
        ))}
      </Rows>
    </Section>
  );
}

export function ModuleAdvisories({ module }: { module: Module }) {
  const { name, version } = module;
  const advisories = useMemo(
    // eslint-disable-next-line @typescript-eslint/promise-function-async -- useMemo() can't take an async callback
    () => fetchAdvisories({ [name]: [version] }),
    [name, version],
  );

  return (
    <Suspense fallback={null}>
      <Advisories advisories={advisories} />
    </Suspense>
  );
}
