/* eslint-disable no-undef, import-x/no-extraneous-dependencies -- No need */
// TODO: Drop after https://github.com/parcel-bundler/parcel/issues/8481
const { Transformer } = require('@parcel/plugin');

module.exports = new Transformer({
  async transform({ asset }) {
    // 1. Grab the raw file buffer or text directly
    const rawContent = await asset.getBuffer();
    const textString = rawContent.toString('utf8');

    // 2. Escape backslashes, backticks, and string interpolation variables
    const escapedContent = textString
      .replaceAll('\\', '\\\\')
      .replaceAll('`', '\\`')
      .replaceAll('${', '\\${');

    // 3. Return a brand new asset definition that explicitly tells Parcel
    // it's JavaScript and exposes a safe 'default' symbol for scope hoisting.
    return [
      {
        type: 'js',
        content: 'export default `' + escapedContent + '`;',
        sideEffects: false,
        symbols: new Map([
          [
            'default',
            {
              local: 'default',
              loc: {
                start: { line: 1, column: 1 },
                end: { line: 1, column: 1 },
              },
            },
          ],
        ]),
      },
    ];
  },
});
