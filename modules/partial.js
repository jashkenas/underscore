import restArguments from './restArguments.js';
import executeBound from './_executeBound.js';
import _ from './underscore.js';

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = restArguments(function(_args) {
    var position = 0, length = boundArgs.length;
    var args = [];
    for (var i = 0; i < length; i++) {
      args.push(boundArgs[i] === placeholder ? _args[position++] : boundArgs[i]);
    }
    while (position < _args.length) args.push(_args[position++]);
    return executeBound(func, bound, this, this, args);
  });
  return bound;
});

partial.placeholder = _;
export default partial;
