import { PARAM_COLORIZE } from '../../lib/constants.ts';
import useHashParam from '../../lib/useHashParam.ts';
import colorizers, { getColorizer } from './colorizers/index.ts';

import * as styles from './ColorizeInput.module.scss';

export default function ColorizeInput() {
  const [colorize, setColorize] = useHashParam(PARAM_COLORIZE);

  const options = [
    <option key="none" value="">
      None
    </option>,
    ...colorizers.map(colorizer => (
      <option key={colorizer.name} value={colorizer.name}>
        {colorizer.title}
      </option>
    )),
  ];

  const colorizer = getColorizer(colorize ?? '');
  const legend = colorizer?.legend?.();

  return (
    <>
      <label className={styles.colorizeUi}>
        <span style={{ flexGrow: 0 }}>Colorize by:</span>
        <select
          style={{ flexGrow: 1 }}
          value={colorize ?? ''}
          onChange={event => {
            setColorize(event.target.value);
          }}
        >
          {options}
        </select>
      </label>

      {legend ? <div className={styles.colorizeKey}>{legend}</div> : null}
    </>
  );
}
