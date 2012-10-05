//     Underscore.js 1.4.1
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

  // Baseline setup
  // --------------

  var previousUnderscore;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    window._ = previousUnderscore;
    return this;
  };

  // Add all the functionality to the Underscore object.
  require('./collections')(_);
  require('./arrays')(_);
  require('./functions')(_);
  require('./objects')(_);
  require('./utilities')(_);
  require('./oop')(_);

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof window === 'undefined') {
    exports = module.exports = _;
    exports._ = _;
  } else {
    // Save the previous value of the `_` variable.
    previousUnderscore = window._;
    window['_'] = _;
  }

  // Current version.
  _.VERSION = '1.4.1';
