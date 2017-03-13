'use strict';

var history = require('../');
var Prompt = require('prompt-base');
var DataStore = require('data-store');

var store = new DataStore('history', {cwd: './tmp/example-username'});
var prompt = new Prompt({
  name: 'username',
  message: 'What is your username?'
});

prompt.use(history({limit: 10, store: store}));
prompt.ask(function(answer) {
  console.log('answer', answer);
  prompt.close();
});
