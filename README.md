# NPMGraph

A tool for exploring NPM modules and dependencies

![image](https://user-images.githubusercontent.com/164050/31836231-6ab6faca-b589-11e7-9bb9-00ee0b8d90b4.png)

## Browser support

Runs on the latest versions of Chrome, Safari, and Firefox.  May or may not work
on Edge.

## Running Online

Available online at http://npm.broofa.com

## Local install

NPMGraph can be run directly from your local filesystem as follows:

```shell
$ npm install npmgraph

$ open node_modules/npmgraph/index.html  # To open file in your browser
```

## How it works

NPMGraph pulls dependency information from the NPM repository. For large graphs
and/or slow networks, this may take a minute or two.

Note that this process may take a minute or more, depending on the graph
complexity.  However this information module is cached in localStorage
so subsequent requests should be more or less instantaneous fast(er).

## Attributions

The dependency graph is drawn with the insanely awesome [Viz.js](https://github.com/mdaines/viz.js/).
