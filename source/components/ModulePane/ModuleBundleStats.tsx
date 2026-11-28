import type { BundlePhobiaData } from '../../lib/fetch-types.ts';
import { SizeBar } from './SizeBar.tsx';

export function ModuleBundleStats({
  bundleInfo: { size, gzip },
}: {
  bundleInfo: BundlePhobiaData;
}) {
  return (
    <SizeBar
      title="Bundle size"
      size={gzip}
      sizeLabel="gzipped"
      total={size}
      totalLabel="minified"
    />
  );
}
