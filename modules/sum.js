import isArrayLike from './_isArrayLike.js';
import values from './values.js';
import cb from './_cb.js';
import find from './find.js';

// Return the sum of elements (or element-based computation).
export default function sum(collection, iteratee, context) {
  var result = 0;
  if (iteratee == null || typeof iteratee == 'number'  && collection != null && typeof collection[0] != 'object') {
    collection = isArrayLike(collection) ? collection : values(collection);
    for (var i = 0, length = collection.length; i < length; i++) {
      result += collection[i];
    }
  } else {
    iteratee = cb(iteratee, context);
    find(collection, function(v, index, list) {
      result += iteratee(v, index, list);;
    });
  }
  return result;
}
