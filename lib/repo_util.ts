import hostedGitInfo from 'hosted-git-info';
import type Module from './Module.js';

/**
 * Extracts and normalizes repository URL from a module's package.json metadata.
 *
 * Tries multiple sources in priority order:
 * 1. repository field
 * 2. homepage field
 * 3. bugs field
 *
 * Supports various formats including GitHub, GitLab, Bitbucket, and Gist.
 * Handles URLs with path suffixes (e.g., /issues, /pulls) by stripping them.
 *
 * @param module - The module to extract repository URL from
 * @returns The normalized repository URL, or undefined if none found
 */
export function getRepoUrlForModule(module: Module): string | undefined {
  const { homepage, bugs, repository } = module.package;

  const parse = (url?: string) => {
    if (!url) return undefined;

    // Try parsing the URL directly
    const info = hostedGitInfo.fromUrl(url);
    if (info) return info.browse();

    // Fallback: strip path suffixes and try again
    const baseUrl = url.replace(
      /\/(issues|pulls|wiki|tree|blob|commit|releases).*$/,
      '',
    );
    if (baseUrl !== url) {
      return hostedGitInfo.fromUrl(baseUrl)?.browse();
    }

    return undefined;
  };

  return (
    parse(typeof repository === 'string' ? repository : repository?.url) ??
    parse(homepage) ??
    parse(typeof bugs === 'string' ? bugs : bugs?.url)
  );
}
