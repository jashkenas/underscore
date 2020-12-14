import cb from './_cb.js';
import keys from './keys.js';
import linearSearch from './_linearSearch.js';

// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
export default function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var results = {};
  linearSearch(keys(obj), function(currentKey) {
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  });
  return results;
}
