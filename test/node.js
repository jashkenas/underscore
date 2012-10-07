var _ = require('..'),
    assert = require('assert');

var triple = function(n) { return n * 3; };

var mapTest = _.map([1, 2, 3], triple);
assert.equal(mapTest.join(','), '3,6,9');

var unionTest = _.union([1, 2, 3], [101, 2, 1, 10], [2, 1]);
assert.equal(unionTest.join(','), '1,2,3,101,10');

var tripleOnce = _.once(triple);
tripleOnce(3);
assert.equal(tripleOnce(5), 9);

var valuesTest = _.values({one : 1, two : 2, three : 3}).sort();
assert.equal(valuesTest.join(','), '1,2,3');

var timesSum = 0;
_.times(4, function(n) { timesSum += n; });
assert.equal(timesSum, 6);  // 0 + 1 + 2 + 3

var oopTest = _([1, 2, 3]).map(triple);
assert.equal(oopTest.join(','), '3,6,9');


// chain test
var stooges = [
  {name : 'curly', age : 25},
  {name : 'moe', age : 21},
  {name : 'larry', age : 23}
];
var youngest = _.chain(stooges)
  .sortBy(function(stooge){ return stooge.age; })
  .map(function(stooge){ return stooge.name + ' is ' + stooge.age; })
  .first()
  .value();
assert.equal(youngest, 'moe is 21');

console.log('All Node.js tests passed');
