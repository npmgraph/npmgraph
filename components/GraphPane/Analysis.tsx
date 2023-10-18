import React from 'react';
import Module from '../../lib/Module.js';
import { useGraph } from '../App/App.js';

export function Analysis() {
  const [graph] = useGraph();

  // Walk list of modules
  const moduleNameCount: Record<string, number> = {};
  const deprecated = new Set<Module>();
  for (const module of graph?.modules.values() ?? []) {
    const { name } = module.module.package;
    moduleNameCount[name] ??= 0;
    moduleNameCount[name]++;

    if (module.module.package.deprecated) {
      deprecated.add(module.module);
    }
  }

  const multiMods = Object.entries(moduleNameCount)
    .filter(([, moduleCount]) => moduleCount > 1)
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <h3>Repeated Modules</h3>
      <ul>
        {multiMods.map(([moduleName, moduleCount]) => {
          return (
            <li>
              {moduleName} {moduleCount}
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
