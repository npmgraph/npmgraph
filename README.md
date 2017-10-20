# NPMGraph

A tool for exploring NPM modules and dependencies

![image](https://user-images.githubusercontent.com/164050/31836231-6ab6faca-b589-11e7-9bb9-00ee0b8d90b4.png)

## Usage

**Online**

Got to http://npm.broofa.com in your browser.  Follow the instructions.

**Local file system**

NPMGraph does not require a server and may be run from your local disk as
follows:

```shell
npm install npmgraph
open node_modules/npmgraph/index.html  # To open file in your browser
```

## How it works

NPMGraph builds a dependency graph by fetching module information from the NPM
registry (via a JSON proxy server).  This may take a while the first time a
module is graphed, however the package info for each module is cached in
localStorage so subsequent requests should be more or less instantaneous
fast(er).

## Attributions
The dependency graph is drawn with [Viz.js](https://github.com/mdaines/viz.js/).
Words cannot express how fucking awesome this library is.  If you've ever had to
draw an acyclic directed graph (ADG) before, you know how difficult it is clean,
well-layed out diagrams. Viz.js makes this insanely easy.
