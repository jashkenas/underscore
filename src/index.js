//     Underscore.js 1.4.1
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

var objects = require('./objects');

// Create a safe reference to the Underscore object for use below.
var _ = function(obj) {
  if (obj instanceof _) return obj;
  if (!(this instanceof _)) return new _(obj);
  this._wrapped = obj;
};

// Add all the functionality to the Underscore object.
objects.extend(_,
               objects,
               require('./collections'),
               require('./arrays'),
               require('./functions'),
               require('./utils'),
               require('./oop')
              );

// Add all of the Underscore functions to the wrapper object.
_.mixin(_);

// Export the Underscore object for **Node.js**, with
// backwards-compatibility for the old `require()` API. If we're in
// the browser, add `_` as a global object via a string identifier,
// for Closure Compiler "advanced" mode.
if (typeof window === 'undefined') {
  exports = module.exports = _;
  exports._ = _;
} else {
  window['_'] = _;
}

// Current version.
_.VERSION = '1.4.1';
