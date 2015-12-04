(function() {
  var _ = typeof require == 'function' ? require('..') : window._;

  QUnit.module('Arrays');

  test('first', function(assert) {
    assert.equal(_.first([1, 2, 3]), 1, 'can pull out the first element of an array');
    assert.equal(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');
    assert.deepEqual(_.first([1, 2, 3], 0), [], 'returns an empty array when n <= 0 (0 case)');
    assert.deepEqual(_.first([1, 2, 3], -1), [], 'returns an empty array when n <= 0 (negative case)');
    assert.deepEqual(_.first([1, 2, 3], 2), [1, 2], 'can fetch the first n elements');
    assert.deepEqual(_.first([1, 2, 3], 5), [1, 2, 3], 'returns the whole array if n > length');
    var result = (function(){ return _.first(arguments); }(4, 3, 2, 1));
    assert.equal(result, 4, 'works on an arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.first);
    assert.deepEqual(result, [1, 1], 'works well with _.map');
    assert.equal(_.first(null), void 0, 'returns undefined when called on null');
  });

  test('head', function(assert) {
    assert.strictEqual(_.head, _.first, 'is an alias for first');
  });

  test('take', function(assert) {
    assert.strictEqual(_.take, _.first, 'is an alias for first');
  });

  test('rest', function(assert) {
    var numbers = [1, 2, 3, 4];
    assert.deepEqual(_.rest(numbers), [2, 3, 4], 'fetches all but the first element');
    assert.deepEqual(_.rest(numbers, 0), [1, 2, 3, 4], 'returns the whole array when index is 0');
    assert.deepEqual(_.rest(numbers, 2), [3, 4], 'returns elements starting at the given index');
    var result = (function(){ return _(arguments).rest(); }(1, 2, 3, 4));
    assert.deepEqual(result, [2, 3, 4], 'works on an arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.rest);
    assert.deepEqual(_.flatten(result), [2, 3, 2, 3], 'works well with _.map');
  });

  test('tail', function(assert) {
    assert.strictEqual(_.tail, _.rest, 'is an alias for rest');
  });

  test('drop', function(assert) {
    assert.strictEqual(_.drop, _.rest, 'is an alias for rest');
  });

  test('initial', function(assert) {
    assert.deepEqual(_.initial([1, 2, 3, 4, 5]), [1, 2, 3, 4], 'returns all but the last element');
    assert.deepEqual(_.initial([1, 2, 3, 4], 2), [1, 2], 'returns all but the last n elements');
    assert.deepEqual(_.initial([1, 2, 3, 4], 6), [], 'returns an empty array when n > length');
    var result = (function(){ return _(arguments).initial(); }(1, 2, 3, 4));
    assert.deepEqual(result, [1, 2, 3], 'works on an arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.initial);
    assert.deepEqual(_.flatten(result), [1, 2, 1, 2], 'works well with _.map');
  });

  test('last', function(assert) {
    assert.equal(_.last([1, 2, 3]), 3, 'can pull out the last element of an array');
    assert.equal(_([1, 2, 3]).last(), 3, 'can perform OO-style "last()"');
    assert.deepEqual(_.last([1, 2, 3], 0), [], 'returns an empty array when n <= 0 (0 case)');
    assert.deepEqual(_.last([1, 2, 3], -1), [], 'returns an empty array when n <= 0 (negative case)');
    assert.deepEqual(_.last([1, 2, 3], 2), [2, 3], 'can fetch the last n elements');
    assert.deepEqual(_.last([1, 2, 3], 5), [1, 2, 3], 'returns the whole array if n > length');
    var result = (function(){ return _(arguments).last(); }(1, 2, 3, 4));
    assert.equal(result, 4, 'works on an arguments object');
    result = _.map([[1, 2, 3], [1, 2, 3]], _.last);
    assert.deepEqual(result, [3, 3], 'works well with _.map');
    assert.equal(_.last(null), void 0, 'returns undefined when called on null');
  });

  test('compact', function(assert) {
    assert.deepEqual(_.compact([1, false, null, 0, '', void 0, NaN, 2]), [1, 2], 'removes all falsy values');
    var result = (function(){ return _.compact(arguments); }(0, 1, false, 2, false, 3));
    assert.deepEqual(result, [1, 2, 3], 'works on an arguments object');
    result = _.map([[1, false, false], [false, false, 3]], _.compact);
    assert.deepEqual(result, [[1], [3]], 'works well with _.map');
  });

  test('flatten', function(assert) {
    assert.deepEqual(_.flatten(null), [], 'supports null');
    assert.deepEqual(_.flatten(void 0), [], 'supports undefined');

    assert.deepEqual(_.flatten([[], [[]], []]), [], 'supports empty arrays');
    assert.deepEqual(_.flatten([[], [[]], []], true), [[]], 'can shallowly flatten empty arrays');

    var list = [1, [2], [3, [[[4]]]]];
    assert.deepEqual(_.flatten(list), [1, 2, 3, 4], 'can flatten nested arrays');
    assert.deepEqual(_.flatten(list, true), [1, 2, 3, [[[4]]]], 'can shallowly flatten nested arrays');
    var result = (function(){ return _.flatten(arguments); }(1, [2], [3, [[[4]]]]));
    assert.deepEqual(result, [1, 2, 3, 4], 'works on an arguments object');
    list = [[1], [2], [3], [[4]]];
    assert.deepEqual(_.flatten(list, true), [1, 2, 3, [4]], 'can shallowly flatten arrays containing only other arrays');

    assert.equal(_.flatten([_.range(10), _.range(10), 5, 1, 3], true).length, 23, 'can flatten medium length arrays');
    assert.equal(_.flatten([_.range(10), _.range(10), 5, 1, 3]).length, 23, 'can shallowly flatten medium length arrays');
    assert.equal(_.flatten([new Array(1000000), _.range(56000), 5, 1, 3]).length, 1056003, 'can handle massive arrays');
    assert.equal(_.flatten([new Array(1000000), _.range(56000), 5, 1, 3], true).length, 1056003, 'can handle massive arrays in shallow mode');

    var x = _.range(100000);
    for (var i = 0; i < 1000; i++) x = [x];
    assert.deepEqual(_.flatten(x), _.range(100000), 'can handle very deep arrays');
    assert.deepEqual(_.flatten(x, true), x[0], 'can handle very deep arrays in shallow mode');
  });

  test('without', function(assert) {
    var list = [1, 2, 1, 0, 3, 1, 4];
    assert.deepEqual(_.without(list, 0, 1), [2, 3, 4], 'removes all instances of the given values');
    var result = (function(){ return _.without(arguments, 0, 1); }(1, 2, 1, 0, 3, 1, 4));
    assert.deepEqual(result, [2, 3, 4], 'works on an arguments object');

    list = [{one: 1}, {two: 2}];
    assert.deepEqual(_.without(list, {one: 1}), list, 'compares objects by reference (value case)');
    assert.deepEqual(_.without(list, list[0]), [{two: 2}], 'compares objects by reference (reference case)');
  });

  test('sortedIndex', function(assert) {
    var numbers = [10, 20, 30, 40, 50], num = 35;
    var indexForNum = _.sortedIndex(numbers, num);
    assert.equal(indexForNum, 3, '35 should be inserted at index 3');

    var indexFor30 = _.sortedIndex(numbers, 30);
    assert.equal(indexFor30, 2, '30 should be inserted at index 2');

    var objects = [{x: 10}, {x: 20}, {x: 30}, {x: 40}];
    var iterator = function(obj){ return obj.x; };
    assert.strictEqual(_.sortedIndex(objects, {x: 25}, iterator), 2);
    assert.strictEqual(_.sortedIndex(objects, {x: 35}, 'x'), 3);

    var context = {1: 2, 2: 3, 3: 4};
    iterator = function(obj){ return this[obj]; };
    assert.strictEqual(_.sortedIndex([1, 3], 2, iterator, context), 1);

    var values = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535, 131071, 262143, 524287, 1048575, 2097151, 4194303, 8388607, 16777215, 33554431, 67108863, 134217727, 268435455, 536870911, 1073741823, 2147483647];
    var array = Array(Math.pow(2, 32) - 1);
    var length = values.length;
    while (length--) {
      array[values[length]] = values[length];
    }
    assert.equal(_.sortedIndex(array, 2147483648), 2147483648, 'should work with large indexes');
  });

  test('uniq', function(assert) {
    var list = [1, 2, 1, 3, 1, 4];
    assert.deepEqual(_.uniq(list), [1, 2, 3, 4], 'can find the unique values of an unsorted array');

    list = [1, 1, 1, 2, 2, 3];
    assert.deepEqual(_.uniq(list, true), [1, 2, 3], 'can find the unique values of a sorted array faster');

    list = [{name: 'moe'}, {name: 'curly'}, {name: 'larry'}, {name: 'curly'}];
    var iterator = function(value) { return value.name; };
    assert.deepEqual(_.map(_.uniq(list, false, iterator), iterator), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator');

    assert.deepEqual(_.map(_.uniq(list, iterator), iterator), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator without specifying whether array is sorted');

    iterator = function(value) { return value + 1; };
    list = [1, 2, 2, 3, 4, 4];
    assert.deepEqual(_.uniq(list, true, iterator), [1, 2, 3, 4], 'iterator works with sorted array');

    var kittens = [
      {kitten: 'Celery', cuteness: 8},
      {kitten: 'Juniper', cuteness: 10},
      {kitten: 'Spottis', cuteness: 10}
    ];

    var expected = [
      {kitten: 'Celery', cuteness: 8},
      {kitten: 'Juniper', cuteness: 10}
    ];

    assert.deepEqual(_.uniq(kittens, true, 'cuteness'), expected, 'string iterator works with sorted array');


    var result = (function(){ return _.uniq(arguments); }(1, 2, 1, 3, 1, 4));
    assert.deepEqual(result, [1, 2, 3, 4], 'works on an arguments object');

    var a = {}, b = {}, c = {};
    assert.deepEqual(_.uniq([a, b, a, b, c]), [a, b, c], 'works on values that can be tested for equivalency but not ordered');

    assert.deepEqual(_.uniq(null), []);

    var context = {};
    list = [3];
    _.uniq(list, function(value, index, array) {
      assert.strictEqual(this, context);
      assert.strictEqual(value, 3);
      assert.strictEqual(index, 0);
      assert.strictEqual(array, list);
    }, context);

    assert.deepEqual(_.uniq([{a: 1, b: 1}, {a: 1, b: 2}, {a: 1, b: 3}, {a: 2, b: 1}], 'a'), [{a: 1, b: 1}, {a: 2, b: 1}], 'can use pluck like iterator');
    assert.deepEqual(_.uniq([{0: 1, b: 1}, {0: 1, b: 2}, {0: 1, b: 3}, {0: 2, b: 1}], 0), [{0: 1, b: 1}, {0: 2, b: 1}], 'can use falsey pluck like iterator');
  });

  test('unique', function(assert) {
    assert.strictEqual(_.unique, _.uniq, 'is an alias for uniq');
  });

  test('intersection', function(assert) {
    var stooges = ['moe', 'curly', 'larry'], leaders = ['moe', 'groucho'];
    assert.deepEqual(_.intersection(stooges, leaders), ['moe'], 'can take the set intersection of two arrays');
    assert.deepEqual(_(stooges).intersection(leaders), ['moe'], 'can perform an OO-style intersection');
    var result = (function(){ return _.intersection(arguments, leaders); }('moe', 'curly', 'larry'));
    assert.deepEqual(result, ['moe'], 'works on an arguments object');
    var theSixStooges = ['moe', 'moe', 'curly', 'curly', 'larry', 'larry'];
    assert.deepEqual(_.intersection(theSixStooges, leaders), ['moe'], 'returns a duplicate-free array');
    result = _.intersection([2, 4, 3, 1], [1, 2, 3]);
    assert.deepEqual(result, [2, 3, 1], 'preserves order of first array');
    result = _.intersection(null, [1, 2, 3]);
    assert.equal(Object.prototype.toString.call(result), '[object Array]', 'returns an empty array when passed null as first argument');
    assert.equal(result.length, 0, 'returns an empty array when passed null as first argument');
    result = _.intersection([1, 2, 3], null);
    assert.equal(Object.prototype.toString.call(result), '[object Array]', 'returns an empty array when passed null as argument beyond the first');
    assert.equal(result.length, 0, 'returns an empty array when passed null as argument beyond the first');
  });

  test('union', function(assert) {
    var result = _.union([1, 2, 3], [2, 30, 1], [1, 40]);
    assert.deepEqual(result, [1, 2, 3, 30, 40], 'takes the union of a list of arrays');

    result = _.union([1, 2, 3], [2, 30, 1], [1, 40, [1]]);
    assert.deepEqual(result, [1, 2, 3, 30, 40, [1]], 'takes the union of a list of nested arrays');

    var args = null;
    (function(){ args = arguments; }(1, 2, 3));
    result = _.union(args, [2, 30, 1], [1, 40]);
    assert.deepEqual(result, [1, 2, 3, 30, 40], 'takes the union of a list of arrays');

    result = _.union([1, 2, 3], 4);
    assert.deepEqual(result, [1, 2, 3], 'restrict the union to arrays only');
  });

  test('difference', function(assert) {
    var result = _.difference([1, 2, 3], [2, 30, 40]);
    assert.deepEqual(result, [1, 3], 'takes the difference of two arrays');

    result = _.difference([1, 2, 3, 4], [2, 30, 40], [1, 11, 111]);
    assert.deepEqual(result, [3, 4], 'takes the difference of three arrays');

    result = _.difference([1, 2, 3], 1);
    assert.deepEqual(result, [1, 2, 3], 'restrict the difference to arrays only');
  });

  test('zip', function(assert) {
    var names = ['moe', 'larry', 'curly'], ages = [30, 40, 50], leaders = [true];
    assert.deepEqual(_.zip(names, ages, leaders), [
      ['moe', 30, true],
      ['larry', 40, void 0],
      ['curly', 50, void 0]
    ], 'zipped together arrays of different lengths');

    var stooges = _.zip(['moe', 30, 'stooge 1'], ['larry', 40, 'stooge 2'], ['curly', 50, 'stooge 3']);
    assert.deepEqual(stooges, [['moe', 'larry', 'curly'], [30, 40, 50], ['stooge 1', 'stooge 2', 'stooge 3']], 'zipped pairs');

    // In the case of different length(s) in the tuple(s), undefine(s)
    // should be used as placeholder
    stooges = _.zip(['moe', 30], ['larry', 40], ['curly', 50, 'extra data']);
    assert.deepEqual(stooges, [['moe', 'larry', 'curly'], [30, 40, 50], [void 0, void 0, 'extra data']], 'zipped pairs with empties');

    var empty = _.zip([]);
    assert.deepEqual(empty, [], 'unzipped empty');

    assert.deepEqual(_.zip(null), [], 'handles null');
    assert.deepEqual(_.zip(), [], '_.zip() returns []');
  });

  test('unzip', function(assert) {
    assert.deepEqual(_.unzip(null), [], 'handles null');

    assert.deepEqual(_.unzip([['a', 'b'], [1, 2]]), [['a', 1], ['b', 2]]);

    // complements zip
    var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
    assert.deepEqual(_.unzip(zipped), [['fred', 'barney'], [30, 40], [true, false]]);

    zipped = _.zip(['moe', 30], ['larry', 40], ['curly', 50, 'extra data']);
    assert.deepEqual(_.unzip(zipped), [['moe', 30, void 0], ['larry', 40, void 0], ['curly', 50, 'extra data']], 'Uses length of largest array');
  });

  test('object', function(assert) {
    var result = _.object(['moe', 'larry', 'curly'], [30, 40, 50]);
    var shouldBe = {moe: 30, larry: 40, curly: 50};
    assert.deepEqual(result, shouldBe, 'two arrays zipped together into an object');

    result = _.object([['one', 1], ['two', 2], ['three', 3]]);
    shouldBe = {one: 1, two: 2, three: 3};
    assert.deepEqual(result, shouldBe, 'an array of pairs zipped together into an object');

    var stooges = {moe: 30, larry: 40, curly: 50};
    assert.deepEqual(_.object(_.pairs(stooges)), stooges, 'an object converted to pairs and back to an object');

    assert.deepEqual(_.object(null), {}, 'handles nulls');
  });

  test('indexOf', function(assert) {
    var numbers = [1, 2, 3];
    assert.equal(_.indexOf(numbers, 2), 1, 'can compute indexOf');
    var result = (function(){ return _.indexOf(arguments, 2); }(1, 2, 3));
    assert.equal(result, 1, 'works on an arguments object');

    _.each([null, void 0, [], false], function(val) {
      var msg = 'Handles: ' + (_.isArray(val) ? '[]' : val);
      assert.equal(_.indexOf(val, 2), -1, msg);
      assert.equal(_.indexOf(val, 2, -1), -1, msg);
      assert.equal(_.indexOf(val, 2, -20), -1, msg);
      assert.equal(_.indexOf(val, 2, 15), -1, msg);
    });

    var num = 35;
    numbers = [10, 20, 30, 40, 50];
    var index = _.indexOf(numbers, num, true);
    assert.equal(index, -1, '35 is not in the list');

    numbers = [10, 20, 30, 40, 50]; num = 40;
    index = _.indexOf(numbers, num, true);
    assert.equal(index, 3, '40 is in the list');

    numbers = [1, 40, 40, 40, 40, 40, 40, 40, 50, 60, 70]; num = 40;
    assert.equal(_.indexOf(numbers, num, true), 1, '40 is in the list');
    assert.equal(_.indexOf(numbers, 6, true), -1, '6 isnt in the list');
    assert.equal(_.indexOf([1, 2, 5, 4, 6, 7], 5, true), -1, 'sorted indexOf doesn\'t uses binary search');
    assert.ok(_.every(['1', [], {}, null], function() {
      return _.indexOf(numbers, num, {}) === 1;
    }), 'non-nums as fromIndex make indexOf assume sorted');

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    index = _.indexOf(numbers, 2, 5);
    assert.equal(index, 7, 'supports the fromIndex argument');

    index = _.indexOf([,,, 0], void 0);
    assert.equal(index, 0, 'treats sparse arrays as if they were dense');

    var array = [1, 2, 3, 1, 2, 3];
    assert.strictEqual(_.indexOf(array, 1, -3), 3, 'neg `fromIndex` starts at the right index');
    assert.strictEqual(_.indexOf(array, 1, -2), -1, 'neg `fromIndex` starts at the right index');
    assert.strictEqual(_.indexOf(array, 2, -3), 4);
    _.each([-6, -8, -Infinity], function(fromIndex) {
      assert.strictEqual(_.indexOf(array, 1, fromIndex), 0);
    });
    assert.strictEqual(_.indexOf([1, 2, 3], 1, true), 0);

    index = _.indexOf([], void 0, true);
    assert.equal(index, -1, 'empty array with truthy `isSorted` returns -1');
  });

  test('indexOf with NaN', function(assert) {
    assert.strictEqual(_.indexOf([1, 2, NaN, NaN], NaN), 2, 'Expected [1, 2, NaN] to contain NaN');
    assert.strictEqual(_.indexOf([1, 2, Infinity], NaN), -1, 'Expected [1, 2, NaN] to contain NaN');

    assert.strictEqual(_.indexOf([1, 2, NaN, NaN], NaN, 1), 2, 'startIndex does not affect result');
    assert.strictEqual(_.indexOf([1, 2, NaN, NaN], NaN, -2), 2, 'startIndex does not affect result');

    (function() {
      assert.strictEqual(_.indexOf(arguments, NaN), 2, 'Expected arguments [1, 2, NaN] to contain NaN');
    }(1, 2, NaN, NaN));
  });

  test('indexOf with +- 0', function(assert) {
    _.each([-0, +0], function(val) {
      assert.strictEqual(_.indexOf([1, 2, val, val], val), 2);
      assert.strictEqual(_.indexOf([1, 2, val, val], -val), 2);
    });
  });

  test('lastIndexOf', function(assert) {
    var numbers = [1, 0, 1];
    var falsey = [void 0, '', 0, false, NaN, null, void 0];
    assert.equal(_.lastIndexOf(numbers, 1), 2);

    numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
    numbers.lastIndexOf = null;
    assert.equal(_.lastIndexOf(numbers, 1), 5, 'can compute lastIndexOf, even without the native function');
    assert.equal(_.lastIndexOf(numbers, 0), 8, 'lastIndexOf the other element');
    var result = (function(){ return _.lastIndexOf(arguments, 1); }(1, 0, 1, 0, 0, 1, 0, 0, 0));
    assert.equal(result, 5, 'works on an arguments object');

    _.each([null, void 0, [], false], function(val) {
      var msg = 'Handles: ' + (_.isArray(val) ? '[]' : val);
      assert.equal(_.lastIndexOf(val, 2), -1, msg);
      assert.equal(_.lastIndexOf(val, 2, -1), -1, msg);
      assert.equal(_.lastIndexOf(val, 2, -20), -1, msg);
      assert.equal(_.lastIndexOf(val, 2, 15), -1, msg);
    });

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    var index = _.lastIndexOf(numbers, 2, 2);
    assert.equal(index, 1, 'supports the fromIndex argument');

    var array = [1, 2, 3, 1, 2, 3];

    assert.strictEqual(_.lastIndexOf(array, 1, 0), 0, 'starts at the correct from idx');
    assert.strictEqual(_.lastIndexOf(array, 3), 5, 'should return the index of the last matched value');
    assert.strictEqual(_.lastIndexOf(array, 4), -1, 'should return `-1` for an unmatched value');

    assert.strictEqual(_.lastIndexOf(array, 1, 2), 0, 'should work with a positive `fromIndex`');

    _.each([6, 8, Math.pow(2, 32), Infinity], function(fromIndex) {
      assert.strictEqual(_.lastIndexOf(array, void 0, fromIndex), -1);
      assert.strictEqual(_.lastIndexOf(array, 1, fromIndex), 3);
      assert.strictEqual(_.lastIndexOf(array, '', fromIndex), -1);
    });

    var expected = _.map(falsey, function(value) {
      return typeof value == 'number' ? -1 : 5;
    });

    var actual = _.map(falsey, function(fromIndex) {
      return _.lastIndexOf(array, 3, fromIndex);
    });

    assert.deepEqual(actual, expected, 'should treat falsey `fromIndex` values, except `0` and `NaN`, as `array.length`');
    assert.strictEqual(_.lastIndexOf(array, 3, '1'), 5, 'should treat non-number `fromIndex` values as `array.length`');
    assert.strictEqual(_.lastIndexOf(array, 3, true), 5, 'should treat non-number `fromIndex` values as `array.length`');

    assert.strictEqual(_.lastIndexOf(array, 2, -3), 1, 'should work with a negative `fromIndex`');
    assert.strictEqual(_.lastIndexOf(array, 1, -3), 3, 'neg `fromIndex` starts at the right index');

    assert.deepEqual(_.map([-6, -8, -Infinity], function(fromIndex) {
      return _.lastIndexOf(array, 1, fromIndex);
    }), [0, -1, -1]);
  });

  test('lastIndexOf with NaN', function(assert) {
    assert.strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN), 3, 'Expected [1, 2, NaN] to contain NaN');
    assert.strictEqual(_.lastIndexOf([1, 2, Infinity], NaN), -1, 'Expected [1, 2, NaN] to contain NaN');

    assert.strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN, 2), 2, 'fromIndex does not affect result');
    assert.strictEqual(_.lastIndexOf([1, 2, NaN, NaN], NaN, -2), 2, 'fromIndex does not affect result');

    (function() {
      assert.strictEqual(_.lastIndexOf(arguments, NaN), 3, 'Expected arguments [1, 2, NaN] to contain NaN');
    }(1, 2, NaN, NaN));
  });

  test('lastIndexOf with +- 0', function(assert) {
    _.each([-0, +0], function(val) {
      assert.strictEqual(_.lastIndexOf([1, 2, val, val], val), 3);
      assert.strictEqual(_.lastIndexOf([1, 2, val, val], -val), 3);
      assert.strictEqual(_.lastIndexOf([-1, 1, 2], -val), -1);
    });
  });

  test('findIndex', function(assert) {
    var objects = [
      {a: 0, b: 0},
      {a: 1, b: 1},
      {a: 2, b: 2},
      {a: 0, b: 0}
    ];

    assert.equal(_.findIndex(objects, function(obj) {
      return obj.a === 0;
    }), 0);

    assert.equal(_.findIndex(objects, function(obj) {
      return obj.b * obj.a === 4;
    }), 2);

    assert.equal(_.findIndex(objects, 'a'), 1, 'Uses lookupIterator');

    assert.equal(_.findIndex(objects, function(obj) {
      return obj.b * obj.a === 5;
    }), -1);

    assert.equal(_.findIndex(null, _.noop), -1);
    assert.strictEqual(_.findIndex(objects, function(a) {
      return a.foo === null;
    }), -1);
    _.findIndex([{a: 1}], function(a, key, obj) {
      assert.equal(key, 0);
      assert.deepEqual(obj, [{a: 1}]);
      assert.strictEqual(this, objects, 'called with context');
    }, objects);

    var sparse = [];
    sparse[20] = {a: 2, b: 2};
    assert.equal(_.findIndex(sparse, function(obj) {
      return obj && obj.b * obj.a === 4;
    }), 20, 'Works with sparse arrays');

    var array = [1, 2, 3, 4];
    array.match = 55;
    assert.strictEqual(_.findIndex(array, function(x) { return x === 55; }), -1, 'doesn\'t match array-likes keys');
  });

  test('findLastIndex', function(assert) {
    var objects = [
      {a: 0, b: 0},
      {a: 1, b: 1},
      {a: 2, b: 2},
      {a: 0, b: 0}
    ];

    assert.equal(_.findLastIndex(objects, function(obj) {
      return obj.a === 0;
    }), 3);

    assert.equal(_.findLastIndex(objects, function(obj) {
      return obj.b * obj.a === 4;
    }), 2);

    assert.equal(_.findLastIndex(objects, 'a'), 2, 'Uses lookupIterator');

    assert.equal(_.findLastIndex(objects, function(obj) {
      return obj.b * obj.a === 5;
    }), -1);

    assert.equal(_.findLastIndex(null, _.noop), -1);
    assert.strictEqual(_.findLastIndex(objects, function(a) {
      return a.foo === null;
    }), -1);
    _.findLastIndex([{a: 1}], function(a, key, obj) {
      assert.equal(key, 0);
      assert.deepEqual(obj, [{a: 1}]);
      assert.strictEqual(this, objects, 'called with context');
    }, objects);

    var sparse = [];
    sparse[20] = {a: 2, b: 2};
    assert.equal(_.findLastIndex(sparse, function(obj) {
      return obj && obj.b * obj.a === 4;
    }), 20, 'Works with sparse arrays');

    var array = [1, 2, 3, 4];
    array.match = 55;
    assert.strictEqual(_.findLastIndex(array, function(x) { return x === 55; }), -1, 'doesn\'t match array-likes keys');
  });

  test('range', function(assert) {
    assert.deepEqual(_.range(0), [], 'range with 0 as a first argument generates an empty array');
    assert.deepEqual(_.range(4), [0, 1, 2, 3], 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
    assert.deepEqual(_.range(5, 8), [5, 6, 7], 'range with two arguments a &amp; b, a&lt;b generates an array of elements a,a+1,a+2,...,b-2,b-1');
    assert.deepEqual(_.range(3, 10, 3), [3, 6, 9], 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
    assert.deepEqual(_.range(3, 10, 15), [3], 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
    assert.deepEqual(_.range(12, 7, -2), [12, 10, 8], 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
    assert.deepEqual(_.range(0, -10, -1), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9], 'final example in the Python docs');
    assert.strictEqual(1 / _.range(-0, 1)[0], -Infinity, 'should preserve -0');
    assert.deepEqual(_.range(8, 5), [8, 7, 6], 'negative range generates descending array');
    assert.deepEqual(_.range(-3), [0, -1, -2], 'negative range generates descending array');
  });

  test('chunk', function(assert) {
    assert.deepEqual(_.chunk([], 2), [], 'chunk for empty array returns an empty array');

    assert.deepEqual(_.chunk([1, 2, 3], 0), [], 'chunk into parts of 0 elements returns empty array');
    assert.deepEqual(_.chunk([1, 2, 3], -1), [], 'chunk into parts of negative amount of elements returns an empty array');
    assert.deepEqual(_.chunk([1, 2, 3]), [], 'defaults to empty array (chunk size 0)');

    assert.deepEqual(_.chunk([1, 2, 3], 1), [[1], [2], [3]], 'chunk into parts of 1 elements returns original array');

    assert.deepEqual(_.chunk([1, 2, 3], 3), [[1, 2, 3]], 'chunk into parts of current array length elements returns the original array');
    assert.deepEqual(_.chunk([1, 2, 3], 5), [[1, 2, 3]], 'chunk into parts of more then current array length elements returns the original array');

    assert.deepEqual(_.chunk([10, 20, 30, 40, 50, 60, 70], 2), [[10, 20], [30, 40], [50, 60], [70]], 'chunk into parts of less then current array length elements');
    assert.deepEqual(_.chunk([10, 20, 30, 40, 50, 60, 70], 3), [[10, 20, 30], [40, 50, 60], [70]], 'chunk into parts of less then current array length elements');
  });
}());
