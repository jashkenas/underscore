import bindCb from './_bindCb.js';
import find from './find.js';

// The cornerstone for collection functions, an `each`
// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
export default function each(obj, iteratee, context) {
  iteratee = bindCb(iteratee, context);
  find(obj, function(value, key, obj) {
    iteratee(value, key, obj);
    // We omit the return value so that iteration continues until the end.
  });
  return obj;
}
