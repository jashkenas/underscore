import bindCb4 from './_bindCb4.js';

// Create a reducing function iterating in the same way as `loop` (e.g.
// `_.find`).
export default function createReduce(loop) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  function reducer(obj, iteratee, memo, initial) {
    if (!initial) {
      // Make the `iteratee` change identity temporarily so that it only sets
      // the `memo` on the first iteration.
      var actualIteratee = iteratee;
      iteratee = function(memo, value) {
        iteratee = actualIteratee;
        return value;
      }
    }
    loop(obj, function(value, key, obj) {
      memo = iteratee(memo, value, key, obj);
    });
    return memo;
  }

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, bindCb4(iteratee, context), memo, initial);
  };
}
