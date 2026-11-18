import { difference, isGreaterThan } from 'verkit';
import type Module from '../../lib/Module.ts';
import { getNPMPackument } from '../../lib/PackumentCache.ts';
import { colors } from './colors.ts';
import { LegendColor } from './LegendColor.tsx';
import type { SimpleColorizer } from './types.ts';

export default {
  title: 'Outdated Level',
  name: 'outdated',

  legend() {
    return (
      <>
        <LegendColor color="green">Module is up to date</LegendColor>
        <LegendColor color="yellow">PATCH updates available</LegendColor>
        <LegendColor color="orange">MINOR updates available</LegendColor>
        <LegendColor color="red">MAJOR updates available</LegendColor>
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
      return colors.green;
    }

    let outdated;
    try {
      outdated = difference(module.version, latestVersion);
    } catch (error) {
      console.error(error);
      return '';
    }

    switch (outdated) {
      case 'major':
      case 'premajor':
        return colors.red;
      case 'minor':
      case 'preminor':
        return colors.orange;
      case 'patch':
      case 'prepatch':
      case 'prerelease':
        return colors.yellow;
      case null:
        return colors.green;
    }
  },
} as SimpleColorizer;
