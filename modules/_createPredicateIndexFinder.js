import cb from './_cb.js';
import linearSearch from './_linearSearch.js';

// Internal function to generate `_.findIndex` and `_.findLastIndex`.
export default function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    return linearSearch(array, cb(predicate, context), null, dir);
  };
}
