import restArguments from './restArguments.js';
import isFunction from './isFunction.js';
import executeBound from './_executeBound.js';

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
// available.
export default restArguments(function(func, context, args) {
  if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});
