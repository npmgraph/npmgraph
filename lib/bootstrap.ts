/* eslint no-restricted-syntax: ["error", { "selector": "ImportDeclaration", "message": "Any imports increase the risk of unsupported syntax introduction. KISS, it's just a feature check" }] -- Described in the rule */

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
    localStorage: hasLocalStorage(), // See issue #202
    '||= (Logical Or)': isValidJS('a ||= 123'), // Since 2020
    'AbortSignal.timeout': globalThis.AbortSignal?.timeout, // Since 2024
    'Map.groupBy': globalThis.Map?.groupBy, // Since 2024
    'URL.parse': globalThis.URL?.parse, // Since 2024
  };

  return Object.entries(features)
    .filter(([, isSupported]) => !isSupported)
    .map(([name]) => name);
}

function renderUnsupported(unsupported: string[]) {
  const url = new URL('unsupported.html', location.href);
  for (const value of unsupported) {
    url.searchParams.append('unsupported', value);
  }

  const frame = document.createElement('iframe');
  frame.src = url.href;
  frame.title = 'Unsupported features';
  frame.className = 'unsupported-frame';
  document.body.append(frame);
}

// The app is a separate chunk: it never loads on unsupported browsers, and a syntax error in it can't affect the check above
const unsupported = detectFeatures();
if (unsupported.length > 0) {
  renderUnsupported(unsupported);
} else {
  void import('./index.tsx');
}
