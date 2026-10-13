import { report } from './bugsnag.ts';
import { flash } from './flash.ts';

const RETRY_DELAY_MS = 1000;

class ChunkLoadError extends Error {
  override name = 'ChunkLoadError';
}

/**
 Run a dynamic `import()`, retrying once on failure. A persistent failure is
 reported as a `ChunkLoadError` and the user is prompted to reload.
 */
export async function importWithDiagnostics<T>(
  name: string,
  load: () => Promise<T>,
): Promise<T> {
  try {
    return await load();
  } catch {
    // Retry once to ride out transient network failures
  }

  await new Promise<void>(resolve => {
    setTimeout(resolve, RETRY_DELAY_MS);
  });

  try {
    return await load();
  } catch (error_) {
    report.error(
      new ChunkLoadError(`Failed to load chunk "${name}"`, { cause: error_ }),
    );
    flash(
      'Part of the app failed to load. Please reload the page to get the latest version.',
    );
    throw error_;
  }
}
