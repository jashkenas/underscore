import linearSearch from './_linearSearch.js';
import isArrayLike from './_isArrayLike.js';
import isArray from './isArray.js';
import isArguments from './isArguments.js';

// Internal implementation of a recursive `flatten` function.
export default function flatten(input, depth, strict, output) {
  output = output || [];
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  linearSearch(input, function(value) {
    if (isArrayLike(value) && (isArray(value) || isArguments(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten(value, depth - 1, strict, output);
      } else {
        var j = 0, len = value.length;
        while (j < len) output.push(value[j++]);
      }
    } else if (!strict) {
      output.push(value);
    }
  });
  return output;
}
