import cb from './_cb.js';
import lessEqual from './_lessEqual.js';
import binarySearch from './_binarySearch.js';

// Use an iteratee to figure out the greatest index at which an object should be
// inserted so as to maintain order. Uses binary search.
export default function sortedLastIndex(array, obj, iteratee, context) {
  return binarySearch(array, obj, cb(iteratee, context), lessEqual);
}
