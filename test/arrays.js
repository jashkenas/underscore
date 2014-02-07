var test = require('tape');
var _ = require('../underscore');

(function() {

  test('first', function(t) {
    t.is(_.first([1,2,3]), 1, 'can pull out the first element of an array');
    t.is(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');
    t.is(_.first([1,2,3], 0).join(', '), '', 'can pass an index to first');
    t.is(_.first([1,2,3], 2).join(', '), '1, 2', 'can pass an index to first');
    t.is(_.first([1,2,3], 5).join(', '), '1, 2, 3', 'can pass an index to first');
    var result = (function(){ return _.first(arguments); })(4, 3, 2, 1);
    t.is(result, 4, 'works on an arguments object.');
    result = _.map([[1,2,3],[1,2,3]], _.first);
    t.is(result.join(','), '1,1', 'works well with _.map');
    result = (function() { return _.take([1,2,3], 2); })();
    t.is(result.join(','), '1,2', 'aliased as take');

    t.is(_.first(null), undefined, 'handles nulls');
    t.is(_.first([1, 2, 3], -1).length, 0);
    t.end();
  });

  test('rest', function(t) {
    var numbers = [1, 2, 3, 4];
    t.is(_.rest(numbers).join(', '), '2, 3, 4', 'working rest()');
    t.is(_.rest(numbers, 0).join(', '), '1, 2, 3, 4', 'working rest(0)');
    t.is(_.rest(numbers, 2).join(', '), '3, 4', 'rest can take an index');
    var result = (function(){ return _(arguments).tail(); })(1, 2, 3, 4);
    t.is(result.join(', '), '2, 3, 4', 'aliased as tail and works on arguments object');
    result = _.map([[1,2,3],[1,2,3]], _.rest);
    t.is(_.flatten(result).join(','), '2,3,2,3', 'works well with _.map');
    result = (function(){ return _(arguments).drop(); })(1, 2, 3, 4);
    t.is(result.join(', '), '2, 3, 4', 'aliased as drop and works on arguments object');
    t.end();
  });

  test('initial', function(t) {
    t.is(_.initial([1,2,3,4,5]).join(', '), '1, 2, 3, 4', 'working initial()');
    t.is(_.initial([1,2,3,4],2).join(', '), '1, 2', 'initial can take an index');
    var result = (function(){ return _(arguments).initial(); })(1, 2, 3, 4);
    t.is(result.join(', '), '1, 2, 3', 'initial works on arguments object');
    result = _.map([[1,2,3],[1,2,3]], _.initial);
    t.is(_.flatten(result).join(','), '1,2,1,2', 'initial works with _.map');
    t.end();
  });

  test('last', function(t) {
    t.is(_.last([1,2,3]), 3, 'can pull out the last element of an array');
    t.is(_.last([1,2,3], 0).join(', '), '', 'can pass an index to last');
    t.is(_.last([1,2,3], 2).join(', '), '2, 3', 'can pass an index to last');
    t.is(_.last([1,2,3], 5).join(', '), '1, 2, 3', 'can pass an index to last');
    var result = (function(){ return _(arguments).last(); })(1, 2, 3, 4);
    t.is(result, 4, 'works on an arguments object');
    result = _.map([[1,2,3],[1,2,3]], _.last);
    t.is(result.join(','), '3,3', 'works well with _.map');

    t.is(_.last(null), undefined, 'handles nulls');
    t.is(_.last([1, 2, 3], -1).length, 0);
    t.end();
  });

  test('compact', function(t) {
    t.is(_.compact([0, 1, false, 2, false, 3]).length, 3, 'can trim out all falsy values');
    var result = (function(){ return _.compact(arguments).length; })(0, 1, false, 2, false, 3);
    t.is(result, 3, 'works on an arguments object');
    t.end();
  });

  test('flatten', function(t) {
    var list = [1, [2], [3, [[[4]]]]];
    t.same(_.flatten(list), [1,2,3,4], 'can flatten nested arrays');
    t.same(_.flatten(list, true), [1,2,3,[[[4]]]], 'can shallowly flatten nested arrays');
    var result = (function(){ return _.flatten(arguments); })(1, [2], [3, [[[4]]]]);
    t.same(result, [1,2,3,4], 'works on an arguments object');
    list = [[1], [2], [3], [[4]]];
    t.same(_.flatten(list, true), [1, 2, 3, [4]], 'can shallowly flatten arrays containing only other arrays');
    t.end();
  });

  test('without', function(t) {
    var list = [1, 2, 1, 0, 3, 1, 4];
    t.is(_.without(list, 0, 1).join(', '), '2, 3, 4', 'can remove all instances of an object');
    var result = (function(){ return _.without(arguments, 0, 1); })(1, 2, 1, 0, 3, 1, 4);
    t.is(result.join(', '), '2, 3, 4', 'works on an arguments object');

    list = [{one : 1}, {two : 2}];
    t.ok(_.without(list, {one : 1}).length == 2, 'uses real object identity for comparisons.');
    t.ok(_.without(list, list[0]).length == 1, 'ditto.');
    t.end();
  });

  test('partition', function(t) {
    var list = [0, 1, 2, 3, 4, 5];
    function inspect(x) { return x instanceof Array ? '[' + _.map(x, inspect) + ']' : '' + x; }
    t.is(inspect(_.partition(list, function(x) { return x < 4; })), '[[0,1,2,3],[4,5]]', 'handles bool return values');
    t.is(inspect(_.partition(list, function(x) { return x & 1; })), '[[1,3,5],[0,2,4]]', 'handles 0 and 1 return values');
    t.is(inspect(_.partition(list, function(x) { return x - 3; })), '[[0,1,2,4,5],[3]]', 'handles other numeric return values');
    t.is(inspect(_.partition(list, function(x) { return x > 1 ? null : true; })), '[[0,1],[2,3,4,5]]', 'handles null return values');
    t.is(inspect(_.partition(list, function(x) { if(x < 2) return true; })), '[[0,1],[2,3,4,5]]', 'handles undefined return values');
    t.end();
  });

  test('uniq', function(t) {
    var list = [1, 2, 1, 3, 1, 4];
    t.is(_.uniq(list).join(', '), '1, 2, 3, 4', 'can find the unique values of an unsorted array');

    list = [1, 1, 1, 2, 2, 3];
    t.is(_.uniq(list, true).join(', '), '1, 2, 3', 'can find the unique values of a sorted array faster');

    list = [{name:'moe'}, {name:'curly'}, {name:'larry'}, {name:'curly'}];
    var iterator = function(value) { return value.name; };
    t.is(_.map(_.uniq(list, false, iterator), iterator).join(', '), 'moe, curly, larry', 'can find the unique values of an array using a custom iterator');

    t.is(_.map(_.uniq(list, iterator), iterator).join(', '), 'moe, curly, larry', 'can find the unique values of an array using a custom iterator without specifying whether array is sorted');

    iterator = function(value) { return value +1; };
    list = [1, 2, 2, 3, 4, 4];
    t.is(_.uniq(list, true, iterator).join(', '), '1, 2, 3, 4', 'iterator works with sorted array');

    var result = (function(){ return _.uniq(arguments); })(1, 2, 1, 3, 1, 4);
    t.is(result.join(', '), '1, 2, 3, 4', 'works on an arguments object');
    t.end();
  });

  test('intersection', function(t) {
    var stooges = ['moe', 'curly', 'larry'], leaders = ['moe', 'groucho'];
    t.is(_.intersection(stooges, leaders).join(''), 'moe', 'can take the set intersection of two arrays');
    t.is(_(stooges).intersection(leaders).join(''), 'moe', 'can perform an OO-style intersection');
    var result = (function(){ return _.intersection(arguments, leaders); })('moe', 'curly', 'larry');
    t.is(result.join(''), 'moe', 'works on an arguments object');
    var theSixStooges = ['moe', 'moe', 'curly', 'curly', 'larry', 'larry'];
    t.is(_.intersection(theSixStooges, leaders).join(''), 'moe', 'returns a duplicate-free array');
    t.end();
  });

  test('union', function(t) {
    var result = _.union([1, 2, 3], [2, 30, 1], [1, 40]);
    t.is(result.join(' '), '1 2 3 30 40', 'takes the union of a list of arrays');

    result = _.union([1, 2, 3], [2, 30, 1], [1, 40, [1]]);
    t.is(result.join(' '), '1 2 3 30 40 1', 'takes the union of a list of nested arrays');

    var args = null;
    (function(){ args = arguments; })(1, 2, 3);
    result = _.union(args, [2, 30, 1], [1, 40]);
    t.is(result.join(' '), '1 2 3 30 40', 'takes the union of a list of arrays');

    result = _.union(null, [1, 2, 3]);
    t.same(result, [null, 1, 2, 3]);
    t.end();
  });

  test('difference', function(t) {
    var result = _.difference([1, 2, 3], [2, 30, 40]);
    t.is(result.join(' '), '1 3', 'takes the difference of two arrays');

    result = _.difference([1, 2, 3, 4], [2, 30, 40], [1, 11, 111]);
    t.is(result.join(' '), '3 4', 'takes the difference of three arrays');
    t.end();
  });

  test('zip', function(t) {
    var names = ['moe', 'larry', 'curly'], ages = [30, 40, 50], leaders = [true];
    var stooges = _.zip(names, ages, leaders);
    t.is(String(stooges), 'moe,30,true,larry,40,,curly,50,', 'zipped together arrays of different lengths');

    stooges = _.zip(['moe',30, 'stooge 1'],['larry',40, 'stooge 2'],['curly',50, 'stooge 3']);
    t.same(stooges, [['moe','larry','curly'],[30,40,50], ['stooge 1', 'stooge 2', 'stooge 3']], 'zipped pairs');

    // In the case of difference lengths of the tuples undefineds
    // should be used as placeholder
    stooges = _.zip(['moe',30],['larry',40],['curly',50, 'extra data']);
    t.same(stooges, [['moe','larry','curly'],[30,40,50], [undefined, undefined, 'extra data']], 'zipped pairs with empties');

    var empty = _.zip([]);
    t.same(empty, [], 'unzipped empty');
    t.end();
  });

  test('object', function(t) {
    var result = _.object(['moe', 'larry', 'curly'], [30, 40, 50]);
    var shouldBe = {moe: 30, larry: 40, curly: 50};
    t.ok(_.isEqual(result, shouldBe), 'two arrays zipped together into an object');

    result = _.object([['one', 1], ['two', 2], ['three', 3]]);
    shouldBe = {one: 1, two: 2, three: 3};
    t.ok(_.isEqual(result, shouldBe), 'an array of pairs zipped together into an object');

    var stooges = {moe: 30, larry: 40, curly: 50};
    t.ok(_.isEqual(_.object(_.pairs(stooges)), stooges), 'an object converted to pairs and back to an object');

    t.ok(_.isEqual(_.object(null), {}), 'handles nulls');
    t.end();
  });

  test('indexOf', function(t) {
    var numbers = [1, 2, 3];
    numbers.indexOf = null;
    t.is(_.indexOf(numbers, 2), 1, 'can compute indexOf, even without the native function');
    var result = (function(){ return _.indexOf(arguments, 2); })(1, 2, 3);
    t.is(result, 1, 'works on an arguments object');
    t.is(_.indexOf(null, 2), -1, 'handles nulls properly');

    var num = 35;
    numbers = [10, 20, 30, 40, 50];
    var index = _.indexOf(numbers, num, true);
    t.is(index, -1, '35 is not in the list');

    numbers = [10, 20, 30, 40, 50]; num = 40;
    index = _.indexOf(numbers, num, true);
    t.is(index, 3, '40 is in the list');

    numbers = [1, 40, 40, 40, 40, 40, 40, 40, 50, 60, 70]; num = 40;
    index = _.indexOf(numbers, num, true);
    t.is(index, 1, '40 is in the list');

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    index = _.indexOf(numbers, 2, 5);
    t.is(index, 7, 'supports the fromIndex argument');
    t.end();
  });

  test('lastIndexOf', function(t) {
    var numbers = [1, 0, 1];
    t.is(_.lastIndexOf(numbers, 1), 2);

    numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
    numbers.lastIndexOf = null;
    t.is(_.lastIndexOf(numbers, 1), 5, 'can compute lastIndexOf, even without the native function');
    t.is(_.lastIndexOf(numbers, 0), 8, 'lastIndexOf the other element');
    var result = (function(){ return _.lastIndexOf(arguments, 1); })(1, 0, 1, 0, 0, 1, 0, 0, 0);
    t.is(result, 5, 'works on an arguments object');
    t.is(_.lastIndexOf(null, 2), -1, 'handles nulls properly');

    numbers = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    var index = _.lastIndexOf(numbers, 2, 2);
    t.is(index, 1, 'supports the fromIndex argument');
    t.end();
  });

  test('range', function(t) {
    t.is(_.range(0).join(''), '', 'range with 0 as a first argument generates an empty array');
    t.is(_.range(4).join(' '), '0 1 2 3', 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
    t.is(_.range(5, 8).join(' '), '5 6 7', 'range with two arguments a &amp; b, a&lt;b generates an array of elements a,a+1,a+2,...,b-2,b-1');
    t.is(_.range(8, 5).join(''), '', 'range with two arguments a &amp; b, b&lt;a generates an empty array');
    t.is(_.range(3, 10, 3).join(' '), '3 6 9', 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
    t.is(_.range(3, 10, 15).join(''), '3', 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
    t.is(_.range(12, 7, -2).join(' '), '12 10 8', 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
    t.is(_.range(0, -10, -1).join(' '), '0 -1 -2 -3 -4 -5 -6 -7 -8 -9', 'final example in the Python docs');
    t.end();
  });

})();
