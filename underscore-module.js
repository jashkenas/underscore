import * as allExports from './underscore-source';
import { mixin } from './underscore-source';

// Add all of the Underscore functions to the wrapper object and return it.
export default mixin(allExports);

// Export the separate functions and constants as well.
export * from './underscore-source';
