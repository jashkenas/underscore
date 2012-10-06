var each = require('./collections').each,
    createResult = require('./utils').createResult,
    ArrayProto = Array.prototype;

// If Underscore is called as a function, it returns a wrapped object that
// can be used OO-style. This wrapper holds altered versions of all the
// underscore functions. Wrapped objects may be chained.

var result = createResult(exports);

// Add all mutator Array functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  exports.prototype[name] = function() {
    var obj = this._wrapped;
    method.apply(obj, arguments);
    if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
    return result.call(this, obj);
  };
});

// Add all accessor Array functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  exports.prototype[name] = function() {
    return result.call(this, method.apply(this._wrapped, arguments));
  };
});

exports.extend(exports.prototype, {

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
