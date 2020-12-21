import linearSearch from './_linearSearch.js';
import { slice } from './_setup.js';

// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
export default function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  linearSearch(array, function(_, index) {
    result.push(slice.call(array, index, index + count));
  }, 0, count);
  return result;
}
