import linearSearch from './_linearSearch.js';
import cb from './_cb.js';

// Returns the first index on an array-like that passes a truth test.
export default function findIndex(array, predicate, context) {
  return linearSearch(array, cb(predicate, context));
}
