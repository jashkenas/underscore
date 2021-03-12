import cb from './_cb.js';
import findKey from './findKey.js';

// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
export default function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var results = {};
  findKey(obj, function(value, key) {
    results[key] = iteratee(value, key, obj);
  });
  return results;
}
