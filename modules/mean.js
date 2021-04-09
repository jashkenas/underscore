import size from './size.js';
import sum from './sum.js';

// Compute the average of the numbers obtained from the collection
export default function mean(collection, iteratee, context) {
  var length = size(collection);

  if (length < 1) return 0;

  return sum(collection, iteratee, context) / length;
}
