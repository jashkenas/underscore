import _ from './underscore.js';
import each from './each.js';
import functions from './functions.js';
import { push } from './_setup.js';
import chainResult from './_chainResult.js';

// Add your own custom functions to the Underscore object.
export default function mixin(obj) {
  each(functions(obj), function(name) {
    var func = _[name] = obj[name];
    _.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      var result = func.apply(_, args);
      if (name === 'chain') return this._chain ? func.call(_, result) : result;
      return chainResult(this, result);
    };
  });
  return _;
}
