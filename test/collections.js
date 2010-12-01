if (typeof require !== 'undefined') {
  var _ = require('../underscore');
}

(function (exports) {
//$(document).ready(function() {

  //module("Collection functions (each, any, select, and so on...)");

exports["collections: each"] = function(test) {
  _.each([1, 2, 3], function(num, i) {
    test.equals(num, i + 1, 'each iterators provide value and iteration count');
  });

  var answer = null;
  _.each([1, 2, 3], function(num){ if ((answer = num) == 2) _.breakLoop(); });
  test.equals(answer, 2, 'the loop broke in the middle');

  var answers = [];
  _.each([1, 2, 3], function(num){ answers.push(num * this.multiplier);}, {multiplier : 5});
  test.equals(answers.join(', '), '5, 10, 15', 'context object property accessed');

  answers = [];
  _.forEach([1, 2, 3], function(num){ answers.push(num); });
  test.equals(answers.join(', '), '1, 2, 3', 'aliased as "forEach"');

  answers = [];
  var obj = {one : 1, two : 2, three : 3};
  obj.constructor.prototype.four = 4;
  _.each(obj, function(value, key){ answers.push(key); });
  test.equals(answers.join(", "), 'one, two, three', 'iterating over objects works, and ignores the object prototype.');
  delete obj.constructor.prototype.four;

  answer = null;
  _.each([1, 2, 3], function(num, index, arr){ if (_.include(arr, num)) answer = true; });
  test.ok(answer, 'can reference the original collection from inside the iterator');

  answers = [];
  _.each({range : 1, speed : 2, length : 3}, function(v){ answers.push(v); });
  test.ok(answers.join(', '), '1, 2, 3', 'can iterate over objects with numeric length properties');
  test.done();
};

exports['collections: map'] = function(test) {
  var doubled = _.map([1, 2, 3], function(num){ return num * 2; });
  test.equals(doubled.join(', '), '2, 4, 6', 'doubled numbers');

  var tripled = _.map([1, 2, 3], function(num){ return num * this.multiplier; }, {multiplier : 3});
  test.equals(tripled.join(', '), '3, 6, 9', 'tripled numbers with context');

  var doubled = _([1, 2, 3]).map(function(num){ return num * 2; });
  test.equals(doubled.join(', '), '2, 4, 6', 'OO-style doubled numbers');

  // only run these assertions in the browser
  if (typeof document !== 'undefined') {
    var ids = _.map(document.body.childNodes, function(n){ return n.id; });
    test.ok(_.include(ids, 'testid'), 'can use collection methods on NodeLists');

    var ids = _.map(document.images, function(n){ return n.id; });
    test.ok(ids[0] == 'testimg', 'can use collection methods on HTMLCollections');
  }

  test.done();
};

exports['collections: reduce'] = function(test) {
  var sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; }, 0);
  test.equals(sum, 6, 'can sum up an array');

  var context = {multiplier : 3};
  sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num * this.multiplier; }, 0, context);
  test.equals(sum, 18, 'can reduce with a context object');

  sum = _.inject([1, 2, 3], function(sum, num){ return sum + num; }, 0);
  test.equals(sum, 6, 'aliased as "inject"');

  sum = _([1, 2, 3]).reduce(function(sum, num){ return sum + num; }, 0);
  test.equals(sum, 6, 'OO-style reduce');
  
  var sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; });
  test.equals(sum, 6, 'default initial value');
  test.done();
};

exports['collections: reduceRight'] = function(test) {
  var list = _.reduceRight(["foo", "bar", "baz"], function(memo, str){ return memo + str; }, '');
  test.equals(list, 'bazbarfoo', 'can perform right folds');
  
  var list = _.foldr(["foo", "bar", "baz"], function(memo, str){ return memo + str; }, '');
  test.equals(list, 'bazbarfoo', 'aliased as "foldr"');
  
  var list = _.foldr(["foo", "bar", "baz"], function(memo, str){ return memo + str; });
  test.equals(list, 'bazbarfoo', 'default initial value');
  test.done();
};

exports['collections: detect'] = function(test) {
  var result = _.detect([1, 2, 3], function(num){ return num * 2 == 4; });
  test.equals(result, 2, 'found the first "2" and broke the loop');
  test.done();
};

exports['collections: select'] = function(test) {
  var evens = _.select([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
  test.equals(evens.join(', '), '2, 4, 6', 'selected each even number');

  evens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
  test.equals(evens.join(', '), '2, 4, 6', 'aliased as "filter"');
  test.done();
};

exports['collections: reject'] = function(test) {
  var odds = _.reject([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
  test.equals(odds.join(', '), '1, 3, 5', 'rejected each even number');
  test.done();
};

exports['collections: all'] = function(test) {
  test.ok(_.all([]), 'the empty set');
  test.ok(_.all([true, true, true]), 'all true values');
  test.ok(!_.all([true, false, true]), 'one false value');
  test.ok(_.all([0, 10, 28], function(num){ return num % 2 == 0; }), 'even numbers');
  test.ok(!_.all([0, 11, 28], function(num){ return num % 2 == 0; }), 'an odd number');
  test.ok(_.every([true, true, true]), 'aliased as "every"');
  test.done();
};

exports['collections: any'] = function(test) {
  test.ok(!_.any([]), 'the empty set');
  test.ok(!_.any([false, false, false]), 'all false values');
  test.ok(_.any([false, false, true]), 'one true value');
  test.ok(!_.any([1, 11, 29], function(num){ return num % 2 == 0; }), 'all odd numbers');
  test.ok(_.any([1, 10, 29], function(num){ return num % 2 == 0; }), 'an even number');
  test.ok(_.some([false, false, true]), 'aliased as "some"');
  test.done();
};

exports['collections: include'] = function(test) {
  test.ok(_.include([1,2,3], 2), 'two is in the array');
  test.ok(!_.include([1,3,9], 2), 'two is not in the array');
  test.ok(_.contains({moe:1, larry:3, curly:9}, 3) === true, '_.include on objects checks their values');
  test.ok(_([1,2,3]).include(2), 'OO-style include');
  test.done();
};

exports['collections: invoke'] = function(test) {
  var list = [[5, 1, 7], [3, 2, 1]];
  var result = _.invoke(list, 'sort');
  test.equals(result[0].join(', '), '1, 5, 7', 'first array sorted');
  test.equals(result[1].join(', '), '1, 2, 3', 'second array sorted');
  test.done();
};

exports['collections: pluck'] = function(test) {
  var people = [{name : 'moe', age : 30}, {name : 'curly', age : 50}];
  test.equals(_.pluck(people, 'name').join(', '), 'moe, curly', 'pulls names out of objects');
  test.done();
};

exports['collections: max'] = function(test) {
  test.equals(3, _.max([1, 2, 3]), 'can perform a regular Math.max');

  var neg = _.max([1, 2, 3], function(num){ return -num; });
  test.equals(neg, 1, 'can perform a computation-based max');
  test.done();
};

exports['collections: min'] = function(test) {
  test.equals(1, _.min([1, 2, 3]), 'can perform a regular Math.min');

  var neg = _.min([1, 2, 3], function(num){ return -num; });
  test.equals(neg, 3, 'can perform a computation-based min');
  test.done();
};

exports['collections: sortBy'] = function(test) {
  var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
  people = _.sortBy(people, function(person){ return person.age; });
  test.equals(_.pluck(people, 'name').join(', '), 'moe, curly', 'stooges sorted by age');
  test.done();
};

exports['collections: sortedIndex'] = function(test) {
  var numbers = [10, 20, 30, 40, 50], num = 35;
  var index = _.sortedIndex(numbers, num);
  test.equals(index, 3, '35 should be inserted at index 3');
  test.done();
};

exports['collections: toArray'] = function(test) {
  test.ok(!_.isArray(arguments), 'arguments object is not an array');
  test.ok(_.isArray(_.toArray(arguments)), 'arguments object converted into array');

  var numbers = _.toArray({one : 1, two : 2, three : 3});
  test.equals(numbers.join(', '), '1, 2, 3', 'object flattened into array');
  test.done();
};

exports['collections: size'] = function(test) {
  test.equals(_.size({one : 1, two : 2, three : 3}), 3, 'can compute the size of an object');
  test.done();
};

//});
})(typeof exports === 'undefined' ? this['collections'] = {}: exports);
