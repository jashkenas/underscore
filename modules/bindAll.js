import restArguments from './restArguments.js';
import flatten from './_flatten.js';
import getLength from './_getLength.js';
import linearSearch from './_linearSearch.js';
import bind from './bind.js';

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
export default restArguments(function(obj, keys) {
  keys = flatten(keys, false, false);
  /* legacy unnecessary check */
  if (!getLength(keys)) throw new Error('bindAll must be passed function names');
  linearSearch(keys, function(key) {
    obj[key] = bind(obj[key], obj);
  }, -1); /* backwards for legacy reasons */
  return obj;
});
