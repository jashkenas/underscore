import * as allExports from './index.js';
import { mixin } from './index.js';

// Add all of the Underscore functions to the wrapper object.
var _ = mixin(allExports);

// Support legacy code that does stuff like this:
//     var _ = require('underscore')._;
_._ = _;

export default _;
