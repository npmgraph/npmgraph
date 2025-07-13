import { PARAM_COLORIZE } from '../../lib/constants.js';
import useHashParam from '../../lib/useHashParam.js';
import colorizers, { getColorizer } from './colorizers/index.js';

import './ColorizeInput.scss';

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
        id="colorize-ui"
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

      {legend ? <div id="colorize-key">{legend}</div> : null}
    </>
  );
}
