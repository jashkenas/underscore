import restArguments from './restArguments.js';
import getLength from './_getLength.js';
import contains from './contains.js';
import linearSearch from './_linearSearch.js';

// Produce an array that contains every item shared between all the
// passed-in arrays.
export default restArguments(function(array, others) {
  var result = [];
  linearSearch(array, function(item) {
    if (contains(result, item)) return;
    if (linearSearch(others, function(other) {
      return !contains(other, item);
    }) == -1) result.push(item);
  });
  return result;
});
