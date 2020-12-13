import cb from './_cb.js';
import each from './each.js';

// Return all the elements that pass a truth test.
export default function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index) {
    if (predicate(value, index, obj)) results.push(value);
  });
  return results;
}
