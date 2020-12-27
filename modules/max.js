import partial from './partial.js';
import _ from './underscore.js';
import extremum from './_extremum.js';
import { decideNumeric } from './_forceNumericMinMax.js';

// Return the maximum element (or element-based computation).
// Forces a numeric result.
export default partial(extremum, _, function(left, right) {
  if (right == null || +right !== +right) return true;
  return left != null && +left > +right;
}, _, _, decideNumeric(-Infinity));
