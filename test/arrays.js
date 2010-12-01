if (typeof require !== 'undefined') {
  var _ = require('../underscore');
}

(function (exports) {
//$(document).ready(function() {

  //module("Array-only functions (last, compact, uniq, and so on...)");

exports["arrays: first"] = function(test) {
  test.equals(_.first([1,2,3]), 1, 'can pull out the first element of an array');
  test.equals(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');
  test.equals(_.first([1,2,3], 2).join(', '), '1, 2', 'can pass an index to first');
  var result = (function(){ return _.first(arguments); })(4, 3, 2, 1);
  test.equals(result, 4, 'works on an arguments object.');
  result = _.map([[1,2,3],[1,2,3]], _.first);
  test.equals(result.join(','), '1,1', 'works well with _.map');
  test.done();
};

exports["arrays: rest"] = function(test) {
  var numbers = [1, 2, 3, 4];
  test.equals(_.rest(numbers).join(", "), "2, 3, 4", 'working rest()');
  test.equals(_.rest(numbers, 2).join(', '), '3, 4', 'rest can take an index');
  var result = (function(){ return _(arguments).tail(); })(1, 2, 3, 4);
  test.equals(result.join(', '), '2, 3, 4', 'aliased as tail and works on arguments object');
  result = _.map([[1,2,3],[1,2,3]], _.rest);
  test.equals(_.flatten(result).join(','), '2,3,2,3', 'works well with _.map');
  test.done();
};

exports["arrays: last"] = function(test) {
  test.equals(_.last([1,2,3]), 3, 'can pull out the last element of an array');
  var result = (function(){ return _(arguments).last(); })(1, 2, 3, 4);
  test.equals(result, 4, 'works on an arguments object');
  test.done();
};

exports["arrays: compact"] = function(test) {
  test.equals(_.compact([0, 1, false, 2, false, 3]).length, 3, 'can trim out all falsy values');
  var result = (function(){ return _(arguments).compact().length; })(0, 1, false, 2, false, 3);
  test.equals(result, 3, 'works on an arguments object');
  test.done();
};

exports["arrays: flatten"] = function(test) {
  var list = [1, [2], [3, [[[4]]]]];
  test.equals(_.flatten(list).join(', '), '1, 2, 3, 4', 'can flatten nested arrays');
  var result = (function(){ return _.flatten(arguments); })(1, [2], [3, [[[4]]]]);
  test.equals(result.join(', '), '1, 2, 3, 4', 'works on an arguments object');
  test.done();
};

exports["arrays: without"] = function(test) {
  var list = [1, 2, 1, 0, 3, 1, 4];
  test.equals(_.without(list, 0, 1).join(', '), '2, 3, 4', 'can remove all instances of an object');
  var result = (function(){ return _.without(arguments, 0, 1); })(1, 2, 1, 0, 3, 1, 4);
  test.equals(result.join(', '), '2, 3, 4', 'works on an arguments object');

  var list = [{one : 1}, {two : 2}];
  test.ok(_.without(list, {one : 1}).length == 2, 'uses real object identity for comparisons.');
  test.ok(_.without(list, list[0]).length == 1, 'ditto.');
  test.done();
};

exports["arrays: uniq"] = function(test) {
  var list = [1, 2, 1, 3, 1, 4];
  test.equals(_.uniq(list).join(', '), '1, 2, 3, 4', 'can find the unique values of an unsorted array');

  var list = [1, 1, 1, 2, 2, 3];
  test.equals(_.uniq(list, true).join(', '), '1, 2, 3', 'can find the unique values of a sorted array faster');

  var result = (function(){ return _.uniq(arguments); })(1, 2, 1, 3, 1, 4);
  test.equals(result.join(', '), '1, 2, 3, 4', 'works on an arguments object');
  test.done();
};

exports["arrays: intersect"] = function(test) {
  var stooges = ['moe', 'curly', 'larry'], leaders = ['moe', 'groucho'];
  test.equals(_.intersect(stooges, leaders).join(''), 'moe', 'can take the set intersection of two arrays');
  test.equals(_(stooges).intersect(leaders).join(''), 'moe', 'can perform an OO-style intersection');
  var result = (function(){ return _.intersect(arguments, leaders); })('moe', 'curly', 'larry');
  test.equals(result.join(''), 'moe', 'works on an arguments object');
  test.done();
};

exports['arrays: zip'] = function(test) {
  var names = ['moe', 'larry', 'curly'], ages = [30, 40, 50], leaders = [true];
  var stooges = _.zip(names, ages, leaders);
  test.equals(String(stooges), 'moe,30,true,larry,40,,curly,50,', 'zipped together arrays of different lengths');
  test.done();
};

exports["arrays: indexOf"] = function(test) {
  var numbers = [1, 2, 3];
  numbers.indexOf = null;
  test.equals(_.indexOf(numbers, 2), 1, 'can compute indexOf, even without the native function');
  var result = (function(){ return _.indexOf(arguments, 2); })(1, 2, 3);
  test.equals(result, 1, 'works on an arguments object');
  test.done();
};

exports["arrays: lastIndexOf"] = function(test) {
  var numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
  numbers.lastIndexOf = null;
  test.equals(_.lastIndexOf(numbers, 1), 5, 'can compute lastIndexOf, even without the native function');
  test.equals(_.lastIndexOf(numbers, 0), 8, 'lastIndexOf the other element');
  var result = (function(){ return _.lastIndexOf(arguments, 1); })(1, 0, 1, 0, 0, 1, 0, 0, 0);
  test.equals(result, 5, 'works on an arguments object');
  test.done();
};

exports["arrays: range"] = function(test) {
  test.equals(_.range(0).join(''), '', 'range with 0 as a first argument generates an empty array');
  test.equals(_.range(4).join(' '), '0 1 2 3', 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
  test.equals(_.range(5, 8).join(' '), '5 6 7', 'range with two arguments a &amp; b, a&lt;b generates an array of elements a,a+1,a+2,...,b-2,b-1');
  test.equals(_.range(8, 5).join(''), '', 'range with two arguments a &amp; b, b&lt;a generates an empty array');
  test.equals(_.range(3, 10, 3).join(' '), '3 6 9', 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
  test.equals(_.range(3, 10, 15).join(''), '3', 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
  test.equals(_.range(12, 7, -2).join(' '), '12 10 8', 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
  test.equals(_.range(0, -10, -1).join(' '), '0 -1 -2 -3 -4 -5 -6 -7 -8 -9', 'final example in the Python docs');
  test.done();
};

//});
})(typeof exports === 'undefined' ? this['arrays'] = {}: exports);
