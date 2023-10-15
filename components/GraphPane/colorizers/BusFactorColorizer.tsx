import React from 'react';
import Module from '../../../lib/Module.js';
import { COLORIZE_COLORS } from '../../../lib/constants.js';
import { LegendColor } from './LegendColor.js';
import { SimpleColorizer } from './index.js';

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
    const bus = Math.min(module?.package.maintainers?.length ?? 1, 4);
    return COLORIZE_COLORS[bus - 1];
  },
} as SimpleColorizer;
