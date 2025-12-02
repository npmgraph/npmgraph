import simplur from 'simplur';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { LicenseAnalysisState } from '../analyzeLicenses.js';

export function licensesMissing({ unlicensedModules }: LicenseAnalysisState) {
  if (!unlicensedModules.length) return;

  const summary = simplur`Unlicensed modules (${unlicensedModules.length})`;

  const details = unlicensedModules
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(module => (
      <div className="zebra-row" key={module.key}>
        <Selectable value={module.key} />
      </div>
    ));

  return { type: 'warn', summary, details } as RenderedAnalysis;
}
