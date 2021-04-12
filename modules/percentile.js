import isEmpty from './isEmpty';
import sortBy from './sortBy.js';

// Return the percentile value of the numeric elements from the collection
//Ex : 50th,75th,99th etc.
//https://en.wikipedia.org/wiki/Percentile
export default function percentile(collection, percentile) {
    if (isEmpty(collection)) return 0;
    if (typeof percentile !== 'number') throw new TypeError('Percentile must be a number between 0 - 100');
    if (percentile <= 0) return collection[0];
    if (percentile >= 100) return collection[collection.length - 1];

    collection = sortBy(collection);
    var index = (percentile/100) * (collection.length - 1),
        lowerIndex = Math.floor(index),
        upperIndex = lowerIndex + 1,
        weight = index % 1;

    if (upperIndex >= collection.length) return collection[lowerIndex];
    return collection[lowerIndex] * (1 - weight) + collection[upperIndex] * weight;
}
