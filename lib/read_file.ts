import type { PackageJSON, PackumentVersion } from '@npm/types';
import { cacheLocalPackage, sanitizePackageKeys } from './ModuleCache.js';
import { PARAM_PACKAGES, PARAM_QUERY, UNNAMED_PACKAGE } from './constants.js';
import { flash } from './flash.js';
import { hashSet, searchSet } from './url_util.js';
import { patchLocation } from './useLocation.js';

export function isValidJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

export function loadPackageJson(json: string, filename?: string): void {
  // Parse module and insert into cache
  let pkg: PackageJSON;
  try {
    pkg = JSON.parse(json);
  } catch {
    flash(`${filename ?? 'Pasted content'} is not a valid JSON file`);
    return;
  }

  // Sanitize package contents *immediately*, so we don't risk propagating
  // possibly-sensitive fields user may have in their package.json
  pkg = sanitizePackageKeys(pkg);

  pkg.name ??= UNNAMED_PACKAGE;

  const module = cacheLocalPackage(pkg as PackumentVersion);

  // Set query, and attach package contents in hash
  const url = new URL(location.href);
  url.hash = '';
  const hash = hashSet(PARAM_PACKAGES, JSON.stringify([pkg]), url);
  const search = searchSet(PARAM_QUERY, module.key, url);
  patchLocation({ hash, search }, false);
}

export async function readFile(file: File) {
  const content = await new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(file);
  });

  loadPackageJson(content, file.name);
}
