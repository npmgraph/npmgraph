import { PARAM_COLORIZE } from '../../lib/constants.ts';
import useHashParam from '../../lib/useHashParam.ts';
import colorizers, { getColorizer } from './colorizers/index.ts';

import * as styles from './ColorizeInput.module.scss';

export default function ColorizeInput() {
  const [colorize, setColorize] = useHashParam(PARAM_COLORIZE);

  const options = [
    <option value="" key="none">
      None
    </option>,
    ...colorizers.map(colorizer => (
      <option value={colorizer.name} key={colorizer.name}>
        {colorizer.title}
      </option>
    )),
  ];

  const colorizer = getColorizer(colorize ?? '');
  const legend = colorizer?.legend?.();

  return (
    <>
      <label
        className={styles.colorizeUi}
        style={{ display: 'flex', alignItems: 'baseline' }}
      >
        <span style={{ flexGrow: 0 }}>Colorize by:</span>
        <select
          style={{ flexGrow: 1 }}
          value={colorize ?? ''}
          onChange={e => setColorize(e.target.value)}
        >
          {options}
        </select>
      </label>

      {legend ? <div className={styles.colorizeKey}>{legend}</div> : null}
    </>
  );
}
