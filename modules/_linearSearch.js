import getLength from './_getLength.js';
import isFunction from './isFunction.js';
import has from './_has.js';

// Internal function for linearly iterating over arrays.
export default function linearSearch(array, predicate, dir, start) {
  var target, length = getLength(array);
  dir || (dir = 1);
  start = (
    start == null ? (dir > 0 ? 0 : length - 1) :
    start < 0 ? (dir > 0 ? Math.max(0, start + length) : start + length) :
    dir > 0 ? start : Math.min(start, length - 1)
  );
  // As a special case, in order to elide the `predicate` invocation on every
  // loop iteration, we allow the caller to pass a value that should be found by
  // strict equality comparison. This is somewhat like a rudimentary iteratee
  // shorthand. It is used in `_.indexof` and `_.lastIndexOf`.
  if (!isFunction(predicate)) {
    target = has(predicate, 'value') ? predicate.value : predicate;
    predicate = false;
  }
  for (; start >= 0 && start < length; start += dir) {
    if (
      predicate ? predicate(array[start], start, array) :
      array[start] === target
    ) return start;
  }
  return -1;
}
