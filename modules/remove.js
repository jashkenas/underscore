// removes first element having the condition
export default function remove(collection, predicate) {
  var index = collection.length;
  while(index--){
    if(predicate(collection[index])) collection.splice(index, 1)
  }
  return collection;
}