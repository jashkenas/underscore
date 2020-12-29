import isArrayLike from './_isArrayLike.js';
import findLastIndex from './findLastIndex.js';
import keys from './keys.js';
import createReduce from './_createReduce.js';

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

// The right-associative version of reduce, also known as `foldr`.
export default createReduce(eachRight);
