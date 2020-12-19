import partial from './partial.js';
import _ from './underscore.js';
import extremum from './_extremum.js';
import { compareNumeric, decideNumeric } from './_forceNumericMinMax.js';
import less from './_less.js';

// Return the minimum element (or element-based computation).
// Forces a numeric result.
export default partial(extremum, _, compareNumeric(less), _, _, decideNumeric(Infinity));
