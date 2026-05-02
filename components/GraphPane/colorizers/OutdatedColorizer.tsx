import { diff, gt } from 'semver';
import type Module from '../../../lib/Module.ts';
import { getNPMPackument } from '../../../lib/PackumentCache.ts';
import { COLORIZE_COLORS } from '../../../lib/constants.ts';
import { LegendColor } from './LegendColor.tsx';
import type { SimpleColorizer } from './index.ts';

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
    if (module.isLocal || module.isStub) return '';

    const manifest = await getNPMPackument(module.name);

    const latestVersion = manifest?.['dist-tags']?.latest ?? '';

    // Bail out early if the module is not behind the latest version.
    // Using gt() instead of diff() so that prerelease versions (e.g.
    // 1.0.0-rc.12 < 1.0.0) are compared correctly.
    if (!gt(latestVersion, module.version)) {
      return COLORIZE_COLORS[3];
    }

    let outdated;
    try {
      outdated = diff(module.version, latestVersion);
    } catch (err) {
      console.error(err);
      return '';
    }

    switch (outdated) {
      case 'major':
      case 'premajor':
        return COLORIZE_COLORS[0];
      case 'minor':
      case 'preminor':
        return COLORIZE_COLORS[1];
      case 'patch':
      case 'prepatch':
      case 'prerelease':
        return COLORIZE_COLORS[2];
      default:
        return COLORIZE_COLORS[3];
    }
  },
} as SimpleColorizer;
