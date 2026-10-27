# npmgraph

A tool for exploring npm modules and dependencies. Available online at https://npmgraph.js.org/.

**Be sure to check out [the new npmgraph CLI](https://github.com/npmgraph/npmgraph-cli).**

## URL API

`npmgraph` diagrams can be configured using the URL parameters below.

`q` and `registry` are search parameters. All other parameters are stored in the URL hash, using normal URL query parameter encoding.

### `q` (search parameter)

Comma-separated list of npm module names, optionally with a version or version range, URLs to `package.json` files, or GitHub `user/repo` shorthand.

**Example**: Graph the `send` module (official NPM registry):

https://npmgraph.js.org/?q=send

### `registry` (search parameter)

The npm-compatible registry URL to use when loading packages. Defaults to `https://registry.npmjs.org`; the default is omitted from the URL.

**Example**: Graph `send` using a custom registry:

https://npmgraph.js.org/?q=send&registry=https%3A%2F%2Fregistry.example.com

### `collapse` (hash param)

Comma-separated list of module names whose subtrees should be collapsed. A name collapses every matching version in the graph.

**Example**: Graph `send`, collapsing the `debug` and `http-errors` subtrees

https://npmgraph.js.org/?q=send#collapse=debug%2Chttp-errors

### `color` (hash param)

"Colorization" mode (a.k.a "Colorize by..." field in UI). Currently supports the following values:

| `color=...`  | Graph nodes colored by...                                                               |
| ------------ | --------------------------------------------------------------------------------------- |
| `moduleType` | Module format inferred from package metadata (CommonJS, ESM, dual, or TypeScript types) |
| `bus`        | Number of maintainers ("bus" = [bus factor](https://en.wikipedia.org/wiki/Bus_factor))  |
| `outdated`   | How far behind the latest version the module is (major, minor, or patch)                |

**Example**: Graph `send`, colorize by module type:

https://npmgraph.js.org/?q=send#color=moduleType

### `deps` (hash param)

Comma-separated list of additional dependency types to include in the graph.

`dependencies` and `optionalDependencies` are always included throughout the graph. `devDependencies` are included only for top-level modules. `peerDependencies` are included when enabled, for modules throughout the graph; optional peer dependencies are not included.

**Example**: Graph `send`, include `devDependencies`:

https://npmgraph.js.org/?q=send#deps=devDependencies

**Example**: Graph `send`, include `peerDependencies`:

https://npmgraph.js.org/?q=send#deps=peerDependencies

### `hide` (hash param)

If present (e.g. `...#hide`), hides the inspector panel. If `graph` (`...#hide=graph`), hides the graph and shows only the Report pane, styled like a GitHub readme with non-collapsible sections. A "Graph" tab is shown to return to the normal view. Reachable via the "Expand report" button in the Report pane.

**Example**: Graph `send`, close the inspector

https://npmgraph.js.org/?q=send@0.18.0#hide

**Example**: Show only the report for `send`

https://npmgraph.js.org/?q=send#hide=graph

### `section` (hash param)

Used with `hide=graph`: the id of the report section (its lowercased, hyphenated title) to scroll to. Set by the `#` links shown when hovering section headings.

**Example**: Jump to the licenses section

https://npmgraph.js.org/?q=send#hide=graph&section=licenses

### `packages` (hash param, **JSON-encoded**)

JSON-encoded array of package objects to load as local modules. Each object must have a string `name`; package fields not supported by the app are ignored.

The legacy `package_json` hash key is not read by the app; use `packages` to include local package data.

**Example**: Graph that includes custom "foo" and "bar" modules, with "foo" as the root module.

https://npmgraph.js.org/?q=foo%401.2.3#packages=%5B%7B%22name%22%3A%22foo%22%2C%22version%22%3A%221.2.3%22%2C%22dependencies%22%3A%7B%22send%22%3A%220.18.0%22%2C%22bar%22%3A%223.2.1%22%7D%7D%2C%7B%22name%22%3A%22bar%22%2C%22version%22%3A%223.2.1%22%2C%22dependencies%22%3A%7B%22debug%22%3A%222.6.9%22%7D%7D%5D

Generated with:

```js
const fooPackage = {
  // package.json for "foo"
  name: 'foo',
  version: '1.2.3',
  dependencies: { send: '0.18.0', bar: '3.2.1' },
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

### `select` (hash param)

Highlight a module or category of modules in the graph. Selection is based on modules currently in the graph.

Values should have one of the following forms:

|                                |                                      |
| ------------------------------ | ------------------------------------ |
| `exact:<module key>`           | Select a specific module             |
| `name:<module name>`           | Select modules by name, all versions |
| `license:<license string>`     | Select modules by license            |
| `maintainer:<maintainer name>` | Select modules by maintainer name    |

**Example**: Graph `send`, selecting `fresh@0.5.2`

https://npmgraph.js.org/?q=send@0.18.0#select=fresh%400.5.2

### `sizing` (hash param)

If present (e.g. `...#sizing`), modules will be scaled to reflect their unpacked size.

**Example**: Graph `send`, size modules by unpacked size

https://npmgraph.js.org/?q=send#sizing

## Running locally

`NPMGraph` is built with `vite`. To run in your local dev environment:

```shell
$ git clone https://github.com/npmgraph/npmgraph.git
$ cd npmgraph
$ npm install
$ npm start
```
