if (typeof require !== 'undefined') {
  var _ = require('../underscore');
}

(function (exports) {
//$(document).ready(function() {

  //module("Function functions (bind, bindAll, and so on...)");

exports["functions: bind"] = function(test) {
  var context = {name : 'moe'};
  var func = function(arg) { return "name: " + (this.name || arg); };
  var bound = _.bind(func, context);
  test.equals(bound(), 'name: moe', 'can bind a function to a context');

  bound = _(func).bind(context);
  test.equals(bound(), 'name: moe', 'can do OO-style binding');

  bound = _.bind(func, null, 'curly');
  test.equals(bound(), 'name: curly', 'can bind without specifying a context');

  func = function(salutation, name) { return salutation + ': ' + name; };
  func = _.bind(func, this, 'hello');
  test.equals(func('moe'), 'hello: moe', 'the function was partially applied in advance');

  var func = _.bind(func, this, 'curly');
  test.equals(func(), 'hello: curly', 'the function was completely applied in advance');
  test.done();
};

exports["functions: bindAll"] = function(test) {
  var curly = {name : 'curly'}, moe = {
    name    : 'moe',
    getName : function() { return 'name: ' + this.name; },
    sayHi   : function() { return 'hi: ' + this.name; }
  };
  curly.getName = moe.getName;
  _.bindAll(moe, 'getName', 'sayHi');
  curly.sayHi = moe.sayHi;
  test.equals(curly.getName(), 'name: curly', 'unbound function is bound to current object');
  test.equals(curly.sayHi(), 'hi: moe', 'bound function is still bound to original object');

  curly = {name : 'curly'};
  moe = {
    name    : 'moe',
    getName : function() { return 'name: ' + this.name; },
    sayHi   : function() { return 'hi: ' + this.name; }
  };
  _.bindAll(moe);
  curly.sayHi = moe.sayHi;
  test.equals(curly.sayHi(), 'hi: moe', 'calling bindAll with no arguments binds all functions to the object');
  test.done();
};

exports["functions: memoize"] = function(test) {
  var fib = function(n) {
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
  };
  var fastFib = _.memoize(fib);
  test.equals(fib(10), 55, 'a memoized version of fibonacci produces identical results');
  test.equals(fastFib(10), 55, 'a memoized version of fibonacci produces identical results');
  test.done();
};

exports["functions: delay"] = function(test) {
  test.expect(2);
  var delayed = false;
  _.delay(function(){ delayed = true; }, 100);
  _.delay(function(){ test.ok(!delayed, "didn't delay the function quite yet"); }, 50);
  _.delay(function(){ test.ok(delayed, 'delayed the function'); test.done(); }, 150);
};

exports["functions: defer"] = function(test) {
  test.expect(1);
  var deferred = false;
  _.defer(function(bool){ deferred = bool; }, true);
  _.delay(function(){ test.ok(deferred, "deferred the function"); test.done(); }, 50);
};

exports["functions: throttle"] = function(test) {
  test.expect(1);
  var counter = 0;
  var incr = function(){ counter++; };
  var throttledIncr = _.throttle(incr, 50);
  throttledIncr(); throttledIncr(); throttledIncr();
  setTimeout(throttledIncr, 60);
  setTimeout(throttledIncr, 70);
  setTimeout(throttledIncr, 110);
  setTimeout(throttledIncr, 120);
  _.delay(function(){ test.ok(counter == 3, "incr was throttled"); test.done(); }, 180);
};

exports["functions: debounce"] = function(test) {
  test.expect(1);
  var counter = 0;
  var incr = function(){ counter++; };
  var debouncedIncr = _.debounce(incr, 50);
  debouncedIncr(); debouncedIncr(); debouncedIncr();
  setTimeout(debouncedIncr, 30);
  setTimeout(debouncedIncr, 60);
  setTimeout(debouncedIncr, 90);
  setTimeout(debouncedIncr, 120);
  setTimeout(debouncedIncr, 150);
  _.delay(function(){ test.ok(counter == 1, "incr was debounced"); test.done(); }, 220);
};

exports["functions: wrap"] = function(test) {
  var greet = function(name){ return "hi: " + name; };
  var backwards = _.wrap(greet, function(func, name){ return func(name) + ' ' + name.split('').reverse().join(''); });
  test.equals(backwards('moe'), 'hi: moe eom', 'wrapped the saluation function');
  test.done();
};

exports["functions: compose"] = function(test) {
  var greet = function(name){ return "hi: " + name; };
  var exclaim = function(sentence){ return sentence + '!'; };
  var composed = _.compose(exclaim, greet);
  test.equals(composed('moe'), 'hi: moe!', 'can compose a function that takes another');

  composed = _.compose(greet, exclaim);
  test.equals(composed('moe'), 'hi: moe!', 'in this case, the functions are also commutative');
  test.done();
};

//});
})(typeof exports === 'undefined' ? this['functions'] = {}: exports);
