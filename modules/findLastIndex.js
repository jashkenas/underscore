import linearSearch from './_linearSearch.js';
import cb from './_cb.js';

// Returns the last index on an array-like that passes a truth test.
export default function findLastIndex(array, predicate, context) {
  return linearSearch(array, cb(predicate, context), -1);
}
