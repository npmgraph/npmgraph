# npmgraph

A tool for exploring npm modules and dependencies. Available online at https://npmgraph.js.org/.

**Be sure to check out [the new npmgraph CLI](https://github.com/npmgraph/npmgraph-cli).**

## URL API

`npmgraph` diagrams can be configured using the URL parameters below.

NOTE: With the exception of the `q` (query) parameter, these are **not** search parameters. These parameters are stored in the location _`hash`_, using normal URL query param encoding.

### `q` (search param)

Comma-separated list of module names or URLs.

**Example**: Graph the `send` module (official NPM registry):

https://npmgraph.js.org/?q=send

### `collapse` (hash param)

Comma-separated list of modules to collapse

** Example**: Graph `send, collapsing the `debug`and`http-errors` subtrees

https://npmgraph.js.org/?q=send#collapse=debug%2Chttp-errors

### `color` (hash param)

"Colorization" mode (a.k.a "Colorize by..." field in UI). Currently supports the following values:

| `color=...`   | Graph nodes colored by...                                                         |
| ------------- | --------------------------------------------------------------------------------- |
| `moduleType`  | `package.json#type` value                                                         |
| `bus`         | # of maintainers ("bus" = [bus factor](https://en.wikipedia.org/wiki/Bus_factor)) |
| `outdated`    | Degree of `version` outdated-ness                                                 |
| `maintenance` | npms.io score                                                                     |

**Example**: Graph `send`, colorize by module type:

https://npmgraph.js.org/?q=send#color=moduleType

### `deps` (hash param)

Comma-separated list of the _types_ dependencies to include for modules at the top-level of the graph. (Lower-level modules only ever show `dependencies`).

`dependencies` is always included.

**Example**: Graph `send`, include `devDependencies`:

https://npmgraph.js.org/?q=send#deps=devDependencies

### `hide` (hash param)

If defined (e.g. `...#hide`), hides the inspector.

**Example**: Graph `send`, close the inspector

https://npmgraph.js.org/?q=send@0.18.0#view=closed

### `packages` (hash param, **JSON-encoded**)

JSON-encoded array of `package.json` contents for any custom / proprietary modules included in the graph.

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

url.toString() // Returns the above URL
```

### `select` (hash param)

Select a module or category of modules.

Values should have one of the following forms:
| | |
|---|---|
| `exact:<module key>` | Select a specific module |
| `name:<module name>` | Select modules by name, all versions |
| `license:<license string>` | Select modules by license |
| `maintainer:<maintainer name>` | Select modules by maintainer name |

**Example**: Graph `send`, selecting `fresh@0.5.2`

https://npmgraph.js.org/?q=send@0.18.0#select=exact%3Afresh%400.5.2

### `sizing` (hash param)

If present, modules will be scaled to reflect their unpacked size

**Example**: Graph `send`, selecting `fresh@0.5.2`

https://npmgraph.js.org/?q=send#sizing

### `zoom` (hash param)

Specify zoom mode.

|     |                 |
| --- | --------------- |
| `w` | Fit view width  |
| `h` | Fit view height |

**Example**: Graph `send`, fit view width

https://npmgraph.js.org/?q=send@0.18.0#zoom=w

## Running locally

`NPMGraph` is built with `parcel`. To run in your local dev environment:

```shell
$ git clone https://github.com/npmgraph/npmgraph.git
$ cd npmgraph
$ npm install
$ npm start
```
