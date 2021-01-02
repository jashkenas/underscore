import { decideNumeric } from './_forceNumericMinMax.js';
import isArrayLike from './_isArrayLike.js';
import toArray from './toArray.js';
import getLength from './_getLength.js';
import extremum from './_extremum.js';

// Return the maximum element (or element-based computation).
// Forces a numeric result.
var decideMax = decideNumeric(-Infinity);
export default function max(collection, iteratee, context) {
  if (
    iteratee == null ||
    // Detect use as an iteratee.
    typeof iteratee == 'number' && typeof collection[0] != 'object'
  ) {
    // We're using an identity iteratee, so we can take some shortcuts. This
    // optimization should move to `extremum` when we have a saner comparison
    // function (i.e., just the plain `>` operator aka `greater`).
    collection = isArrayLike(collection) ? collection : toArray(collection);
    var val, res = collection[0];
    for (var l = getLength(collection), i = 1; i < l; i++) {
      val = collection[i];
      if (
        res == null || val != null && +val > +res || +res !== +res
      ) res = val;
    }
    return decideMax(res, res);
  }
  return extremum(collection, function(val, res) {
    return res == null || val != null && +val > +res || +res !== +res;
  }, iteratee, context, decideMax);
}
