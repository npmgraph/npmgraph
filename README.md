# npmgraph

A tool for exploring npm modules and dependencies. Available online at https://npmgraph.js.org/.

**Be sure to check out [the new npmgraph CLI](https://github.com/npmgraph/npmgraph-cli).**

## URL API

`npmgraph` diagrams can be configured using the URL parameters below.

`q` and `registry` are search parameters. All other parameters are stored in the URL hash, using normal URL query parameter encoding.

### `q` (search parameter)

Comma-separated list of npm module names, optionally with a version or version range, URLs to `package.json` files, GitHub repository URLs, or GitHub `user/repo` shorthand. Append `#ref` to the shorthand to select a branch or tag; otherwise, the default branch is used. Encode `#` as `%23` in the URL.

**Example**: Graph the `axios` module (official npm registry):

<a href="https://npmgraph.js.org/?q=axios">npmgraph.js.org<br>?`q=axios`</a>

**Example**: Graph a GitHub branch:

https://npmgraph.js.org/?q=npmgraph%2Fnpmgraph%23drop-hooks

### `registry` (search parameter)

The npm-compatible registry URL to use when loading packages. Defaults to `https://registry.npmjs.org`; the default is omitted from the URL.

**Example**: Graph `axios` using a custom registry:

<a href="https://npmgraph.js.org/?q=axios&amp;registry=https%3A%2F%2Fregistry.example.com">npmgraph.js.org<br>?`q=axios`<br>&amp;`registry=https%3A%2F%2Fregistry.example.com`</a>

### `collapse` (hash param)

Comma-separated list of module names whose subtrees should be collapsed. A name collapses every matching version in the graph.

**Example**: Graph `axios`, collapsing the `form-data` and `https-proxy-agent` subtrees

<a href="https://npmgraph.js.org/?q=axios#collapse=form-data%2Chttps-proxy-agent">npmgraph.js.org<br>?`q=axios`<br>#`collapse=form-data%2Chttps-proxy-agent`</a>

### `color` (hash param)

"Colorization" mode (a.k.a "Colorize by..." field in UI). Currently supports the following values:

| `color=...`  | Graph nodes colored by...                                                               |
| ------------ | --------------------------------------------------------------------------------------- |
| `moduleType` | Module format inferred from package metadata (CommonJS, ESM, dual, or TypeScript types) |
| `bus`        | Number of maintainers ("bus" = [bus factor](https://en.wikipedia.org/wiki/Bus_factor))  |
| `outdated`   | How far behind the latest version the module is (major, minor, or patch)                |

**Example**: Graph `axios`, colorize by module type:

<a href="https://npmgraph.js.org/?q=axios#color=moduleType">npmgraph.js.org<br>?`q=axios`<br>#`color=moduleType`</a>

### `deps` (hash param)

Comma-separated list of additional dependency types to include in the graph.

`dependencies` and `optionalDependencies` are always included throughout the graph.

| `deps=...`         | Additionally included                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| `devDependencies`  | Dev dependencies of top-level modules                                       |
| `peerDependencies` | Peer dependencies of all modules; optional peers only for top-level modules |

**Example**: Graph `axios`, include `devDependencies`:

<a href="https://npmgraph.js.org/?q=axios#deps=devDependencies">npmgraph.js.org<br>?`q=axios`<br>#`deps=devDependencies`</a>

**Example**: Graph `axios`, include `devDependencies` and `peerDependencies`:

<a href="https://npmgraph.js.org/?q=axios#deps=devDependencies%2CpeerDependencies">npmgraph.js.org<br>?`q=axios`<br>#`deps=devDependencies%2CpeerDependencies`</a>

### `hide` (hash param)

Set to `graph` to show only the report.

**Example**: Show only the report for `axios`

<a href="https://npmgraph.js.org/?q=axios#hide=graph">npmgraph.js.org<br>?`q=axios`<br>#`hide=graph`</a>

### `packages` (hash param, **JSON-encoded**)

JSON-encoded array of package objects to load as local modules. Each object must have a string `name`; package fields not supported by the app are ignored.

The legacy `package_json` hash key is not read by the app; use `packages` to include local package data.

**Example**: Graph that includes custom "foo" and "bar" modules, with "foo" as the root module.

<a href="https://npmgraph.js.org/?q=foo%401.2.3#packages=%5B%7B%22name%22%3A%22foo%22%2C%22version%22%3A%221.2.3%22%2C%22dependencies%22%3A%7B%22axios%22%3A%220.18.0%22%2C%22bar%22%3A%223.2.1%22%7D%7D%2C%7B%22name%22%3A%22bar%22%2C%22version%22%3A%223.2.1%22%2C%22dependencies%22%3A%7B%22debug%22%3A%222.6.9%22%7D%7D%5D">npmgraph.js.org<br>?`q=foo@1.2.3`<br>#`packages=&#91;{"name":"foo","version":"1.2.3","dependencies":{"axios":"0.18.0","bar":"3.2.1"}},{"name":"bar","version":"3.2.1","dependencies":{"debug":"2.6.9"}}&#93;`</a>

Generated with:

```js
const fooPackage = {
  // package.json for "foo"
  name: 'foo',
  version: '1.2.3',
  dependencies: { axios: '0.18.0', bar: '3.2.1' },
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

**Example**: Show the release timeline of `follow-redirects`

<a href="https://npmgraph.js.org/?q=axios#tab=module&amp;section=release+timeline&amp;select=follow-redirects">npmgraph.js.org<br>?`q=axios`<br>#`tab=module`<br>&amp;`section=release+timeline`<br>&amp;`select=follow-redirects`</a>

**Example**: Show only the report for `axios`, at its licenses section

<a href="https://npmgraph.js.org/?q=axios#hide=graph&amp;section=licenses">npmgraph.js.org<br>?`q=axios`<br>#`hide=graph`<br>&amp;`section=licenses`</a>

### `select` (hash param)

Highlight a module or category of modules in the graph. Selection is based on modules currently in the graph.

Values should have one of the following forms:

| `select=...`                   | Description                          |
| ------------------------------ | ------------------------------------ |
| `exact:<module key>`           | Select a specific module             |
| `name:<module name>`           | Select modules by name, all versions |
| `license:<license string>`     | Select modules by license            |
| `maintainer:<maintainer name>` | Select modules by maintainer name    |

**Example**: Graph `axios`, selecting `form-data@4`

<a href="https://npmgraph.js.org/?q=axios#select=form-data%404">npmgraph.js.org<br>?`q=axios`<br>#`select=form-data%404`</a>

### `sizing` (hash param)

If present, modules will be scaled to reflect their unpacked size.

**Example**: Graph `axios`, size modules by unpacked size

<a href="https://npmgraph.js.org/?q=axios#sizing">npmgraph.js.org<br>?`q=axios`<br>#`sizing`</a>

### `tab` (hash param)

Inspector tab to open. One of `report`, `module`, or `view`; or `none` to close the inspector. The Info pane is not represented by a URL value.

**Example**: Graph `axios`, showing the report tab

<a href="https://npmgraph.js.org/?q=axios#tab=report">npmgraph.js.org<br>?`q=axios`<br>#`tab=report`</a>

**Example**: Graph `axios`, close the inspector

<a href="https://npmgraph.js.org/?q=axios#tab=none">npmgraph.js.org<br>?`q=axios`<br>#`tab=none`</a>

## Running locally

`npmgraph` is built with `vite`. To run in your local dev environment:

```shell
$ git clone https://github.com/npmgraph/npmgraph.git
$ cd npmgraph
$ npm install
$ npm start
```
