import type Module from '../../lib/Module.ts';
import { LegendColor } from './LegendColor.tsx';
import type { SimpleColorizer } from './types.ts';

export default {
  title: 'Maintainer Count',
  name: 'bus',

  legend() {
    return (
      <>
        <LegendColor color="red">1 Maintainer</LegendColor>
        <LegendColor color="orange">2 Maintainers</LegendColor>
        <LegendColor color="yellow">3 Maintainers</LegendColor>
        <LegendColor color="green">4+ Maintainers</LegendColor>
      </>
    );
  },

  async colorForModule(module: Module) {
    const bus = Math.min(module.maintainers.length, 4);
    return ['red', 'orange', 'yellow', 'green'][Math.max(0, bus - 1)];
  },
} as SimpleColorizer;
