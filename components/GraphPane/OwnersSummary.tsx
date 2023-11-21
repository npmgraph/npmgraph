import React from 'react';
import simplur from 'simplur';
import Module from '../../lib/Module.js';
import { report } from '../../lib/bugsnag.js';
import { useGraph } from '../App/App.js';
import { Diagnostic } from './Diagnostic.js';

export function ModulesSummary() {
  const [graph] = useGraph();

  // Gather duplicate and deprecated module info
  const ownersByName: Record<string, Module[]> = {};
  const maintainersByModuleName: Record<string, Module[]> = {};
  for (const moduleInfo of graph?.moduleInfos.values() ?? []) {
    const { module } = moduleInfo;
    const { maintainers } = module.package;

    maintainersByModuleName[module.key] ??= [];
    maintainersByModuleName[module.key].push(module);

    for (const maintainer of maintainers) {
      // Legacy string type for this.  Log this so we  email or npm username?
      if (typeof maintainer === 'string') {
        report.warn(new Error(`Maintainer is a string: ${maintainer}`));
        continue;
      }

      const { name } = maintainer;
      if (!name) {
        report.warn(new Error(`Maintainer has no name: ${maintainer}`));
        continue;
      }

      ownersByName[name] ??= [];
      ownersByName[name].push(module);
    }
  }

  const multiMods = Object.entries(modulesByName)
    .filter(([, modules]) => modules.length > 1)
    .sort(([a], [b]) => a.localeCompare(b));

  const caption = simplur`${
    graph?.entryModules.size ?? 0
  } entry module[|s] and ${
    (graph?.moduleInfos.size ?? 0) - (graph?.entryModules.size ?? 0)
  } dependent module[|s]`;

  return (
    <>
      <h3>{caption}</h3>

      {multiMods.length > 0 ? (
        <Diagnostic
          message={simplur`${multiMods.length} module[|s] with multiple versions`}
        />
      ) : null}

      {deprecated.size > 0 ? (
        <Diagnostic
          message={simplur`${deprecated.size} deprecated module[|s]`}
        />
      ) : null}

      <ul>
        {multiMods.map(([moduleName, modules]) => {
          return (
            <li key={moduleName}>
              {moduleName}{' '}
              {modules
                .map(m => m.version)
                .sort()
                .join(', ')}
            </li>
          );
        })}
      </ul>
      <h3>Deprecated Modules</h3>
      <ul>
        {Array.from(deprecated)
          .sort()
          .map(module => {
            return <li>{module.key}</li>;
          })}
      </ul>
    </>
  );
}
