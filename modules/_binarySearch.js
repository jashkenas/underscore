import getLength from './_getLength.js';

// Iteratively cut `array` in half to figure out the index at which `obj` should
// be inserted so as to maintain the order defined by `compare`.
export default function binarySearch(array, obj, iteratee, compare) {
  var value = iteratee(obj);
  var low = 0, high = getLength(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (compare(iteratee(array[mid]), value)) low = mid + 1; else high = mid;
  }
  return low;
}
