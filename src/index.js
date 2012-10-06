//     Underscore.js 1.4.1
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

var objects = require('./objects'),
    utils = require('./utils');

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
               utils
              );


var each = _.each,
    ArrayProto = Array.prototype,
    push = ArrayProto.push;


// Add a "chain" function, which will delegate to the wrapper.
_.chain = function(obj) {
  return _(obj).chain();
};

// If Underscore is called as a function, it returns a wrapped object that
// can be used OO-style. This wrapper holds altered versions of all the
// underscore functions. Wrapped objects may be chained.

var result = function(obj) {
  return this._chain ? _(obj).chain() : obj;
};

// Add your own custom functions to the Underscore object.
_.mixin = function(obj) {
  each(objects.functions(obj), function(name){
    var func = _[name] = obj[name];
    _.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return result.call(this, func.apply(_, args));
    };
  });
};

// Add all of the Underscore functions to the wrapper object.
_.mixin(_);

// Add all mutator Array functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    var obj = this._wrapped;
    method.apply(obj, arguments);
    if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
    return result.call(this, obj);
  };
});

// Add all accessor Array functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    return result.call(this, method.apply(this._wrapped, arguments));
  };
});

_.extend(_.prototype, {

  // Start chaining a wrapped Underscore object.
  chain: function() {
    this._chain = true;
    return this;
  },

  // Extracts the result from a wrapped and chained object.
  value: function() {
    return this._wrapped;
  }

});


// Export the Underscore object for **Node.js**, with
// backwards-compatibility for the old `require()` API. If we're in
// the browser, add `_` as a global object via a string identifier,
// for Closure Compiler "advanced" mode.
module.exports = _;
_._ = _;

if (typeof window !== 'undefined') {
  window['_'] = _;
}

// Current version.
_.VERSION = '1.4.1';
