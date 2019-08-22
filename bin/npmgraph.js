#!/usr/bin/env node
const path = require('path');
const express = require('express');
const open = require('open');
const argv = require('minimist')(process.argv.slice(2));

const app = express();
const port = process.env.PORT || argv.port || 3003;
let packageName = '';

const getPackageName = (packlist = []) => {
  if (packlist.length > 0) return packlist[0];
};

function usage() {
  console.log(`Usage: npmgraph [--port=portnum] package_name
  --port=portnum:  server port to listen on';
  package_name: package to start dependency graph at`);
}

//handle cli params
packageName = getPackageName(argv._);
if (!packageName) {
  usage();
  process.exit(1);
}
//use remote mode
if (argv.r) {
  open(`http://npm.broofa.com?q=${packageName}`);
  process.exit(1);
}

//view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index', {name: packageName}));
app.use(express.static(path.join(__dirname, '../')));

app.listen(port, () => {
  console.log(`npmgraph listening on port ${port}!`);
  open(`http://localhost:${port}`);
});
