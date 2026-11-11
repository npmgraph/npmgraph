import { useQueryState } from 'nuqs';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import colorizers, { getColorizer } from '../colorizers/index.ts';
import * as styles from './ColorizeInput.module.css';

export default function ColorizeInput() {
  const [colorize, setColorize] = useQueryState(PARAM_COLORIZE);

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
        <span>Colorize by:</span>
        <select
          value={colorize ?? ''}
          onChange={event => {
            void setColorize(event.target.value || null);
          }}
        >
          {options}
        </select>
      </label>

      {legend && <div className={styles.legend}>{legend}</div>}
    </>
  );
}
