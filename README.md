# NPMGraph

A tool for exploring NPM modules and dependencies.

**Available online at https://npmgraph.js.org/.**

## Running locally

### Install

```shell
$ git clone https://github.com/npmgraph/npmgraph.git
$ cd npmgraph
$ npm install
```

Once installed, you may either run it using Parcel's dev server, or you can
build the static version and host on a web server of your choosing.

### Run with Parcel dev server

```
$ npm start
# (... then open http://localhost:1234 in your browser of choice)
```

### Run with webserver (static-server in this case) serving bundled files

```
$ npm run build
# etc...

$ npx static-server docs
# (... then open http://localhost:9080 in your browser of choice)
```

