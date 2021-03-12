import getLength from './_getLength.js';
import binarySearch from './_binarySearch.js';
import identity from './identity';
import less from './_less.js';
import lessEqual from './_lessEqual.js';
import isNaN from './isNaN.js';
import linearSearch from './_linearSearch.js';

// Internal function to generate the `indexOf` and `lastIndexOf` functions.
export default function createIndexFinder(dir) {
  var forward = dir > 0;
  var compare = forward ? less : lessEqual;
  // `controlArg` may be either a number indicating the first index to start
  // searching at, or a boolean indicating whether the array is sorted by native
  // operator `<`.
  return function(array, item, controlArg) {
    var start;
    if (getLength(array) < 1) return -1;
    if (typeof controlArg == 'number') {
      start = controlArg;
    } else if (controlArg && forward) {
      start = binarySearch(array, item, identity, compare);
      return array[start] === item ? start : -1;
    }
    var predicate = item !== item ? isNaN : { value: item };
    return linearSearch(array, predicate, dir, start);
  };
}
