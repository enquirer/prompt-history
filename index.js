'use strict';

var Paginator = require('terminal-paginator');
var DataStore = require('data-store');
var cursor = require('cli-cursor');
var log = require('log-utils');

/**
 * Prompt plugin to allow keeping a history of answers that user's are able to choose from
 * when hitting "tab".
 *
 * ```js
 * var Prompt = require('prompt-base');
 * var prompt = new Prompt({
 *   name: 'username',
 *   message: 'What is your username?'
 * });
 *
 * prompt.use(history({limit: 10, store: 'my-username-prompt'}));
 *
 * prompt.ask(function(answer) {
 *   console.log('answer', answer);
 * });
 * ```
 * @name history
 * @param  {Object} `config` Configuration for setting the [data-store][] and limit stored answers
 * @param  {String|Object} `config.store` Provide either the name of a [data-store][] to use or a [data-store][] instance that has already been setup.
 * @param  {Number} `config.limit` Limit the amount of answers stored in the history. Use 0 to specify unlimited. Defaults to 5.
 * @return {Function} Returns the plugin function that is passed to `prompt.user`
 * @api public
 */

module.exports = function history(config) {
  var opts = Object.assign({limit: 5}, config);
  if (!opts.store) {
    throw new Error('expected "store" to be a string or instance of data-store');
  }

  const store = typeof opts.store === 'string' ? new DataStore(opts.store) : opts.store;

  return function plugin(prompt) {
    let restore = function() {};

    // override onKeypress to handle escaping when in tabbing mode
    this.define('onKeypress', function(event) {
      let self = this;
      Promise.resolve(this.rl.line ? this.validate(this.rl.line) : true)
        .then(function(state) {
          if (event.key.name === 'tab') {
            self.onTabKey(event);
            return;
          } else if (self.status === 'tabbing') {
            if (event.key.name === 'escape') {
              restore();
              return;
            }
            self.move(event.key.name, event);
            return;
          }
          self.render(state);
        });
    });

    // override onSubmit to handle hitting "enter" when in tabbing mode
    const onSubmit = this.onSubmit;
    this.define('onSubmit', function(input) {
      if (this.status === 'tabbing') {
        this.answer = this.question.getAnswer();
        if (!this.validate(this.answer)) {
          return;
        }
        restore(this.answer);
        return;
      }
      let answer = this.question.getAnswer(input);
      let history = store.get('history') || [];
      let idx = history.indexOf(answer);
      if (idx !== -1) {
        history.splice(idx, 1);
      }

      history.unshift(answer);
      if (opts.limit && history.length > opts.limit) {
        history.pop();
      }

      store.set('history', history);
      return onSubmit.apply(this, arguments);
    });

    // override onTabkey to handle show a history of previous answers
    this.define('onTabKey', function(event) {
      this.rl.line = this.rl.line.slice(0, -1);
      if (this.status !== 'tabbing') {
        let self = this;
        let history = store.get('history');
        if (!history || history.length === 0) {
          return this.render('No history for this question yet.');
        }

        // capture current methods to allow restoring when escape is hit
        const getAnswer = this.question.getAnswer;
        const render = this.render;
        restore = function(line) {
          self.status = 'pending';
          self.question.getAnswer = getAnswer;
          self.define('render', render);
          self.rl.line = line || self.rl.line;
          cursor.show();
          self.render();
        };

        // setup choices based on history
        this.position = 0;
        this.status = 'tabbing';
        this.paginator = new Paginator(this.options.pageSize);
        this.question.addChoices(history);
        this.choices.options.symbol = '';
        this.question.getAnswer = function() {
          let choice = self.choices.getChoice(self.position);
          if (choice) {
            return choice.disabled ? false : choice.value;
          }
        };

        this.define('render', function(state) {
          let append = typeof state === 'string'
            ? log.red('>> ') + state
            : '';

          let message = this.message;
          if (this.status === 'answered') {
            message += log.cyan(this.answer);
          } else {
            let str = this.choices.render(this.position);
            message += '\n' + this.paginator.paginate(str, this.position);
          }

          this.ui.render(message, append);
        });

      } else {
        this.move('down');
      }
      cursor.hide();
      this.render();
    });
  };
};
