import findIndex from './findIndex.js'

// removes first element having the condition
export default function remove(collection, predicate){
    collection.splice(findIndex(collection, predicate), 1);
    return collection;
  }