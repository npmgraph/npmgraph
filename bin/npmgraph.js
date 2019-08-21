#!/usr/bin/env node
const path = require('path');
const express = require('express');
const open = require('open');
const argv = require('minimist')(process.argv.slice(2));

const app = express();
const port = 3003;
let packageName = '';

const getPackageName = (packlist = []) => {
  if (packlist.length > 0) return packlist[0];
  console.log('Please assign packageName');
};

//handle cli params
if (argv.local) {
} else {
  packageName = getPackageName(argv._);
  if (!packageName) return;
}

//view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index', {name: packageName}));
app.use(express.static(path.join(__dirname, '../')));

app.listen(port, () => {
  console.log(`npmgraph listening on port ${port}!`);
  open('http://localhost:3003');
});
