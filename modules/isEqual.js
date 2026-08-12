import _ from './underscore.js';
import { toString, SymbolProto } from './_setup.js';
import getByteLength from './_getByteLength.js';
import isTypedArray from './isTypedArray.js';
import isFunction from './isFunction.js';
import { hasDataViewBug }  from './_stringTagBug.js';
import isDataView from './isDataView.js';
import keys from './keys.js';
import has from './_has.js';
import toBufferView from './_toBufferView.js';
import random from './random.js';
import uniqueId from './uniqueId.js';

// In environments that don't have `Map`, `isEqual` will perform a linear search
// in order to detect cycles in the compared objects. This causes quadratic
// runtime complexity in the depth of the compared objects. To prevent the CPU
// from wasting billions of cycles on excessively deep objects, we impose a
// limit on the total number of comparisons per call to `isEqual`. This limit is
// chosen to be generous while also keeping performance degradation at a
// minimum.
var comparisonLimit = 5e7;

// Internal helper for isEqual to create a simple, specialized lookup
// datastructure for cycle detection in nested objects.
function cycleTracker() {
  // The lookup object. It keeps track of data and has methods.
  // If possible, use the modern `Map` datastructure.
  if (typeof Map === 'function') return {
    map: new Map(),
    // Besides a map, we also keep an array so we know which object was added
    // last.
    tracked: [],
    // Store the fact that `a` and `b` appeared at the same position in the
    // composition tree on either side of the comparison.
    push: function(a, b) {
      this.tracked.push(a);
      this.map.set(a, b);
    },
    // Remove the last added pair.
    pop: function() {
      this.map['delete'](this.tracked.pop());
    },
    // Check whether we have seen `a` before.
    has: function(a) {
      return this.map.has(a);
    },
    // Check whether `b` was previously seen at the same point of comparison as
    // `a`. This method is only invoked if `this.has(a)` returned `true`.
    match: function(a, b) {
      return this.map.get(a) === b;
    },
    // As soon as we find any difference, we can stop the comparison and return
    // `false`. This methods is invoked in that scenario to clean up remaining
    // data, so we don't create memory leaks.
    abort: function(a, b) {
      this.tracked.length = 0;
      this.map.clear();
      // Return `false` so we can clean up and return in a single statement.
      return false;
    }
  };
  // We now enter the alternative branch, a situation where `Map` is not
  // available.

  // The fallback lookup structure. It has the same interface as the one based
  // on `Map`, but uses linear search instead. Because of this, the runtime
  // complexity is quadratic in the depth of the compared objects.
  return {
    tracked: [],
    trackedB: [],
    lookups: 0,
    push: function(a, b) {
      this.tracked.push(a);
      this.trackedB.push(b);
    },
    pop: function() {
      this.tracked.pop();
      this.trackedB.pop();
    },
    has: function(a) {
      // While the algorithm could run to arbitrary comparison depth in
      // principle, the quadratic runtime cost is going to hurt performance
      // significantly once the depth reaches over a few thousand levels. To
      // prevent excessive performance degradation, we keep track of the number
      // of comparisons and abort the operation when this number passes a limit.
      if (this.lookups >= comparisonLimit) throw RangeError(
        'Comparison limit exceeded. Wrap call to isEqual in try/catch or ' +
        'limit the depth of compared objects.'
      );
      // The following loop is **the** hot loop, so we keep it as light as
      // possible.
      for (var i = 0, l = this.tracked.length; i < l; ++i) {
        if (this.tracked[i] === a) break;
      }
      // We only update the number of comparisons after the loop, exploiting the
      // fact that `i` is still in scope and contains the approximate number of
      // comparisons made. `this.lookups` can exceed `comparisonLimit` as a
      // result, but this is unproblematic.
      this.lookups += i;
      // Return the index where `a` was found, plus one so it doesn't look
      // falsy.
      return i < l ? i + 1 : false;
    },
    // The `match` method takes one argument more than the corresponding method
    // in the `Map`-based variant, because we just need to know whether the `a`
    // and the `b` appear at the same index within their respective tracking
    // arrays. The index of `a` was already found and returned in the call to
    // `match`.
    match: function(a, b, i) {
      // `match` added one to the index so it would be truthy, so we have to
      // subtract one again over here.
      return this.trackedB[i - 1] === b;
    },
    abort: function() {
      this.tracked.length = 0;
      this.trackedB.length = 0;
      return false;
    }
  };
}

// We use this string twice, so give it a name for minification.
var tagDataView = '[object DataView]';

// Perform a deep comparison to check if two objects are equal.
export default function isEqual(a, b) {
  // Keep track of which pairs of values need to be compared. We will be
  // trampolining on this stack instead of using function recursion.
  // (CVE-2026-27601)
  var todo = [{a: a, b: b}];
  // Create a specialized datastructure for cycle detection.
  var tracker = cycleTracker();

  // Keep traversing pairs until there is nothing left to compare.
  while (todo.length) {
    var frame = todo.pop();
    // As a special case, a single `true` on the todo means that we can
    // pop from the cycle tracker.
    if (frame === true) {
      tracker.pop();
      continue;
    }
    a = frame.a;
    b = frame.b;

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
      if (a !== 0 || 1 / a === 1 / b) continue;
      return tracker.abort();
    }
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return tracker.abort();
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) {
      if (b !== b) continue;
      return tracker.abort();
    }
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') {
      return tracker.abort();
    }

    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return tracker.abort();
    // Work around a bug in IE 10 - Edge 13.
    if (hasDataViewBug && className == '[object Object]' && isDataView(a)) {
      if (!isDataView(b)) return tracker.abort();
      className = tagDataView;
    }
    switch (className) {
      // These types are compared by value.
    case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      if ('' + a === '' + b) continue;
      return tracker.abort();
    case '[object Number]':
      todo.push({a: +a, b: +b});
      continue;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      if (+a === +b) continue;
      return tracker.abort();
    case '[object Symbol]':
      if (SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b)) continue;
      return tracker.abort();
    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      todo.push({a: toBufferView(a), b: toBufferView(b)});
      continue;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays && isTypedArray(a)) {
      var byteLength = getByteLength(a);
      if (byteLength !== getByteLength(b)) return tracker.abort();
      if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) continue;
      areArrays = true;
    }
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return tracker.abort();

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                               isFunction(bCtor) && bCtor instanceof bCtor)
          && ('constructor' in a && 'constructor' in b)) {
        return tracker.abort();
      }
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    var found = tracker.has(a);
    if (found) {
      // Depending on the type of `tracker` used, `found` may be just a boolean
      // or a special value that aids in finding a matching `b`. For the latter
      // reason, we pass it back to `tracker.match`.
      if (tracker.match(a, b, found)) continue;
      return tracker.abort();
    }

    // Add the objects to the tracker.
    tracker.push(a, b);
    // Remember to remove them again after the recursion below.
    todo.push(true);

    // Recursively compare objects and arrays.
    var length;
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return tracker.abort();
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        todo.push({a: a[length], b: b[length]});
      }
    } else {
      // Deep compare objects.
      var _keys = keys(a), key;
      length = _keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (keys(b).length !== length) return tracker.abort();
      while (length--) {
        // Deep compare each member
        key = _keys[length];
        if (!has(b, key)) return tracker.abort();
        todo.push({a: a[key], b: b[key]});
      }
    }
  }
  // We made it to the end and found no differences.
  return true;
}
