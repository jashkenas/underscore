import cb from './_cb.js';
import find from './find.js';

// Return all the elements that pass a truth test.
export default function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  find(obj, function(value, index) {
    if (predicate(value, index, obj)) results.push(value);
  });
  return results;
}
