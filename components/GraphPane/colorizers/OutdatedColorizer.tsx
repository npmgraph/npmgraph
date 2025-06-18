import { diff } from 'semver';
import type Module from '../../../lib/Module.js';
import { getNPMPackument } from '../../../lib/PackumentCache.js';
import { COLORIZE_COLORS } from '../../../lib/constants.js';
import { LegendColor } from './LegendColor.js';
import type { SimpleColorizer } from './index.js';

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

    let outdated;
    try {
      outdated = diff(module.version, latestVersion);
    } catch (err) {
      console.error(err);
      return '';
    }

    switch (outdated) {
      case 'major':
        return COLORIZE_COLORS[0];
      case 'minor':
        return COLORIZE_COLORS[1];
      case 'patch':
        return COLORIZE_COLORS[2];
      case null:
        return COLORIZE_COLORS[3];
      default:
        return '';
    }
  },
} as SimpleColorizer;
