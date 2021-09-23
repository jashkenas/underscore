import group from './_group.js';
import has from './_has.js';

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
export default group((result, value, key) => {
  result[key] = [...(result[key] || []), value];
});
