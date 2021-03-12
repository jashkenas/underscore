import createReduce from './_createReduce.js';
import find from './find.js';

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
export default createReduce(find);
