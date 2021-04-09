import max from './max.js';
import min from './min.js';

export default function statRange(collection, iteratee, context){
    return max(collection, iteratee, context) - min(collection, iteratee, context);
}
