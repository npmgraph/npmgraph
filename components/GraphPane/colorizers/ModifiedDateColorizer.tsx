import React from 'react';
import Module from '../../../lib/Module.js';
import { getModifiedDate } from '../../../lib/ModuleCache.js';
import { COLORIZE_COLORS } from '../../../lib/constants.js';
import { SimpleColorizer } from './index.js';

export default {
  title: 'Last Modified Date',
  name: 'modified',

  legend() {
    return (
      <>
        <span style={{ fontWeight: 'bold', color: COLORIZE_COLORS[3] }}>
          {'\u2B24'}
        </span>{' '}
        &lt; 1 month,
        <span style={{ color: COLORIZE_COLORS[2] }}>{'\u2B24'}</span> &lt; 6
        months,
        <span style={{ color: COLORIZE_COLORS[1] }}>{'\u2B24'}</span> &lt; 2
        years,
        <span style={{ color: COLORIZE_COLORS[0] }}>{'\u2B24'}</span> &ge; 2
        years
      </>
    );
  },

  async colorForModule(module: Module) {
    let date;
    try {
      date = await getModifiedDate(module.name);
    } catch {
      return '';
    }

    if (!date) return '';
    const age = Date.now() - date.getTime();
    if (age < 1000 * 60 * 60 * 24 * 30) return COLORIZE_COLORS[3];
    if (age < 1000 * 60 * 60 * 24 * 30 * 6) return COLORIZE_COLORS[2];
    if (age < 1000 * 60 * 60 * 24 * 365 * 2) return COLORIZE_COLORS[1];
    return COLORIZE_COLORS[0];
  },
} as SimpleColorizer;
