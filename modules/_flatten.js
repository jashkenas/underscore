import getLength from './_getLength.js';
import isArrayLike from './_isArrayLike.js';
import isArray from './isArray.js';
import isArguments from './isArguments.js';

// Internal implementation of a `flatten` function.
export default function flatten(input, depth, strict) {
  if (!depth && depth !== 0) depth = Infinity;
  // We will be avoiding recursive calls because this could be exploited to
  // cause a stack overflow (CVE-2026-27601). Instead, we "trampoline" on an
  // explicit stack.
  var output = [], idx = 0, i = 0, length = getLength(input) || 0, stack = [];
  while (true) {
    if (i >= length) {
      if (!stack.length) break;
      var frame = stack.pop();
      i = frame.i;
      input = frame.v;
      length = getLength(input);
      continue;
    }
    var value = input[i++];
    if (stack.length >= depth) {
      output[idx++] = value;
    } else if (isArrayLike(value) && (isArray(value) || isArguments(value))) {
      // Flatten current level of array or arguments object.
      stack.push({i: i, v: input});
      i = 0;
      input = value;
      length = getLength(input);
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}
