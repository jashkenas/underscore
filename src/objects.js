var each = require('./each'),
    ArrayProto = Array.prototype,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    ObjProto = Object.prototype,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty,
    nativeKeys = Object.keys,
    nativeIsArray = Array.isArray;

// Retrieve the names of an object's properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`
exports.keys = nativeKeys || function(obj) {
  if (obj !== Object(obj)) throw new TypeError('Invalid object');
  var keys = [];
  for (var key in obj) if (exports.has(obj, key)) keys[keys.length] = key;
  return keys;
};

// Retrieve the values of an object's properties.
exports.values = function(obj) {
  var values = [];
  for (var key in obj) if (exports.has(obj, key)) values.push(obj[key]);
  return values;
};

// Convert an object into a list of `[key, value]` pairs.
exports.pairs = function(obj) {
  var pairs = [];
  for (var key in obj) if (exports.has(obj, key)) pairs.push([key, obj[key]]);
  return pairs;
};

// Invert the keys and values of an object. The values must be serializable.
exports.invert = function(obj) {
  var result = {};
  for (var key in obj) if (exports.has(obj, key)) result[obj[key]] = key;
  return result;
};

// Return a sorted list of the function names available on the object.
// Aliased as `methods`
exports.functions = exports.methods = function(obj) {
  var names = [];
  for (var key in obj) {
    if (exports.isFunction(obj[key])) names.push(key);
  }
  return names.sort();
};

// Extend a given object with all the properties in passed-in object(s).
exports.extend = function(obj) {
  each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      obj[prop] = source[prop];
    }
  });
  return obj;
};

// Return a copy of the object only containing the whitelisted properties.
exports.pick = function(obj) {
  var copy = {};
  var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
  each(keys, function(key) {
    if (key in obj) copy[key] = obj[key];
  });
  return copy;
};

// Return a copy of the object without the blacklisted properties.
exports.omit = function(obj) {
  var copy = {};
  var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
  exports.extend(copy, obj);
  each(keys, function(key) {
    delete copy[key];
  });
  return copy;
};

// Fill in a given object with default properties.
exports.defaults = function(obj) {
  each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (obj[prop] == null) obj[prop] = source[prop];
    }
  });
  return obj;
};

// Create a (shallow-cloned) duplicate of an object.
exports.clone = function(obj) {
  if (!exports.isObject(obj)) return obj;
  return exports.isArray(obj) ? obj.slice() : exports.extend({}, obj);
};

// Invokes interceptor with the obj, and then returns obj.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
exports.tap = function(obj, interceptor) {
  interceptor(obj);
  return obj;
};

// Internal recursive comparison function for `isEqual`.
var eq = function(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
  if (a === b) return a !== 0 || 1 / a == 1 / b;
  // A strict comparison is necessary because `null == undefined`.
  if (a == null || b == null) return a === b;
  // Unwrap any wrapped objects.
  if (exports.has(a, '_wrapped')) a = a._wrapped;
  if (exports.has(b, '_wrapped')) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = toString.call(a);
  if (className != toString.call(b)) return false;
  switch (className) {
    // Strings, numbers, dates, and booleans are compared by value.
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return a == String(b);
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
      // other numeric values.
      return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a == +b;
    // RegExps are compared by their source patterns and flags.
    case '[object RegExp]':
      return a.source == b.source &&
              a.global == b.global &&
              a.multiline == b.multiline &&
              a.ignoreCase == b.ignoreCase;
  }
  if (typeof a != 'object' || typeof b != 'object') return false;
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] == a) return bStack[length] == b;
  }
  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);
  var size = 0, result = true;
  // Recursively compare objects and arrays.
  if (className == '[object Array]') {
    // Compare array lengths to determine if a deep comparison is necessary.
    size = a.length;
    result = size == b.length;
    if (result) {
      // Deep compare the contents, ignoring non-numeric properties.
      while (size--) {
        if (!(result = eq(a[size], b[size], aStack, bStack))) break;
      }
    }
  } else {
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(exports.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             exports.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Deep compare objects.
    for (var key in a) {
      if (exports.has(a, key)) {
        // Count the expected number of properties.
        size++;
        // Deep compare each member.
        if (!(result = exports.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
      }
    }
    // Ensure that both objects contain the same number of properties.
    if (result) {
      for (key in b) {
        if (exports.has(b, key) && !(size--)) break;
      }
      result = !size;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return result;
};

// Perform a deep comparison to check if two objects are equal.
exports.isEqual = function(a, b) {
  return eq(a, b, [], []);
};

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
exports.isEmpty = function(obj) {
  if (obj == null) return true;
  if (exports.isArray(obj) || exports.isString(obj)) return obj.length === 0;
  for (var key in obj) if (exports.has(obj, key)) return false;
  return true;
};

// Is a given value a DOM element?
exports.isElement = function(obj) {
  return !!(obj && obj.nodeType === 1);
};

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
exports.isArray = nativeIsArray || function(obj) {
  return toString.call(obj) == '[object Array]';
};

// Is a given variable an object?
exports.isObject = function(obj) {
  return obj === Object(obj);
};

// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
  exports['is' + name] = function(obj) {
    return toString.call(obj) == '[object ' + name + ']';
  };
});

// Define a fallback version of the method in browsers (ahem, IE), where
// there isn't any inspectable "Arguments" type.
if (!exports.isArguments(arguments)) {
  exports.isArguments = function(obj) {
    return !!(obj && exports.has(obj, 'callee'));
  };
}

// Optimize `isFunction` if appropriate.
if (typeof (/./) !== 'function') {
  exports.isFunction = function(obj) {
    return typeof obj === 'function';
  };
}

// Is a given object a finite number?
exports.isFinite = function(obj) {
  return exports.isNumber(obj) && isFinite(obj);
};

// Is the given value `NaN`? (NaN is the only number which does not equal itself).
exports.isNaN = function(obj) {
  return exports.isNumber(obj) && obj != +obj;
};

// Is a given value a boolean?
exports.isBoolean = function(obj) {
  return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
};

// Is a given value equal to null?
exports.isNull = function(obj) {
  return obj === null;
};

// Is a given variable undefined?
exports.isUndefined = function(obj) {
  return obj === void 0;
};

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
exports.has = function(obj, key) {
  return hasOwnProperty.call(obj, key);
};
