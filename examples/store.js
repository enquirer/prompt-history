var path = require('path');
var Prompt = require('prompt-base');
var history = require('..');

// Create the prompt
var prompt = history(new Prompt({
  name: 'number',
  message: 'Favorite number?',
  path: path.join(__dirname, 'history-store.json')
}));

// Run the prompt
prompt.run()
  .then(function(answer) {
    console.log({number: answer});
  })
  .catch(console.log)
