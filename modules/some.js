import cb from './_cb.js';
import find from './find.js';

// Determine if at least one element in the object passes a truth test.
export default function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var found = false;
  find(obj, function(value, key, obj) {
    if (predicate(value, key, obj)) return found = true;
  });
  return found;
}
