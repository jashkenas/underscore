import extremum from './_extremum.js';
import { decideNumeric } from './_forceNumericMinMax.js';

// Return the maximum element (or element-based computation).
// Forces a numeric result.
export default function max(collection, iteratee, context) {
  return extremum(collection, function(left, right) {
    if (right == null || +right !== +right) return true;
    return left != null && +left > +right;
  }, iteratee, context, decideNumeric(-Infinity));
}
