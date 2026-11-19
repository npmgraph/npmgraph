// The only static entry point. It must not import anything from the app: a syntax error in any app module would otherwise stop this check from running

function isValidJS(src: string) {
  try {
    // eslint-disable-next-line no-new-func, no-new, react-doctor/no-eval -- Only called with hard-coded snippets, to detect syntax support
    new Function(src);
    return true;
  } catch {
    return false;
  }
}

// LocalStorage may not work if cookies are disabled. See #202
function hasLocalStorage() {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch {
    return false;
  }
}

// Various features we depend on that have triggered bugsnag errors in the past
function detectFeatures() {
  const features = {
    '||= (Logical Or)': isValidJS('a ||= 123'),
    'AbortSignal.timeout': globalThis.AbortSignal?.timeout,
    'Map.groupBy': globalThis.Map?.groupBy,
    'URL.parse': globalThis.URL?.parse,
    fetch: globalThis.fetch,
    localStorage: hasLocalStorage(),
    Promise: globalThis.Promise,
  };

  return Object.entries(features)
    .filter(([, isSupported]) => !isSupported)
    .map(([name]) => name);
}

function renderUnsupported(unsupported: string[]) {
  const parameters = new URLSearchParams(
    unsupported.map(value => ['unsupported', value]),
  );
  const frame = document.createElement('iframe');
  frame.src = `unsupported.html?${parameters}`;
  frame.style.cssText = 'border: 0; width: 100%; height: 100vh';
  document.body.append(frame);
}

// The app is a separate chunk: it never loads on unsupported browsers, and a syntax error in it can't affect the check above
const unsupported = detectFeatures();
if (unsupported.length > 0) {
  renderUnsupported(unsupported);
} else {
  void import('./index.tsx');
}
