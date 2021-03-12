import cb from './_cb.js';
import less from './_less.js';
import binarySearch from './_binarySearch.js';

// Use an iteratee to figure out the smallest index at which an object should be
// inserted so as to maintain order. Uses binary search.
export default function sortedIndex(array, obj, iteratee, context) {
  return binarySearch(array, obj, cb(iteratee, context), less);
}
