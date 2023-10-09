import React from 'react';
import Module from '../../../lib/Module.js';
import { COLORIZE_COLORS } from '../../../lib/constants.js';
import { SimpleColorizer } from './index.js';

export default {
  title: 'Maintainer Count',
  name: 'bus',

  legend() {
    return (
      <>
        <span style={{ fontWeight: 'bold', color: COLORIZE_COLORS[0] }}>
          {'\u2B24'}
        </span>{' '}
        = 1 maintainer,
        <span style={{ color: COLORIZE_COLORS[1] }}>{'\u2B24'}</span> = 2,
        <span style={{ color: COLORIZE_COLORS[2] }}>{'\u2B24'}</span> = 3,
        <span style={{ color: COLORIZE_COLORS[3] }}>{'\u2B24'}</span> = 4 or
        more
      </>
    );
  },

  async colorForModule(module: Module) {
    const bus = Math.min(module?.package.maintainers?.length ?? 1, 4);
    return COLORIZE_COLORS[bus - 1];
  },
} as SimpleColorizer;
