import { all } from 'module-replacements';

export type Mapping = (typeof all.mappings)[string];

export function getReplacements(moduleName: string) {
  const mapping = all.mappings[moduleName];
  if (!mapping) {
    return { mapping: null, replacements: null };
  }

  return {
    mapping,
    replacements: mapping.replacements.map(id => all.replacements[id]),
  };
}
