import findLastIndex from './findLastIndex.js';
import isArrayLike from './_isArrayLike.js';
import keys from './keys.js';
import identity from './identity.js';
import each from './each.js';
import bindCb from './_bindCb.js';

// A **less general** backward variant of `_.each`, specifically catered to
// implementing `_.reduceRight`.
function eachRight(obj, func) {
  if (isArrayLike(obj)) {
    findLastIndex(obj, func);
  } else {
    findLastIndex(keys(obj), function(key) {
      func(obj[key], key, obj);
    });
  }
}

// Create a reducing function iterating left or right.
// `customInit` can be used to control how the accumulator is
// initialized from the first element. Defaults to using the element
// directly.
export default function createReduce(dir, customInit) {
  var loop = dir > 0 ? each : eachRight;
  customInit || (customInit = identity);

  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  function reducer(obj, iteratee, memo, initial) {
    if (!initial) {
      // Make the `iteratee` change identity temporarily so that it only sets
      // the `memo` on the first iteration.
      var actualIteratee = iteratee;
      iteratee = function(memo, value, key) {
        iteratee = actualIteratee;
        return customInit(value, key, obj);
      }
    }
    loop(obj, function(value, key, obj) {
      memo = iteratee(memo, value, key, obj);
    });
    return memo;
  }

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, bindCb(iteratee, context), memo, initial);
  };
}
