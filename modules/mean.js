import size from './size.js';
import sum from './sum.js';

// Return the average/mean element (or element-based computation).
export default function mean(collection, iteratee, context) {
  var length = size(collection);

  if (length < 1) return 0;

  return sum(collection, iteratee, context) / length;
}
