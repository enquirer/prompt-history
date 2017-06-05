'use strict';

var DataStore = require('data-store');
var extend = require('extend-shallow');

module.exports = function(prompt, options) {
  if (prompt.choices && prompt.choices.length) {
    throw new Error('prompt-history can only be used with text input prompts');
  }

  var tab = prompt.actions.tab;
  var opts = extend({historyLimit: Infinity}, prompt.options, options);
  var store = opts.store || new DataStore(opts);
  var name = opts.name;
  var idx = -1;
  var status;

  prompt.rl.input.on('keypress', function(val, key) {
    if (prompt.status === 'tabbing' && val == null && key.name === 'escape') {
      prompt.rl.input.write('\x1B[?25h');
      prompt.status = status;
      prompt.rl.line = '';
    }
  });

  prompt.action('tab', function(pos, key) {
    var history = arrayify(store.get(name));
    var line = prompt.rl.line;

    if (prompt.status !== 'tabbing' && line.trim() === '' && history.length) {
      status = prompt.status;
      prompt.status = 'tabbing';
    }

    if (prompt.status === 'tabbing') {
      prompt.rl.input.write('\x1B[?25l');
      prompt.rl.line = line.slice(0, -1);

      var len = history.length;
      if (len) {
        if (key.shift === true) {
          idx -= 1;
        } else {
          idx += 1;
        }
        prompt.rl.line = history[mod(idx, len)].trim();
      }
      return this.position(pos);
    }

    if (key.shift === true && prompt.rl.line.slice(-1) === '\t') {
      prompt.rl.input.emit('keypress', '', {name: 'backspace'});
      return this.position(pos);
    }
    return tab.apply(this, arguments);
  });

  prompt.on('answer', function(answer) {
    if (isString(answer)) {
      // unshift answer onto the history array to make the
      // most recently used answers easier to tab to
      var history = arrayify(store.get(name));
      var val = answer.trim();
      var idx = history.indexOf(val);
      if (idx !== -1) {
        history.splice(idx, 1);
      }
      history.unshift(val);
      if (opts.historyLimit < history.length) {
        history.pop();
      }
      store.del(name, {force: true});
      store.set(name, history);
    }
  });

  return prompt;
};

function arrayify(val) {
  var arr = val ? (Array.isArray(val) ? val : [val]) : [];
  return arr.filter(isString);
}

function isString(val) {
  return typeof val === 'string' && val.trim() !== '';
}

function mod(idx, len) {
  var n = (idx % len + len) % len;
  return n < 0 ? n + Math.abs(len) : n;
}
