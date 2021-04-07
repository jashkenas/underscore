import max from './max.js'
import min from './min.js'

export default function statRange(obj,iteratee,context){
    return max(obj,iteratee,context) - min(obj,iteratee,context);
}