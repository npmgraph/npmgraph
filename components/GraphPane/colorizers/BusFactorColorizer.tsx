import React from 'react';
import type Module from '../../../lib/Module.js';
import { COLORIZE_COLORS } from '../../../lib/constants.js';
import { LegendColor } from './LegendColor.js';

export default {
  title: 'Maintainer Count',
  name: 'bus',

  legend() {
    return (
      <>
        <LegendColor color="0">1 Maintainer</LegendColor>
        <LegendColor color="1">2 Maintainers</LegendColor>
        <LegendColor color="2">3 Maintainers</LegendColor>
        <LegendColor color="3">4+ Maintainers</LegendColor>
      </>
    );
  },

  async colorForModule(module: Module) {
    const bus = Math.min(module.maintainers.length, 4);
    return COLORIZE_COLORS[Math.max(0, bus - 1)];
  },
};
