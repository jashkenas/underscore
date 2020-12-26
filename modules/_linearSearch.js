import getLength from './_getLength.js';

// Internal function for linearly iterating over arrays.
export default function linearSearch(array, predicate, dir, start) {
  var length = getLength(array);
  dir || (dir = 1);
  start = (
    start == null ? (dir > 0 ? 0 : length - 1) :
    start < 0 ? (dir > 0 ? Math.max(0, start + length) : start + length) :
    dir > 0 ? start : Math.min(start, length - 1)
  );
  for (; start >= 0 && start < length; start += dir) {
    if (predicate(array[start], start, array)) return start;
  }
  return -1;
}
