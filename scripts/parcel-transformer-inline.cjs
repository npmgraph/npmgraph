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

    // 3. Output JavaScript as a CommonJS module
    asset.type = 'js';

    // 4. FIX: Use a regular JavaScript string concatenation or remove the backslash
    // so the actual 'escapedContent' variable is injected right here.
    asset.setCode('module.exports = `' + escapedContent + '`;');

    // 5. Return the new JS asset
    return [asset];
  },
});
