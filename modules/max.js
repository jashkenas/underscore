import partial from './partial.js';
import _ from './underscore.js';
import extremum from './_extremum.js';
import { compareNumeric, decideNumeric } from './_forceNumericMinMax.js';
import greater from './_greater.js';

// Return the maximum element (or element-based computation).
// Forces a numeric result.
export default partial(extremum, _, compareNumeric(greater), _, _, decideNumeric(-Infinity));
