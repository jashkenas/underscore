import * as allExports from './index.js';
import { mixin } from './index.js';

// Add all of the Underscore functions to the wrapper object and return it.
export default mixin(allExports);
