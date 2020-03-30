import { MAX_ARRAY_INDEX } from './_setup.js';
import getLength from './_getLength.js';

// Helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
export default function isArrayLike(collection) {
  var length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}
