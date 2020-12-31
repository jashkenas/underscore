import cb from './_cb.js';
import find from './find.js';

// Return the results of applying the iteratee to each element.
export default function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var results = [];
  find(obj, function(value, key) {
    results.push(iteratee(value, key, obj));
  });
  return results;
}
