(function() {
  var _ = typeof require == 'function' ? require('..') : window._;

  QUnit.module('Arrays');

  test('first', function() {
    equal(_.first([1, 2, 3]), 1, 'can pull out the first element of an array');
    equal(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');
    deepEqual(_.first([1, 2, 3], 0), [], 'can pass an index to first');
    deepEqual(_.first([1, 2, 3], 2), [1, 2], 'can pass an index to first');
    deepEqual(_.first([1, 2, 3], 5), [1, 2, 3], 'can pass an index to first');
    var result = (function(){ return _.first(arguments); }(4, 3, 2, 1));
    equal(result, 4, 'works on an arguments object.');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.first);
    deepEqual(result, [1, 1], 'works well with _.map');
    result = (function() { return _.first([1, 2, 3], 2); }());
    deepEqual(result, [1, 2]);

    equal(_.first(null), void 0, 'handles nulls');
    strictEqual(_.first([1, 2, 3], -1).length, 0);
  });

  test('head', function() {
    strictEqual(_.first, _.head, 'alias for first');
  });

  test('take', function() {
    strictEqual(_.first, _.take, 'alias for first');
  });

  test('rest', function() {
    var numbers = [1, 2, 3, 4];
    deepEqual(_.rest(numbers), [2, 3, 4], 'working rest()');
    deepEqual(_.rest(numbers, 0), [1, 2, 3, 4], 'working rest(0)');
    deepEqual(_.rest(numbers, 2), [3, 4], 'rest can take an index');
    var result = (function(){ return _(arguments).rest(); }(1, 2, 3, 4));
    deepEqual(result, [2, 3, 4], 'works on arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.rest);
    deepEqual(_.flatten(result), [2, 3, 2, 3], 'works well with _.map');
    result = (function(){ return _(arguments).rest(); }(1, 2, 3, 4));
    deepEqual(result, [2, 3, 4], 'works on arguments object');
  });

  test('tail', function() {
    strictEqual(_.rest, _.tail, 'alias for rest');
  });

  test('drop', function() {
    strictEqual(_.rest, _.drop, 'alias for rest');
  });

  test('initial', function() {
    deepEqual(_.initial([1, 2, 3, 4, 5]), [1, 2, 3, 4], 'working initial()');
    deepEqual(_.initial([1, 2, 3, 4], 2), [1, 2], 'initial can take an index');
    deepEqual(_.initial([1, 2, 3, 4], 6), [], 'initial can take a large index');
    var result = (function(){ return _(arguments).initial(); }(1, 2, 3, 4));
    deepEqual(result, [1, 2, 3], 'initial works on arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.initial);
    deepEqual(_.flatten(result), [1, 2, 1, 2], 'initial works with _.map');
  });

  test('last', function() {
    equal(_.last([1, 2, 3]), 3, 'can pull out the last element of an array');
    deepEqual(_.last([1, 2, 3], 0), [], 'can pass an index to last');
    deepEqual(_.last([1, 2, 3], 2), [2, 3], 'can pass an index to last');
    deepEqual(_.last([1, 2, 3], 5), [1, 2, 3], 'can pass an index to last');
    var result = (function(){ return _(arguments).last(); }(1, 2, 3, 4));
    equal(result, 4, 'works on an arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.last);
    deepEqual(result, [3, 3], 'works well with _.map');

    equal(_.last(null), void 0, 'handles nulls');
    strictEqual(_.last([1, 2, 3], -1).length, 0);
  });

  test('compact', function() {
    equal(_.compact([0, 1, false, 2, false, 3]).length, 3, 'can trim out all falsy values');
    var result = (function(){ return _.compact(arguments).length; }(0, 1, false, 2, false, 3));
    equal(result, 3, 'works on an arguments object');
  });

  test('flatten', function() {
    deepEqual(_.flatten(null), [], 'Flattens supports null');
    deepEqual(_.flatten(void 0), [], 'Flattens supports undefined');

    deepEqual(_.flatten([[], [[]], []]), [], 'Flattens empty arrays');
    deepEqual(_.flatten([[], [[]], []], true), [[]], 'Flattens empty arrays');

    var list = [1, [2], [3, [[[4]]]]];
    deepEqual(_.flatten(list), [1, 2, 3, 4], 'can flatten nested arrays');
    deepEqual(_.flatten(list, true), [1, 2, 3, [[[4]]]], 'can shallowly flatten nested arrays');
    var result = (function(){ return _.flatten(arguments); }(1, [2], [3, [[[4]]]]));
    deepEqual(result, [1, 2, 3, 4], 'works on an arguments object');
    list = [[1], [2], [3], [[4]]];
    deepEqual(_.flatten(list, true), [1, 2, 3, [4]], 'can shallowly flatten arrays containing only other arrays');

    equal(_.flatten([_.range(10), _.range(10), 5, 1, 3], true).length, 23);
    equal(_.flatten([_.range(10), _.range(10), 5, 1, 3]).length, 23);
    equal(_.flatten([new Array(1000000), _.range(56000), 5, 1, 3]).length, 1056003, 'Flatten can handle massive collections');
    equal(_.flatten([new Array(1000000), _.range(56000), 5, 1, 3], true).length, 1056003, 'Flatten can handle massive collections');

    var x = _.range(100000);
    for (var i = 0; i < 1000; i++) x = [x];
    deepEqual(_.flatten(x), _.range(100000), 'Flatten can handle very deep arrays');
    deepEqual(_.flatten(x, true), x[0], 'Flatten can handle very deep arrays with shallow');
  });

  test('without', function() {
    var list = [1, 2, 1, 0, 3, 1, 4];
    deepEqual(_.without(list, 0, 1), [2, 3, 4], 'can remove all instances of an object');
    var result = (function(){ return _.without(arguments, 0, 1); }(1, 2, 1, 0, 3, 1, 4));
    deepEqual(result, [2, 3, 4], 'works on an arguments object');

    list = [{one: 1}, {two: 2}];
    equal(_.without(list, {one: 1}).length, 2, 'uses real object identity for comparisons.');
    equal(_.without(list, list[0]).length, 1, 'ditto.');
  });

  test('sortedIndex', function() {
    var numbers = [10, 20, 30, 40, 50], num = 35;
    var indexForNum = _.sortedIndex(numbers, num);
    equal(indexForNum, 3, '35 should be inserted at index 3');

    var indexFor30 = _.sortedIndex(numbers, 30);
    equal(indexFor30, 2, '30 should be inserted at index 2');

    var objects = [{x: 10}, {x: 20}, {x: 30}, {x: 40}];
    var iterator = function(obj){ return obj.x; };
    strictEqual(_.sortedIndex(objects, {x: 25}, iterator), 2);
    strictEqual(_.sortedIndex(objects, {x: 35}, 'x'), 3);

    var context = {1: 2, 2: 3, 3: 4};
    iterator = function(obj){ return this[obj]; };
    strictEqual(_.sortedIndex([1, 3], 2, iterator, context), 1);

    var values = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535, 131071, 262143, 524287, 1048575, 2097151, 4194303, 8388607, 16777215, 33554431, 67108863, 134217727, 268435455, 536870911, 1073741823, 2147483647];
    var array = Array(Math.pow(2, 32) - 1);
    var length = values.length;
    while (length--) {
      array[values[length]] = values[length];
    }
    equal(_.sortedIndex(array, 2147483648), 2147483648, 'should work with large indexes');
  });

  test('uniq', function() {
    var list = [1, 2, 1, 3, 1, 4];
    deepEqual(_.uniq(list), [1, 2, 3, 4], 'can find the unique values of an unsorted array');

    list = [1, 1, 1, 2, 2, 3];
    deepEqual(_.uniq(list, true), [1, 2, 3], 'can find the unique values of a sorted array faster');

    list = [{name: 'moe'}, {name: 'curly'}, {name: 'larry'}, {name: 'curly'}];
    var iterator = function(value) { return value.name; };
    deepEqual(_.map(_.uniq(list, false, iterator), iterator), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator');

    deepEqual(_.map(_.uniq(list, iterator), iterator), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator without specifying whether array is sorted');

    iterator = function(value) { return value + 1; };
    list = [1, 2, 2, 3, 4, 4];
    deepEqual(_.uniq(list, true, iterator), [1, 2, 3, 4], 'iterator works with sorted array');

    var kittens = [
      {kitten: 'Celery', cuteness: 8},
      {kitten: 'Juniper', cuteness: 10},
      {kitten: 'Spottis', cuteness: 10}
    ];

    var expected = [
      {kitten: 'Celery', cuteness: 8},
      {kitten: 'Juniper', cuteness: 10}
    ];

    deepEqual(_.uniq(kittens, true, 'cuteness'), expected, 'string iterator works with sorted array');


    var result = (function(){ return _.uniq(arguments); }(1, 2, 1, 3, 1, 4));
    deepEqual(result, [1, 2, 3, 4], 'works on an arguments object');

    var a = {}, b = {}, c = {};
    deepEqual(_.uniq([a, b, a, b, c]), [a, b, c], 'works on values that can be tested for equivalency but not ordered');

    deepEqual(_.uniq(null), []);

    var context = {};
    list = [3];
    _.uniq(list, function(value, index, array) {
      strictEqual(this, context);
      strictEqual(value, 3);
      strictEqual(index, 0);
      strictEqual(array, list);
    }, context);

    deepEqual(_.uniq([{a: 1, b: 1}, {a: 1, b: 2}, {a: 1, b: 3}, {a: 2, b: 1}], 'a'), [{a: 1, b: 1}, {a: 2, b: 1}], 'can use pluck like iterator');
    deepEqual(_.uniq([{0: 1, b: 1}, {0: 1, b: 2}, {0: 1, b: 3}, {0: 2, b: 1}], 0), [{0: 1, b: 1}, {0: 2, b: 1}], 'can use falsey pluck like iterator');
  });

  test('unique', function() {
    strictEqual(_.uniq, _.unique, 'alias for uniq');
  });

  test('intersection', function() {
    var stooges = ['moe', 'curly', 'larry'], leaders = ['moe', 'groucho'];
    deepEqual(_.intersection(stooges, leaders), ['moe'], 'can take the set intersection of two arrays');
    deepEqual(_(stooges).intersection(leaders), ['moe'], 'can perform an OO-style intersection');
    var result = (function(){ return _.intersection(arguments, leaders); }('moe', 'curly', 'larry'));
    deepEqual(result, ['moe'], 'works on an arguments object');
    var theSixStooges = ['moe', 'moe', 'curly', 'curly', 'larry', 'larry'];
    deepEqual(_.intersection(theSixStooges, leaders), ['moe'], 'returns a duplicate-free array');
    result = _.intersection([2, 4, 3, 1], [1, 2, 3]);
    deepEqual(result, [2, 3, 1], 'preserves order of first array');
    result = _.intersection(null, [1, 2, 3]);
    equal(Object.prototype.toString.call(result), '[object Array]', 'returns an empty array when passed null as first argument');
    equal(result.length, 0, 'returns an empty array when passed null as first argument');
    result = _.intersection([1, 2, 3], null);
    equal(Object.prototype.toString.call(result), '[object Array]', 'returns an empty array when passed null as argument beyond the first');
    equal(result.length, 0, 'returns an empty array when passed null as argument beyond the first');
  });

  test('union', function() {
    var result = _.union([1, 2, 3], [2, 30, 1], [1, 40]);
    deepEqual(result, [1, 2, 3, 30, 40], 'takes the union of a list of arrays');

    result = _.union([1, 2, 3], [2, 30, 1], [1, 40, [1]]);
    deepEqual(result, [1, 2, 3, 30, 40, [1]], 'takes the union of a list of nested arrays');

    var args = null;
    (function(){ args = arguments; }(1, 2, 3));
    result = _.union(args, [2, 30, 1], [1, 40]);
    deepEqual(result, [1, 2, 3, 30, 40], 'takes the union of a list of arrays');

    result = _.union([1, 2, 3], 4);
    deepEqual(result, [1, 2, 3], 'restrict the union to arrays only');
  });

  test('difference', function() {
    var result = _.difference([1, 2, 3], [2, 30, 40]);
    deepEqual(result, [1, 3], 'takes the difference of two arrays');

    result = _.difference([1, 2, 3, 4], [2, 30, 40], [1, 11, 111]);
    deepEqual(result, [3, 4], 'takes the difference of three arrays');

    result = _.difference([1, 2, 3], 1);
    deepEqual(result, [1, 2, 3], 'restrict the difference to arrays only');
  });

  test('zip', function() {
    var names = ['moe', 'larry', 'curly'], ages = [30, 40, 50], leaders = [true];
    deepEqual(_.zip(names, ages, leaders), [
      ['moe', 30, true],
      ['larry', 40, void 0],
      ['curly', 50, void 0]
    ], 'zipped together arrays of different lengths');

    var stooges = _.zip(['moe', 30, 'stooge 1'], ['larry', 40, 'stooge 2'], ['curly', 50, 'stooge 3']);
    deepEqual(stooges, [['moe', 'larry', 'curly'], [30, 40, 50], ['stooge 1', 'stooge 2', 'stooge 3']], 'zipped pairs');

    // In the case of difference lengths of the tuples undefineds
    // should be used as placeholder
    stooges = _.zip(['moe', 30], ['larry', 40], ['curly', 50, 'extra data']);
    deepEqual(stooges, [['moe', 'larry', 'curly'], [30, 40, 50], [void 0, void 0, 'extra data']], 'zipped pairs with empties');

    var empty = _.zip([]);
    deepEqual(empty, [], 'unzipped empty');

    deepEqual(_.zip(null), [], 'handles null');
    deepEqual(_.zip(), [], '_.zip() returns []');
  });

  test('unzip', function() {
    deepEqual(_.unzip(null), [], 'handles null');

    deepEqual(_.unzip([['a', 'b'], [1, 2]]), [['a', 1], ['b', 2]]);

    // complements zip
    var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
    deepEqual(_.unzip(zipped), [['fred', 'barney'], [30, 40], [true, false]]);

    zipped = _.zip(['moe', 30], ['larry', 40], ['curly', 50, 'extra data']);
    deepEqual(_.unzip(zipped), [['moe', 30, void 0], ['larry', 40, void 0], ['curly', 50, 'extra data']], 'Uses length of largest array');
  });

  test('object', function() {
    var result = _.object(['moe', 'larry', 'curly'], [30, 40, 50]);
    var shouldBe = {moe: 30, larry: 40, curly: 50};
    deepEqual(result, shouldBe, 'two arrays zipped together into an object');

    result = _.object([['one', 1], ['two', 2], ['three', 3]]);
    shouldBe = {one: 1, two: 2, three: 3};
    deepEqual(result, shouldBe, 'an array of pairs zipped together into an object');

    var stooges = {moe: 30, larry: 40, curly: 50};
    deepEqual(_.object(_.pairs(stooges)), stooges, 'an object converted to pairs and back to an object');

    deepEqual(_.object(null), {}, 'handles nulls');
  });

  test('indexOf', function() {
    var numbers = [1, 2, 3];
    equal(_.indexOf(numbers, 2), 1, 'can compute indexOf');
    var result = (function(){ return _.indexOf(arguments, 2); }(1, 2, 3));
    equal(result, 1, 'works on an arguments object');

    _.each([null, void 0, [], false], function(val) {
      var msg = 'Handles: ' + (_.isArray(val) ? '[]' : val);
      equal(_.indexOf(val, 2), -1, msg);
      equal(_.indexOf(val, 2, -1), -1, msg);
      equal(_.indexOf(val, 2, -20), -1, msg);
      equal(_.indexOf(val, 2, 15), -1, msg);
    });

    var num = 35;
    numbers = [10, 20, 30, 40, 50];
    var index = _.indexOf(numbers, num, true);
    equal(index, -1, '35 is not in the list');

    numbers = [10, 20, 30, 40, 50]; num = 40;
    index = _.indexOf(numbers, num, true);
    equal(index, 3, '40 is in the list');

    numbers = [1, 40, 40, 40, 40, 40, 40, 40, 50, 60, 70]; num = 40;
    equal(_.indexOf(numbers, num, true), 1, '40 is in the list');
    equal(_.indexOf(numbers, 6, true), -1, '6 isnt in the list');
    equal(_.indexOf([1, 2, 5, 4, 6, 7], 5, true), -1, 'sorted indexOf doesn\'t uses binary search');
    ok(_.every(['1', [], {}, null], function() {
      return _.indexOf(numbers, num, {}) === 1;
    }), 'non-nums as fromIndex make indexOf assume sorted');

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    index = _.indexOf(numbers, 2, 5);
    equal(index, 7, 'supports the fromIndex argument');

    index = _.indexOf([,,, 0], void 0);
    equal(index, 0, 'treats sparse arrays as if they were dense');

    var array = [1, 2, 3, 1, 2, 3];
    strictEqual(_.indexOf(array, 1, -3), 3, 'neg `fromIndex` starts at the right index');
    strictEqual(_.indexOf(array, 1, -2), -1, 'neg `fromIndex` starts at the right index');
    strictEqual(_.indexOf(array, 2, -3), 4);
    _.each([-6, -8, -Infinity], function(fromIndex) {
      strictEqual(_.indexOf(array, 1, fromIndex), 0);
    });
    strictEqual(_.indexOf([1, 2, 3], 1, true), 0);

    index = _.indexOf([], void 0, true);
    equal(index, -1, 'empty array with truthy `isSorted` returns -1');
  });

  test('indexOf with NaN', function() {
    strictEqual(_.indexOf([1, 2, NaN, NaN], NaN), 2, 'Expected [1, 2, NaN] to contain NaN');
    strictEqual(_.indexOf([1, 2, Infinity], NaN), -1, 'Expected [1, 2, NaN] to contain NaN');

    strictEqual(_.indexOf([1, 2, NaN, NaN], NaN, 1), 2, 'startIndex does not affect result');
    strictEqual(_.indexOf([1, 2, NaN, NaN], NaN, -2), 2, 'startIndex does not affect result');

    (function() {
      strictEqual(_.indexOf(arguments, NaN), 2, 'Expected arguments [1, 2, NaN] to contain NaN');
    }(1, 2, NaN, NaN));
  });

  test('indexOf with +- 0', function() {
    _.each([-0, +0], function(val) {
      strictEqual(_.indexOf([1, 2, val, val], val), 2);
      strictEqual(_.indexOf([1, 2, val, val], -val), 2);
    });
  });

  test('lastIndexOf', function() {
    var numbers = [1, 0, 1];
    var falsey = [void 0, '', 0, false, NaN, null, void 0];
    equal(_.lastIndexOf(numbers, 1), 2);

    numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
    numbers.lastIndexOf = null;
    equal(_.lastIndexOf(numbers, 1), 5, 'can compute lastIndexOf, even without the native function');
    equal(_.lastIndexOf(numbers, 0), 8, 'lastIndexOf the other element');
    var result = (function(){ return _.lastIndexOf(arguments, 1); }(1, 0, 1, 0, 0, 1, 0, 0, 0));
    equal(result, 5, 'works on an arguments object');

    _.each([null, void 0, [], false], function(val) {
      var msg = 'Handles: ' + (_.isArray(val) ? '[]' : val);
      equal(_.lastIndexOf(val, 2), -1, msg);
      equal(_.lastIndexOf(val, 2, -1), -1, msg);
      equal(_.lastIndexOf(val, 2, -20), -1, msg);
      equal(_.lastIndexOf(val, 2, 15), -1, msg);
    });

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    var index = _.lastIndexOf(numbers, 2, 2);
    equal(index, 1, 'supports the fromIndex argument');

    var array = [1, 2, 3, 1, 2, 3];

    strictEqual(_.lastIndexOf(array, 1, 0), 0, 'starts at the correct from idx');
    strictEqual(_.lastIndexOf(array, 3), 5, 'should return the index of the last matched value');
    strictEqual(_.lastIndexOf(array, 4), -1, 'should return `-1` for an unmatched value');

    strictEqual(_.lastIndexOf(array, 1, 2), 0, 'should work with a positive `fromIndex`');

    _.each([6, 8, Math.pow(2, 32), Infinity], function(fromIndex) {
      strictEqual(_.lastIndexOf(array, void 0, fromIndex), -1);
      strictEqual(_.lastIndexOf(array, 1, fromIndex), 3);
      strictEqual(_.lastIndexOf(array, '', fromIndex), -1);
    });

    var expected = _.map(falsey, function(value) {
      return typeof value == 'number' ? -1 : 5;
    });

    var actual = _.map(falsey, function(fromIndex) {
      return _.lastIndexOf(array, 3, fromIndex);
    });

    deepEqual(actual, expected, 'should treat falsey `fromIndex` values, except `0` and `NaN`, as `array.length`');
    strictEqual(_.lastIndexOf(array, 3, '1'), 5, 'should treat non-number `fromIndex` values as `array.length`');
    strictEqual(_.lastIndexOf(array, 3, true), 5, 'should treat non-number `fromIndex` values as `array.length`');

    strictEqual(_.lastIndexOf(array, 2, -3), 1, 'should work with a negative `fromIndex`');
    strictEqual(_.lastIndexOf(array, 1, -3), 3, 'neg `fromIndex` starts at the right index');

    deepEqual(_.map([-6, -8, -Infinity], function(fromIndex) {
      return _.lastIndexOf(array, 1, fromIndex);
    }), [0, -1, -1]);
  });

  test('lastIndexOf with NaN', function() {
    strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN), 3, 'Expected [1, 2, NaN] to contain NaN');
    strictEqual(_.lastIndexOf([1, 2, Infinity], NaN), -1, 'Expected [1, 2, NaN] to contain NaN');

    strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN, 2), 2, 'fromIndex does not affect result');
    strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN, -2), 2, 'fromIndex does not affect result');

    (function() {
      strictEqual(_.lastIndexOf(arguments, NaN), 3, 'Expected arguments [1, 2, NaN] to contain NaN');
    }(1, 2, NaN, NaN));
  });

  test('lastIndexOf with +- 0', function() {
    _.each([-0, +0], function(val) {
      strictEqual(_.lastIndexOf([1, 2, val, val], val), 3);
      strictEqual(_.lastIndexOf([1, 2, val, val], -val), 3);
      strictEqual(_.lastIndexOf([-1, 1, 2], -val), -1);
    });
  });

  test('findIndex', function() {
    var objects = [
      {a: 0, b: 0},
      {a: 1, b: 1},
      {a: 2, b: 2},
      {a: 0, b: 0}
    ];

    equal(_.findIndex(objects, function(obj) {
      return obj.a === 0;
    }), 0);

    equal(_.findIndex(objects, function(obj) {
      return obj.b * obj.a === 4;
    }), 2);

    equal(_.findIndex(objects, 'a'), 1, 'Uses lookupIterator');

    equal(_.findIndex(objects, function(obj) {
      return obj.b * obj.a === 5;
    }), -1);

    equal(_.findIndex(null, _.noop), -1);
    strictEqual(_.findIndex(objects, function(a) {
      return a.foo === null;
    }), -1);
    _.findIndex([{a: 1}], function(a, key, obj) {
      equal(key, 0);
      deepEqual(obj, [{a: 1}]);
      strictEqual(this, objects, 'called with context');
    }, objects);

    var sparse = [];
    sparse[20] = {a: 2, b: 2};
    equal(_.findIndex(sparse, function(obj) {
      return obj && obj.b * obj.a === 4;
    }), 20, 'Works with sparse arrays');

    var array = [1, 2, 3, 4];
    array.match = 55;
    strictEqual(_.findIndex(array, function(x) { return x === 55; }), -1, 'doesn\'t match array-likes keys');
  });

  test('findLastIndex', function() {
    var objects = [
      {a: 0, b: 0},
      {a: 1, b: 1},
      {a: 2, b: 2},
      {a: 0, b: 0}
    ];

    equal(_.findLastIndex(objects, function(obj) {
      return obj.a === 0;
    }), 3);

    equal(_.findLastIndex(objects, function(obj) {
      return obj.b * obj.a === 4;
    }), 2);

    equal(_.findLastIndex(objects, 'a'), 2, 'Uses lookupIterator');

    equal(_.findLastIndex(objects, function(obj) {
      return obj.b * obj.a === 5;
    }), -1);

    equal(_.findLastIndex(null, _.noop), -1);
    strictEqual(_.findLastIndex(objects, function(a) {
      return a.foo === null;
    }), -1);
    _.findLastIndex([{a: 1}], function(a, key, obj) {
      equal(key, 0);
      deepEqual(obj, [{a: 1}]);
      strictEqual(this, objects, 'called with context');
    }, objects);

    var sparse = [];
    sparse[20] = {a: 2, b: 2};
    equal(_.findLastIndex(sparse, function(obj) {
      return obj && obj.b * obj.a === 4;
    }), 20, 'Works with sparse arrays');

    var array = [1, 2, 3, 4];
    array.match = 55;
    strictEqual(_.findLastIndex(array, function(x) { return x === 55; }), -1, 'doesn\'t match array-likes keys');
  });

  test('range', function() {
    deepEqual(_.range(0), [], 'range with 0 as a first argument generates an empty array');
    deepEqual(_.range(4), [0, 1, 2, 3], 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
    deepEqual(_.range(5, 8), [5, 6, 7], 'range with two arguments a &amp; b, a&lt;b generates an array of elements a,a+1,a+2,...,b-2,b-1');
    deepEqual(_.range(8, 5), [], 'range with two arguments a &amp; b, b&lt;a generates an empty array');
    deepEqual(_.range(3, 10, 3), [3, 6, 9], 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
    deepEqual(_.range(3, 10, 15), [3], 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
    deepEqual(_.range(12, 7, -2), [12, 10, 8], 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
    deepEqual(_.range(0, -10, -1), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9], 'final example in the Python docs');
  });

}());
