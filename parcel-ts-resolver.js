import { Resolver } from '@parcel/plugin';
import path from 'node:path';

// A custom Parcel resolver to insure imports of .ts and .tsx files work.
// Parcel's default resolver assumes typescript compilation converts .ts[x]
// extensions to .js[x].
export default new Resolver({
  async resolve({ specifier, dependency }) {
    // If the import ends with .ts or .tsx, remove it for Parcel
    if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
      const filePath = path.join(
        path.dirname(dependency.resolveFrom),
        specifier,
      );

      return { filePath };
    }

    // Let other resolvers handle this
    return null;
  },
});
