import { difference, isGreaterThan, type VersionDifference } from 'verkit';
import type Module from '../../lib/Module.ts';
import { getNPMPackument } from '../../lib/PackumentCache.ts';
import { COLORIZE_COLORS } from '../../lib/constants.ts';
import { LegendColor } from './LegendColor.tsx';
import type { SimpleColorizer } from './types.ts';

// Index in COLORIZE_COLORS, by how the module version differs from the latest
const COLOR_INDEX: Record<VersionDifference, 0 | 1 | 2> = {
  major: 0,
  premajor: 0,
  minor: 1,
  preminor: 1,
  patch: 2,
  prepatch: 2,
  prerelease: 2,
};

export default {
  title: 'Outdated Level',
  name: 'outdated',

  legend() {
    return (
      <>
        <LegendColor color="3">Module is up to date</LegendColor>
        <LegendColor color="2">PATCH updates available</LegendColor>
        <LegendColor color="1">MINOR updates available</LegendColor>
        <LegendColor color="0">MAJOR updates available</LegendColor>
      </>
    );
  },

  async colorForModule(module: Module) {
    if (module.isLocal || module.isStub) {
      return '';
    }

    const manifest = await getNPMPackument(module.name);

    const latestVersion = manifest?.['dist-tags']?.latest ?? '';

    // Bail out early if the module is not behind the latest version.
    // Using gt() instead of diff() so that prerelease versions (e.g.
    // 1.0.0-rc.12 < 1.0.0) are compared correctly.
    if (!isGreaterThan(latestVersion, module.version)) {
      return COLORIZE_COLORS[3];
    }

    try {
      const outdated = difference(module.version, latestVersion);
      return COLORIZE_COLORS[outdated ? COLOR_INDEX[outdated] : 3];
    } catch (error) {
      console.error(error);
      return '';
    }
  },
} as SimpleColorizer;
