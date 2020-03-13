import * as allExports from './index';
import { mixin } from './index';

// Add all of the Underscore functions to the wrapper object and return it.
export default mixin(allExports);
