# prompt-history [![NPM version](https://img.shields.io/npm/v/prompt-history.svg?style=flat)](https://www.npmjs.com/package/prompt-history) [![NPM monthly downloads](https://img.shields.io/npm/dm/prompt-history.svg?style=flat)](https://npmjs.org/package/prompt-history)  [![NPM total downloads](https://img.shields.io/npm/dt/prompt-history.svg?style=flat)](https://npmjs.org/package/prompt-history)

> Prompt plugin to allow keeping a history of answers that user's are able to choose from when hitting tab.

![prompt-history demo](https://raw.githubusercontent.com/enquirer/prompt-history/master/docs/demo.gif)

## Usage

Require the plugin in and register it with an input prompt like [prompt-base](https://github.com/enquirer/prompt-base).

```js
var history = require('prompt-history');
var Prompt = require('prompt-base');
var prompt = new Prompt({name: 'color', message: 'What\'s your favorite color?'});
prompt.use(history({store: 'my-color-prompt', limit: 3}));
```

When a user presses the "tab" key, if there is a history already stored, they will be shown a list of previous answers to choose from. The user may press the "esc" key to cancel, or press the "enter" key to choose an answer. They will be able to modify the answer before submitting it.

```js
prompt.ask(function(answer) {
  console.log(answer);
  prompt.close();
});
```

## API

### [history](index.js#L33)

Prompt plugin to allow keeping a history of answers that user's are able to choose from when hitting "tab".

**Params**

* `config` **{Object}**: Configuration for setting the [data-store](https://github.com/jonschlinkert/data-store) and limit stored answers
* `config.store` **{String|Object}**: Provide either the name of a [data-store](https://github.com/jonschlinkert/data-store) to use or a [data-store](https://github.com/jonschlinkert/data-store) instance that has already been setup.
* `config.limit` **{Number}**: Limit the amount of answers stored in the history. Use 0 to specify unlimited. Defaults to 5.
* `returns` **{Function}**: Returns the plugin function that is passed to `prompt.user`

**Example**

```js
var Prompt = require('prompt-base');
var prompt = new Prompt({
  name: 'username',
  message: 'What is your username?'
});

prompt.use(history({limit: 10, store: 'my-username-prompt'}));

prompt.ask(function(answer) {
  console.log('answer', answer);
});
```

## About

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](https://twitter.com/doowb)

### License

Copyright © 2017, [Brian Woodward](https://github.com/doowb).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.3, on March 13, 2017._