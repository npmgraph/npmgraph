# npmgraph

A tool for exploring npm modules and dependencies. Available online at https://npmgraph.js.org/.

**Be sure to check out [the new npmgraph CLI](https://github.com/npmgraph/npmgraph-cli).**

## URL API

`npmgraph` diagrams can be configured using the URL parameters below.

`q` and `registry` are search parameters. All other parameters are stored in the URL hash, using normal URL query parameter encoding.

### `q` (search parameter)

Comma-separated list of npm module names, optionally with a version or version range, URLs to `package.json` files, or GitHub `user/repo` shorthand.

**Example**: Graph the `vite` module (official npm registry):

<a href="https://npmgraph.js.org/?q=vite" rel="nofollow">/?<code>q=vite</code></a>

### `registry` (search parameter)

The npm-compatible registry URL to use when loading packages. Defaults to `https://registry.npmjs.org`; the default is omitted from the URL.

**Example**: Graph `vite` using a custom registry:

<a href="https://npmgraph.js.org/?q=vite&amp;registry=https%3A%2F%2Fregistry.example.com" rel="nofollow">/?<code>q=vite</code>&amp;<code>registry=https%3A%2F%2Fregistry.example.com</code></a>

### `collapse` (hash param)

Comma-separated list of module names whose subtrees should be collapsed. A name collapses every matching version in the graph.

**Example**: Graph `vite`, collapsing the `debug` and `http-errors` subtrees

<a href="https://npmgraph.js.org/?q=vite#collapse=debug%2Chttp-errors" rel="nofollow">/?<code>q=vite</code>#<code>collapse=debug%2Chttp-errors</code></a>

### `color` (hash param)

"Colorization" mode (a.k.a "Colorize by..." field in UI). Currently supports the following values:

| `color=...`  | Graph nodes colored by...                                                               |
| ------------ | --------------------------------------------------------------------------------------- |
| `moduleType` | Module format inferred from package metadata (CommonJS, ESM, dual, or TypeScript types) |
| `bus`        | Number of maintainers ("bus" = [bus factor](https://en.wikipedia.org/wiki/Bus_factor))  |
| `outdated`   | How far behind the latest version the module is (major, minor, or patch)                |

**Example**: Graph `vite`, colorize by module type:

<a href="https://npmgraph.js.org/?q=vite#color=moduleType" rel="nofollow">/?<code>q=vite</code>#<code>color=moduleType</code></a>

### `deps` (hash param)

Comma-separated list of additional dependency types to include in the graph.

`dependencies` and `optionalDependencies` are always included throughout the graph.

| `deps=...`         | Additionally included                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| `devDependencies`  | Dev dependencies of top-level modules                                       |
| `peerDependencies` | Peer dependencies of all modules; optional peers only for top-level modules |

**Example**: Graph `vite`, include `devDependencies`:

<a href="https://npmgraph.js.org/?q=vite#deps=devDependencies" rel="nofollow">/?<code>q=vite</code>#<code>deps=devDependencies</code></a>

**Example**: Graph `vite`, include `devDependencies` and `peerDependencies`:

<a href="https://npmgraph.js.org/?q=vite#deps=devDependencies%2CpeerDependencies" rel="nofollow">/?<code>q=vite</code>#<code>deps=devDependencies%2CpeerDependencies</code></a>

### `hide` (hash param)

Set to `graph` to show only the report.

**Example**: Show only the report for `vite`

<a href="https://npmgraph.js.org/?q=vite#hide=graph" rel="nofollow">/?<code>q=vite</code>#<code>hide=graph</code></a>

### `packages` (hash param, **JSON-encoded**)

JSON-encoded array of package objects to load as local modules. Each object must have a string `name`; package fields not supported by the app are ignored.

The legacy `package_json` hash key is not read by the app; use `packages` to include local package data.

**Example**: Graph that includes custom "foo" and "bar" modules, with "foo" as the root module.

<a href="https://npmgraph.js.org/?q=foo%401.2.3#packages=%5B%7B%22name%22%3A%22foo%22%2C%22version%22%3A%221.2.3%22%2C%22dependencies%22%3A%7B%22send%22%3A%220.18.0%22%2C%22bar%22%3A%223.2.1%22%7D%7D%2C%7B%22name%22%3A%22bar%22%2C%22version%22%3A%223.2.1%22%2C%22dependencies%22%3A%7B%22debug%22%3A%222.6.9%22%7D%7D%5D" rel="nofollow">/?<code>q=foo%401.2.3</code>#<code>packages=%5B%7B%22name%22%3A%22foo%22%2C%22version%22%3A%221.2.3%22%2C%22dependencies%22%3A%7B%22send%22%3A%220.18.0%22%2C%22bar%22%3A%223.2.1%22%7D%7D%2C%7B%22name%22%3A%22bar%22%2C%22version%22%3A%223.2.1%22%2C%22dependencies%22%3A%7B%22debug%22%3A%222.6.9%22%7D%7D%5D</code></a>

Generated with:

```js
const fooPackage = {
  // package.json for "foo"
  name: 'foo',
  version: '1.2.3',
  dependencies: { vite: '0.18.0', bar: '3.2.1' },
};
const barPackage = {
  // package.json for "bar"
  name: 'bar',
  version: '3.2.1',
  dependencies: { debug: '2.6.9' },
};

const url = new URL('https://npmgraph.js.org');
url.hash = new URLSearchParams({
  packages: JSON.stringify([fooPackage, barPackage]),
});
url.searchParams.set('q', `${fooPackage.name}@${fooPackage.version}`);

url.toString(); // Returns the above URL
```

### `section` (hash param)

Name (lowercase title) of a section in the inspector. When opened, the matching section is expanded (if collapsible) and scrolled into view.

Also used by the report-only view (`hide=graph`), where sections are always open and headings have a `#` link.

**Example**: Show the release timeline of `formidable@1.0.17`

<a href="https://npmgraph.js.org/?q=vite@2.4.6#tab=module&amp;section=release+timeline&amp;select=exact%3Aformidable%401.0.17" rel="nofollow">/?<code>q=vite@2.4.6</code>#<code>tab=module</code>&amp;<code>section=release+timeline</code>&amp;<code>select=exact%3Aformidable%401.0.17</code></a>

**Example**: Show only the report for `vite`, at its licenses section

<a href="https://npmgraph.js.org/?q=vite#hide=graph&amp;section=licenses" rel="nofollow">/?<code>q=vite</code>#<code>hide=graph</code>&amp;<code>section=licenses</code></a>

### `select` (hash param)

Highlight a module or category of modules in the graph. Selection is based on modules currently in the graph.

Values should have one of the following forms:

| `select=...`                   | Description                          |
| ------------------------------ | ------------------------------------ |
| `exact:<module key>`           | Select a specific module             |
| `name:<module name>`           | Select modules by name, all versions |
| `license:<license string>`     | Select modules by license            |
| `maintainer:<maintainer name>` | Select modules by maintainer name    |

**Example**: Graph `vite`, selecting `fresh@0.5.2`

<a href="https://npmgraph.js.org/?q=vite@0.18.0#select=fresh%400.5.2" rel="nofollow">/?<code>q=vite@0.18.0</code>#<code>select=fresh%400.5.2</code></a>

### `sizing` (hash param)

If present (e.g. `...#sizing`), modules will be scaled to reflect their unpacked size.

**Example**: Graph `vite`, size modules by unpacked size

<a href="https://npmgraph.js.org/?q=vite#sizing" rel="nofollow">/?<code>q=vite</code>#<code>sizing</code></a>

### `tab` (hash param)

Inspector tab to open. One of `report`, `module`, or `view`; or `none` to close the inspector. The Info pane is not represented by a URL value.

**Example**: Graph `vite`, showing the report tab

<a href="https://npmgraph.js.org/?q=vite#tab=report" rel="nofollow">/?<code>q=vite</code>#<code>tab=report</code></a>

**Example**: Graph `vite`, close the inspector

<a href="https://npmgraph.js.org/?q=vite@0.18.0#tab=none" rel="nofollow">/?<code>q=vite@0.18.0</code>#<code>tab=none</code></a>

## Running locally

`npmgraph` is built with `vite`. To run in your local dev environment:

```shell
$ git clone https://github.com/npmgraph/npmgraph.git
$ cd npmgraph
$ npm install
$ npm start
```
