import isBoolean from './isBoolean.js';
import cb from './_cb.js';
import getLength from './_getLength.js';
import contains from './contains.js';

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
export default function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  var identity = iteratee == null;
  iteratee = cb(iteratee, context);
  var result = [];
  var seen = identity ? result : [];
  for (var i = 0, length = getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee(value, i, array);
    if (isSorted && identity) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (!contains(seen, computed)) {
      identity || seen.push(computed);
      result.push(value);
    }
  }
  return result;
}
