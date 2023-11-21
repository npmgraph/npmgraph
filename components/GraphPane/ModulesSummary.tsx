import React from 'react';
import simplur from 'simplur';
import Module from '../../lib/Module.js';
import { useGraph } from '../App/App.js';
import { Diagnostic } from './Diagnostic.js';

export function ModulesSummary() {
  const [graph] = useGraph();

  const caption = simplur`${
    graph?.entryModules.size ?? 0
  } entry module[|s] and ${
    (graph?.moduleInfos.size ?? 0) - (graph?.entryModules.size ?? 0)
  } dependent module[|s]`;

  // Gather duplicate and deprecated module info
  const modulesByName: Record<string, Module[]> = {};
  const deprecated = new Set<Module>();
  for (const moduleInfo of graph?.moduleInfos.values() ?? []) {
    const { name } = moduleInfo.module.package;
    modulesByName[name] ??= [];
    modulesByName[name].push(moduleInfo.module);

    if (moduleInfo.module.package.deprecated) {
      deprecated.add(moduleInfo.module);
    }
  }

  const multiMods = Object.entries(modulesByName)
    .filter(([, modules]) => modules.length > 1)
    .sort(([a], [b]) => a.localeCompare(b));

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
