// The only static entry point. It must not import anything from the app: a syntax error in any app module would otherwise stop this check from running
import '../index.scss';
// ?no-inline keeps the image out of this entry chunk
import imageUrl from '../images/sad-kilroy.png?no-inline';
import * as styles from './unsupported.module.css';

function isValidJS(src: string) {
  try {
    // eslint-disable-next-line no-new-func, no-new, react-doctor/no-eval -- Only called with hard-coded snippets, to detect syntax support
    new Function(src);
    return true;
  } catch {
    return false;
  }
}

// Various features we depend on that have triggered bugsnag errors in the past
function detectFeatures() {
  const unsupported: string[] = [];

  // API checks
  const features = {
    '||= (Logical Or)': isValidJS('a ||= 123'),
    'AbortSignal.timeout': globalThis.AbortSignal?.timeout,
    'Map.groupBy': globalThis.Map?.groupBy,
    'URL.parse': globalThis.URL?.parse,
    fetch: globalThis.fetch,
    globalThis: typeof globalThis !== 'undefined',
    Promise: globalThis.Promise,
  };

  for (const [name, isSupported] of Object.entries(features)) {
    if (!isSupported) {
      unsupported.push(name);
    }
  }

  // LocalStorage may not work if cookies are disabled. See #202
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch {
    unsupported.push('localStorage');
  }

  return unsupported;
}

function renderUnsupported(unsupported: string[]) {
  const root = document.createElement('div');
  root.className = styles.root;
  root.innerHTML = `
    <h1>Unsupported Features</h1>
    <p>
      It looks like your browser may have trouble running npmgraph.
      Specifically, the following features appear to be missing or disabled:
    </p>
  `;

  const list = document.createElement('ul');
  for (const name of unsupported) {
    const item = document.createElement('li');
    const code = document.createElement('code');
    code.textContent = name;
    item.append(code, ' is not supported');
    list.append(item);
  }

  root.append(list);
  root.insertAdjacentHTML(
    'beforeend',
    `
    <p>
      Make sure you're using a modern version of Chrome, Firefox, Safari, or
      Edge, and that cookies are enabled.
    </p>
    <p class="${styles.footer}">
      <a href="https://github.com/npmgraph/npmgraph" target="_blank" rel="noreferrer">npmgraph on GitHub</a>
    </p>
    <img class="${styles.sadKilroy}" width="100" src="${imageUrl}" alt="Sad Kilroy" />
  `,
  );
  document.body.append(root);
}

// The app is a separate chunk: it never loads on unsupported browsers, and a syntax error in it can't affect the check above
const unsupported = detectFeatures();
if (unsupported.length > 0) {
  renderUnsupported(unsupported);
} else {
  void import('./index.tsx');
}
