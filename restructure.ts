// One-off: moves files and rewrites relative imports (ts, tsx, js, scss).
// Run from anywhere in the repo: node restructure.ts --dry   then   node restructure.ts
import { execFileSync, execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { posix } from 'node:path';

const IS_DRY = process.argv.includes('--dry');
process.chdir(
  execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim(),
);

const hooks = [
  'lib/useActivity.ts',
  'lib/useCollapse.ts',
  'lib/useGraphSelection.ts',
  'lib/useHashParam.ts',
  'lib/useLocation.ts',
  'lib/useMeasure.ts',
  'lib/usePrevious.ts',
  'lib/useQuery.ts',
  'lib/useRegistry.ts',
  'lib/useTightScreen.ts',
  'components/useExternalInput.ts',
  'components/useExternalInput.module.scss',
  'components/useKeyboardShortcuts.ts',
];

// shared primitives that sit loose in components/
const ui = [
  ...[
    'ExternalLink',
    'Icons',
    'Pane',
    'Section',
    'Selectable',
    'Splitter',
    'Tabs',
    'Tag',
    'Toggle',
  ].flatMap(n => [`components/${n}.tsx`, `components/${n}.module.scss`]),
  'components/PieGraph.tsx',
  'components/QueryLink.tsx',
  'components/utilities.module.scss',
];

const analyzers = [
  'Analyzer.tsx',
  'analyzeLicenses.ts',
  'analyzeMaintainers.tsx',
  'analyzeModules.ts',
  'analyzePeerDependencies.tsx',
];

// Exact file moves win over directory moves
const FILES = new Map<string, string>([
  ...hooks.map(f => [f, `hooks/${posix.basename(f)}`] as [string, string]),
  ...ui.map(f => [f, `components/ui/${posix.basename(f)}`] as [string, string]),
  ...analyzers.map(
    n =>
      [
        `components/ReportPane/reports/${n}`,
        `components/ReportPane/analyzers/${n}`,
      ] as [string, string],
  ),
  // non-UI logic that already has its test in lib/
  ['components/GraphDiagram/graph_util.ts', 'lib/graph_util.ts'],

  // Uncertain, uncomment after checking who imports them:
  // ['lib/DiagramTitle.tsx', 'components/GraphDiagram/DiagramTitle.tsx'],
  // ['components/InputHelp.tsx', 'components/InfoPane/InputHelp.tsx'],
]);

// Directory moves (trailing slash); longest prefix wins
const DIRS = (
  [
    // used by GraphDiagram, ModulePane and ReportPane
    ['components/ReportPane/colorizers/', 'components/colorizers/'],
    [
      'components/ReportPane/reports/reporters/',
      'components/ReportPane/reporters/',
    ],
    // ReportItem.* and whatever is left
    ['components/ReportPane/reports/', 'components/ReportPane/'],
  ] as Array<[string, string]>
).toSorted((a, b) => b[0].length - a[0].length);

// Ad-hoc moves: node restructure.ts from=to [from=to ...] [--dry]
// (replaces the built-in lists above)
const cliMoves = process.argv.slice(2).filter(a => a.includes('='));
if (cliMoves.length > 0) {
  FILES.clear();
  DIRS.length = 0;
  for (const arg of cliMoves) {
    const [from, to] = arg.split('=', 2);
    if (from.endsWith('/')) {
      DIRS.push([from, to]);
    } else {
      FILES.set(from, to);
    }
  }
}

function mapPath(p: string) {
  const exact = FILES.get(p);
  if (exact) {
    return exact;
  }

  for (const [from, to] of DIRS) {
    if (p.startsWith(from)) {
      return to + p.slice(from.length);
    }
  }

  return p;
}

const SPEC =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|@use\s+|@forward\s+|@import\s+|\burl\(\s*)(["'])(\.{1,2}\/[^\n"']+)\2/g;

function rewrite(file: string, text: string) {
  const newFile = mapPath(file);
  let count = 0;

  const out = text.replaceAll(
    SPEC,
    (match, pre: string, q: string, spec: string) => {
      const target = posix.normalize(posix.join(posix.dirname(file), spec));
      const newTarget = mapPath(target);
      if (newFile === file && newTarget === target) {
        return match;
      }

      let rel = posix.relative(posix.dirname(newFile), newTarget);
      if (!rel.startsWith('.')) {
        rel = `./${rel}`;
      }

      if (rel === spec) {
        return match;
      }

      count++;
      return `${pre}${q}${rel}${q}`;
    },
  );

  return { out, count };
}

const tracked = new Set(
  execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean),
);

for (const from of FILES.keys()) {
  if (!tracked.has(from)) {
    console.warn(`not tracked, skipping: ${from}`);
  }
}

const moves = [...tracked]
  .map(from => [from, mapPath(from)] as const)
  .filter(([from, to]) => from !== to);

for (const [from, to] of moves) {
  if (tracked.has(to) && mapPath(to) === to) {
    throw new Error(`destination exists: ${from} -> ${to}`);
  }
}

const rewritten = new Map<string, string>();
let total = 0;
for (const file of tracked) {
  if (!/\.(tsx?|js|scss)$/.test(file)) {
    continue;
  }

  const text = readFileSync(file, 'utf8');
  const { out, count } = rewrite(file, text);
  if (out === text) {
    continue;
  }

  rewritten.set(mapPath(file), out);
  total += count;
}

for (const [from, to] of moves) {
  console.log(`${from} -> ${to}`);
}

console.log(
  `\n${moves.length} moves, ${total} imports rewritten in ${rewritten.size} files`,
);

if (!IS_DRY) {
  for (const [from, to] of moves) {
    mkdirSync(posix.dirname(to), { recursive: true });
    execFileSync('git', ['mv', from, to]);
  }

  for (const [file, text] of rewritten) {
    writeFileSync(file, text);
  }
}
