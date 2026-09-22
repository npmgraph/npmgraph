import { Namer } from '@parcel/plugin';

const faviconNamer = new Namer({
  name({ bundle }) {
    if (
      bundle.type === 'png' &&
      bundle.getMainEntry().filePath.endsWith('favicon.png')
    ) {
      // The favicon must have a static name so that opensearch.xml can reference it
      return 'favicon.png';
    }
  },
});

export default faviconNamer;
