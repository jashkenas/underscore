var test = require('tape');
var _ = require('../underscore');

(function() {

  test('each', function(t) {
    _.each([1, 2, 3], function(num, i) {
      t.is(num, i + 1, 'each iterators provide value and iteration count');
    });

    var answers = [];
    _.each([1, 2, 3], function(num){ answers.push(num * this.multiplier);}, {multiplier : 5});
    t.is(answers.join(', '), '5, 10, 15', 'context object property accessed');

    answers = [];
    _.forEach([1, 2, 3], function(num){ answers.push(num); });
    t.is(answers.join(', '), '1, 2, 3', 'aliased as "forEach"');

    answers = [];
    var obj = {one : 1, two : 2, three : 3};
    obj.constructor.prototype.four = 4;
    _.each(obj, function(value, key){ answers.push(key); });
    t.is(answers.join(', '), 'one, two, three', 'iterating over objects works, and ignores the object prototype.');
    delete obj.constructor.prototype.four;

    var answer = null;
    _.each([1, 2, 3], function(num, index, arr){ if (_.include(arr, num)) answer = true; });
    t.ok(answer, 'can reference the original collection from inside the iterator');

    answers = 0;
    _.each(null, function(){ ++answers; });
    t.is(answers, 0, 'handles a null properly');

    _.each(false, function(){});

    var a = [1, 2, 3];
    t.is(_.each(a, function(){}), a);
    t.is(_.each(null, function(){}), null);
    t.end();
  });

  test('map', function(t) {
    var doubled = _.map([1, 2, 3], function(num){ return num * 2; });
    t.is(doubled.join(', '), '2, 4, 6', 'doubled numbers');

    doubled = _.collect([1, 2, 3], function(num){ return num * 2; });
    t.is(doubled.join(', '), '2, 4, 6', 'aliased as "collect"');

    var tripled = _.map([1, 2, 3], function(num){ return num * this.multiplier; }, {multiplier : 3});
    t.is(tripled.join(', '), '3, 6, 9', 'tripled numbers with context');

    var doubled = _([1, 2, 3]).map(function(num){ return num * 2; });
    t.is(doubled.join(', '), '2, 4, 6', 'OO-style doubled numbers');

    var ids = _.map({length: 2, 0: {id: '1'}, 1: {id: '2'}}, function(n){
      return n.id;
    });
    t.same(ids, ['1', '2'], 'Can use collection methods on Array-likes.');

    var ifnull = _.map(null, function(){});
    t.ok(_.isArray(ifnull) && ifnull.length === 0, 'handles a null properly');
    t.end();
  });

  test('reduce', function(t) {
    var sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; }, 0);
    t.is(sum, 6, 'can sum up an array');

    var context = {multiplier : 3};
    sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num * this.multiplier; }, 0, context);
    t.is(sum, 18, 'can reduce with a context object');

    sum = _.inject([1, 2, 3], function(sum, num){ return sum + num; }, 0);
    t.is(sum, 6, 'aliased as "inject"');

    sum = _([1, 2, 3]).reduce(function(sum, num){ return sum + num; }, 0);
    t.is(sum, 6, 'OO-style reduce');

    var sum = _.reduce([1, 2, 3], function(sum, num){ return sum + num; });
    t.is(sum, 6, 'default initial value');

    var prod = _.reduce([1, 2, 3, 4], function(prod, num){ return prod * num; });
    t.is(prod, 24, 'can reduce via multiplication');

    var ifnull;
    try {
      _.reduce(null, function(){});
    } catch (ex) {
      ifnull = ex;
    }
    t.ok(ifnull instanceof TypeError, 'handles a null (without initial value) properly');

    t.ok(_.reduce(null, function(){}, 138) === 138, 'handles a null (with initial value) properly');
    t.is(_.reduce([], function(){}, undefined), undefined, 'undefined can be passed as a special case');
    t.throws(function() { _.reduce([], function(){}); }, TypeError, 'throws an error for empty arrays with no initial value');
    t.end();
  });

  test('reduceRight', function(t) {
    var list = _.reduceRight(['foo', 'bar', 'baz'], function(memo, str){ return memo + str; }, '');
    t.is(list, 'bazbarfoo', 'can perform right folds');

    var list = _.foldr(['foo', 'bar', 'baz'], function(memo, str){ return memo + str; }, '');
    t.is(list, 'bazbarfoo', 'aliased as "foldr"');

    var list = _.foldr(['foo', 'bar', 'baz'], function(memo, str){ return memo + str; });
    t.is(list, 'bazbarfoo', 'default initial value');

    var ifnull;
    try {
      _.reduceRight(null, function(){});
    } catch (ex) {
      ifnull = ex;
    }
    t.ok(ifnull instanceof TypeError, 'handles a null (without initial value) properly');

    var sum = _.reduceRight({a: 1, b: 2, c: 3}, function(sum, num){ return sum + num; });
    t.is(sum, 6, 'default initial value on object');

    t.ok(_.reduceRight(null, function(){}, 138) === 138, 'handles a null (with initial value) properly');

    t.is(_.reduceRight([], function(){}, undefined), undefined, 'undefined can be passed as a special case');
    t.throws(function() { _.reduceRight([], function(){}); }, TypeError, 'throws an error for empty arrays with no initial value');

    // Assert that the correct arguments are being passed.

    var args,
        memo = {},
        object = {a: 1, b: 2},
        lastKey = _.keys(object).pop();

    var expected = lastKey == 'a'
      ? [memo, 1, 'a', object]
      : [memo, 2, 'b', object];

    _.reduceRight(object, function() {
      args || (args = _.toArray(arguments));
    }, memo);

    t.same(args, expected);

    // And again, with numeric keys.

    object = {'2': 'a', '1': 'b'};
    lastKey = _.keys(object).pop();
    args = null;

    expected = lastKey == '2'
      ? [memo, 'a', '2', object]
      : [memo, 'b', '1', object];

    _.reduceRight(object, function() {
      args || (args = _.toArray(arguments));
    }, memo);

    t.same(args, expected);
    t.end();
  });

  test('find', function(t) {
    var array = [1, 2, 3, 4];
    t.is(_.find(array, function(n) { return n > 2; }), 3, 'should return first found `value`');
    t.is(_.find(array, function() { return false; }), void 0, 'should return `undefined` if `value` is not found');
    t.end();
  });

  test('detect', function(t) {
    var result = _.detect([1, 2, 3], function(num){ return num * 2 == 4; });
    t.is(result, 2, 'found the first "2" and broke the loop');
    t.end();
  });

  test('select', function(t) {
    var evens = _.select([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
    t.is(evens.join(', '), '2, 4, 6', 'selected each even number');

    evens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
    t.is(evens.join(', '), '2, 4, 6', 'aliased as "filter"');
    t.end();
  });

  test('reject', function(t) {
    var odds = _.reject([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
    t.is(odds.join(', '), '1, 3, 5', 'rejected each even number');

    var context = 'obj';

    var evens = _.reject([1, 2, 3, 4, 5, 6], function(num){
      t.is(context, 'obj');
      return num % 2 != 0;
    }, context);
    t.is(evens.join(', '), '2, 4, 6', 'rejected each odd number');
    t.end();
  });

  test('all', function(t) {
    t.ok(_.all([], _.identity), 'the empty set');
    t.ok(_.all([true, true, true], _.identity), 'all true values');
    t.ok(!_.all([true, false, true], _.identity), 'one false value');
    t.ok(_.all([0, 10, 28], function(num){ return num % 2 == 0; }), 'even numbers');
    t.ok(!_.all([0, 11, 28], function(num){ return num % 2 == 0; }), 'an odd number');
    t.ok(_.all([1], _.identity) === true, 'cast to boolean - true');
    t.ok(_.all([0], _.identity) === false, 'cast to boolean - false');
    t.ok(_.every([true, true, true], _.identity), 'aliased as "every"');
    t.ok(!_.all([undefined, undefined, undefined], _.identity), 'works with arrays of undefined');
    t.end();
  });

  test('any', function(t) {
    var nativeSome = Array.prototype.some;
    Array.prototype.some = null;
    t.ok(!_.any([]), 'the empty set');
    t.ok(!_.any([false, false, false]), 'all false values');
    t.ok(_.any([false, false, true]), 'one true value');
    t.ok(_.any([null, 0, 'yes', false]), 'a string');
    t.ok(!_.any([null, 0, '', false]), 'falsy values');
    t.ok(!_.any([1, 11, 29], function(num){ return num % 2 == 0; }), 'all odd numbers');
    t.ok(_.any([1, 10, 29], function(num){ return num % 2 == 0; }), 'an even number');
    t.ok(_.any([1], _.identity) === true, 'cast to boolean - true');
    t.ok(_.any([0], _.identity) === false, 'cast to boolean - false');
    t.ok(_.some([false, false, true]), 'aliased as "some"');
    Array.prototype.some = nativeSome;
    t.end();
  });

  test('include', function(t) {
    t.ok(_.include([1,2,3], 2), 'two is in the array');
    t.ok(!_.include([1,3,9], 2), 'two is not in the array');
    t.ok(_.contains({moe:1, larry:3, curly:9}, 3) === true, '_.include on objects checks their values');
    t.ok(_([1,2,3]).include(2), 'OO-style include');
    t.end();
  });

  test('invoke', function(t) {
    var list = [[5, 1, 7], [3, 2, 1]];
    var result = _.invoke(list, 'sort');
    t.is(result[0].join(', '), '1, 5, 7', 'first array sorted');
    t.is(result[1].join(', '), '1, 2, 3', 'second array sorted');
    t.end();
  });

  test('invoke w/ function reference', function(t) {
    var list = [[5, 1, 7], [3, 2, 1]];
    var result = _.invoke(list, Array.prototype.sort);
    t.is(result[0].join(', '), '1, 5, 7', 'first array sorted');
    t.is(result[1].join(', '), '1, 2, 3', 'second array sorted');
    t.end();
  });

  // Relevant when using ClojureScript
  test('invoke when strings have a call method', function(t) {
    String.prototype.call = function() {
      return 42;
    };
    var list = [[5, 1, 7], [3, 2, 1]];
    var s = 'foo';
    t.is(s.call(), 42, 'call function exists');
    var result = _.invoke(list, 'sort');
    t.is(result[0].join(', '), '1, 5, 7', 'first array sorted');
    t.is(result[1].join(', '), '1, 2, 3', 'second array sorted');
    delete String.prototype.call;
    t.is(s.call, undefined, 'call function removed');
    t.end();
  });

  test('pluck', function(t) {
    var people = [{name : 'moe', age : 30}, {name : 'curly', age : 50}];
    t.is(_.pluck(people, 'name').join(', '), 'moe, curly', 'pulls names out of objects');
    t.end();
  });

  test('where', function(t) {
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    var result = _.where(list, {a: 1});
    t.is(result.length, 3);
    t.is(result[result.length - 1].b, 4);
    result = _.where(list, {b: 2});
    t.is(result.length, 2);
    t.is(result[0].a, 1);

    result = _.where(list, {a: 1}, true);
    t.is(result.b, 2, 'Only get the first object matched.')
    result = _.where(list, {a: 1}, false);
    t.is(result.length, 3);

    result = _.where(list, {});
    t.is(result.length, list.length);
    result = _.where(list, {}, true);
    t.is(result, list[0]);
    t.end();
  });

  test('findWhere', function(t) {
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
    var result = _.findWhere(list, {a: 1});
    t.same(result, {a: 1, b: 2});
    result = _.findWhere(list, {b: 4});
    t.same(result, {a: 1, b: 4});

    result = _.findWhere(list, {c:1})
    t.ok(_.isUndefined(result), 'undefined when not found');

    result = _.findWhere([], {c:1});
    t.ok(_.isUndefined(result), 'undefined when searching empty list');
    t.end();
  });

  test('max', function(t) {
    t.is(3, _.max([1, 2, 3]), 'can perform a regular Math.max');

    var neg = _.max([1, 2, 3], function(num){ return -num; });
    t.is(neg, 1, 'can perform a computation-based max');

    t.is(-Infinity, _.max({}), 'Maximum value of an empty object');
    t.is(-Infinity, _.max([]), 'Maximum value of an empty array');
    t.is(_.max({'a': 'a'}), -Infinity, 'Maximum value of a non-numeric collection');

    t.is(299999, _.max(_.range(1,300000)), 'Maximum value of a too-big array');
    t.end();
  });

  test('min', function(t) {
    t.is(1, _.min([1, 2, 3]), 'can perform a regular Math.min');

    var neg = _.min([1, 2, 3], function(num){ return -num; });
    t.is(neg, 3, 'can perform a computation-based min');

    t.is(Infinity, _.min({}), 'Minimum value of an empty object');
    t.is(Infinity, _.min([]), 'Minimum value of an empty array');
    t.is(_.min({'a': 'a'}), Infinity, 'Minimum value of a non-numeric collection');

    var now = new Date(9999999999);
    var then = new Date(0);
    t.is(_.min([now, then]), then);

    t.is(1, _.min(_.range(1,300000)), 'Minimum value of a too-big array');
    t.end();
  });

  test('sortBy', function(t) {
    var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
    people = _.sortBy(people, function(person){ return person.age; });
    t.is(_.pluck(people, 'name').join(', '), 'moe, curly', 'stooges sorted by age');

    var list = [undefined, 4, 1, undefined, 3, 2];
    t.is(_.sortBy(list, _.identity).join(','), '1,2,3,4,,', 'sortBy with undefined values');

    var list = ['one', 'two', 'three', 'four', 'five'];
    var sorted = _.sortBy(list, 'length');
    t.is(sorted.join(' '), 'one two four five three', 'sorted by length');

    function Pair(x, y) {
      this.x = x;
      this.y = y;
    }

    var collection = [
      new Pair(1, 1), new Pair(1, 2),
      new Pair(1, 3), new Pair(1, 4),
      new Pair(1, 5), new Pair(1, 6),
      new Pair(2, 1), new Pair(2, 2),
      new Pair(2, 3), new Pair(2, 4),
      new Pair(2, 5), new Pair(2, 6),
      new Pair(undefined, 1), new Pair(undefined, 2),
      new Pair(undefined, 3), new Pair(undefined, 4),
      new Pair(undefined, 5), new Pair(undefined, 6)
    ];

    var actual = _.sortBy(collection, function(pair) {
      return pair.x;
    });

    t.same(actual, collection, 'sortBy should be stable');

    var list = ['q', 'w', 'e', 'r', 't', 'y'];
    t.is(_.sortBy(list).join(''), 'eqrtwy', 'uses _.identity if iterator is not specified');
    t.end();
  });

  test('groupBy', function(t) {
    var parity = _.groupBy([1, 2, 3, 4, 5, 6], function(num){ return num % 2; });
    t.ok('0' in parity && '1' in parity, 'created a group for each value');
    t.is(parity[0].join(', '), '2, 4, 6', 'put each even number in the right group');

    var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    var grouped = _.groupBy(list, 'length');
    t.is(grouped['3'].join(' '), 'one two six ten');
    t.is(grouped['4'].join(' '), 'four five nine');
    t.is(grouped['5'].join(' '), 'three seven eight');

    var context = {};
    _.groupBy([{}], function(){ t.ok(this === context); }, context);

    grouped = _.groupBy([4.2, 6.1, 6.4], function(num) {
      return Math.floor(num) > 4 ? 'hasOwnProperty' : 'constructor';
    });
    t.is(grouped.constructor.length, 1);
    t.is(grouped.hasOwnProperty.length, 2);

    var array = [{}];
    _.groupBy(array, function(value, index, obj){ t.ok(obj === array); });

    var array = [1, 2, 1, 2, 3];
    var grouped = _.groupBy(array);
    t.is(grouped['1'].length, 2);
    t.is(grouped['3'].length, 1);

    var matrix = [
      [1,2],
      [1,3],
      [2,3]
    ];
    t.same(_.groupBy(matrix, 0), {1: [[1,2], [1,3]], 2: [[2,3]]})
    t.same(_.groupBy(matrix, 1), {2: [[1,2]], 3: [[1,3], [2,3]]})
    t.end();
  });

  test('indexBy', function(t) {
    var parity = _.indexBy([1, 2, 3, 4, 5], function(num){ return num % 2 == 0; });
    t.is(parity['true'], 4);
    t.is(parity['false'], 5);

    var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    var grouped = _.indexBy(list, 'length');
    t.is(grouped['3'], 'ten');
    t.is(grouped['4'], 'nine');
    t.is(grouped['5'], 'eight');

    var array = [1, 2, 1, 2, 3];
    var grouped = _.indexBy(array);
    t.is(grouped['1'], 1);
    t.is(grouped['2'], 2);
    t.is(grouped['3'], 3);
    t.end();
  });

  test('countBy', function(t) {
    var parity = _.countBy([1, 2, 3, 4, 5], function(num){ return num % 2 == 0; });
    t.is(parity['true'], 2);
    t.is(parity['false'], 3);

    var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    var grouped = _.countBy(list, 'length');
    t.is(grouped['3'], 4);
    t.is(grouped['4'], 3);
    t.is(grouped['5'], 3);

    var context = {};
    _.countBy([{}], function(){ t.ok(this === context); }, context);

    grouped = _.countBy([4.2, 6.1, 6.4], function(num) {
      return Math.floor(num) > 4 ? 'hasOwnProperty' : 'constructor';
    });
    t.is(grouped.constructor, 1);
    t.is(grouped.hasOwnProperty, 2);

    var array = [{}];
    _.countBy(array, function(value, index, obj){ t.ok(obj === array); });

    var array = [1, 2, 1, 2, 3];
    var grouped = _.countBy(array);
    t.is(grouped['1'], 2);
    t.is(grouped['3'], 1);
    t.end();
  });

  test('sortedIndex', function(t) {
    var numbers = [10, 20, 30, 40, 50], num = 35;
    var indexForNum = _.sortedIndex(numbers, num);
    t.is(indexForNum, 3, '35 should be inserted at index 3');

    var indexFor30 = _.sortedIndex(numbers, 30);
    t.is(indexFor30, 2, '30 should be inserted at index 2');

    var objects = [{x: 10}, {x: 20}, {x: 30}, {x: 40}];
    var iterator = function(obj){ return obj.x; };
    t.is(_.sortedIndex(objects, {x: 25}, iterator), 2);
    t.is(_.sortedIndex(objects, {x: 35}, 'x'), 3);

    var context = {1: 2, 2: 3, 3: 4};
    iterator = function(obj){ return this[obj]; };
    t.is(_.sortedIndex([1, 3], 2, iterator, context), 1);
    t.end();
  });

  test('shuffle', function(t) {
    var numbers = _.range(10);
    var shuffled = _.shuffle(numbers).sort();
    t.isNot(numbers, shuffled, 'original object is unmodified');
    t.is(shuffled.join(','), numbers.join(','), 'contains the same members before and after shuffle');
    t.end();
  });

  test('sample', function(t) {
    var numbers = _.range(10);
    var all_sampled = _.sample(numbers, 10).sort();
    t.is(all_sampled.join(','), numbers.join(','), 'contains the same members before and after sample');
    all_sampled = _.sample(numbers, 20).sort();
    t.is(all_sampled.join(','), numbers.join(','), 'also works when sampling more objects than are present');
    t.ok(_.contains(numbers, _.sample(numbers)), 'sampling a single element returns something from the array');
    t.is(_.sample([]), undefined, 'sampling empty array with no number returns undefined');
    t.isNot(_.sample([], 5), [], 'sampling empty array with a number returns an empty array');
    t.isNot(_.sample([1, 2, 3], 0), [], 'sampling an array with 0 picks returns an empty array');
    t.same(_.sample([1, 2], -1), [], 'sampling a negative number of picks returns an empty array');
    t.ok(_.contains([1, 2, 3], _.sample({a: 1, b: 2, c: 3})), 'sample one value from an object');
    t.end();
  });

  test('toArray', function(t) {
    t.ok(!_.isArray(arguments), 'arguments object is not an array');
    t.ok(_.isArray(_.toArray(arguments)), 'arguments object converted into array');
    var a = [1,2,3];
    t.ok(_.toArray(a) !== a, 'array is cloned');
    t.is(_.toArray(a).join(', '), '1, 2, 3', 'cloned array contains same elements');

    var numbers = _.toArray({one : 1, two : 2, three : 3});
    t.is(numbers.join(', '), '1, 2, 3', 'object flattened into array');

    // test in IE < 9
    if (typeof document !== 'undefined') {
      try {
        var actual = _.toArray(document.childNodes);
      } catch(ex) { }
      t.ok(_.isArray(actual), 'should not throw converting a node list');
    }

    t.end();
  });

  test('size', function(t) {
    t.is(_.size({one : 1, two : 2, three : 3}), 3, 'can compute the size of an object');
    t.is(_.size([1, 2, 3]), 3, 'can compute the size of an array');
    t.is(_.size({length: 3, 0: 0, 1: 0, 2: 0}), 3, 'can compute the size of Array-likes');

    var func = function() {
      return _.size(arguments);
    };

    t.is(func(1, 2, 3, 4), 4, 'can test the size of the arguments object');

    t.is(_.size('hello'), 5, 'can compute the size of a string literal');
    t.is(_.size(new String('hello')), 5, 'can compute the size of string object');

    t.is(_.size(null), 0, 'handles nulls');
    t.end();
  });

})();
