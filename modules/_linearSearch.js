import getLength from './_getLength.js';

// Internal function for linearly iterating over arrays.
export default function linearSearch(array, predicate, index, dir) {
  var length = getLength(array);
  dir || (dir = 1);
  index = (
    index == null ? (dir > 0 ? 0 : length - 1) :
    index < 0 ? (dir > 0 ? Math.max(0, index + length) : index + length) :
    dir > 0 ? index : Math.min(index, length - 1)
  );
  for (; index >= 0 && index < length; index += dir) {
    if (predicate(array[index], index, array)) return index;
  }
  return -1;
}
