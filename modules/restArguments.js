import { slice }  from './_setup.js';

// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
export default function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var args = slice.call(arguments, 0, startIndex);
    args[startIndex] = slice.call(arguments, startIndex);
    return func.apply(this, args);
  };
}
