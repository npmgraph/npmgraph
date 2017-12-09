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

NPMGraph does a recursive walk of a module's dependency graph, fetching
dependencies using the NPM repository API.  This process is normally pretty
fast, but may take some time if you're on a slow network or the graph is
abnormally large.

Dependency information is cached on a per-module basis in LocalStorage, so
subsequent requests (especially for the same module) will benefit from this.

## Attributions

The dependency graph is drawn with the [Viz.js](https://github.com/mdaines/viz.js/) which, if you're not familiar with it, is a really slick project.  It's a must-have module for anyone interested in drawing directed graphs in JS.
