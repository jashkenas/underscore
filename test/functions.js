var test = require('tape');
var _ = require('../underscore');

(function() {

  test('bind', function(t) {
    var context = {name : 'moe'};
    var func = function(arg) { return 'name: ' + (this.name || arg); };
    var bound = _.bind(func, context);
    t.is(bound(), 'name: moe', 'can bind a function to a context');

    bound = _(func).bind(context);
    t.is(bound(), 'name: moe', 'can do OO-style binding');

    bound = _.bind(func, null, 'curly');
    t.is(bound(), 'name: curly', 'can bind without specifying a context');

    func = function(salutation, name) { return salutation + ': ' + name; };
    func = _.bind(func, this, 'hello');
    t.is(func('moe'), 'hello: moe', 'the function was partially applied in advance');

    func = _.bind(func, this, 'curly');
    t.is(func(), 'hello: curly', 'the function was completely applied in advance');

    func = function(salutation, firstname, lastname) { return salutation + ': ' + firstname + ' ' + lastname; };
    func = _.bind(func, this, 'hello', 'moe', 'curly');
    t.is(func(), 'hello: moe curly', 'the function was partially applied in advance and can accept multiple arguments');

    func = function(){ return this; };
    t.ok(_.bind(func, 0)() == 0, 'can bind a function to `0`');
    t.ok(_.bind(func, '')() == '', 'can bind a function to an empty string');
    t.ok(_.bind(func, false)() == false, 'can bind a function to `false`');

    // These tests are only meaningful when using a browser without a native bind function
    // To test this with a modern browser, set underscore's nativeBind to undefined
    var F = function () { return this; };
    var Boundf = _.bind(F, {hello: 'moe curly'});
    var newBoundf = new Boundf();
    t.is(newBoundf.hello, undefined, 'function should not be bound to the context, to comply with ECMAScript 5');
    t.is(Boundf().hello, 'moe curly', "When called without the new operator, it's OK to be bound to the context");
    t.ok(newBoundf instanceof F, 'a bound instance is an instance of the original function');
    t.end();
  });

  test('partial', function(t) {
    var obj = {name: 'moe'};
    var func = function() { return this.name + ' ' + _.toArray(arguments).join(' '); };

    obj.func = _.partial(func, 'a', 'b');
    t.is(obj.func('c', 'd'), 'moe a b c d', 'can partially apply');

    obj.func = _.partial(func, _, 'b', _, 'd');
    t.is(obj.func('a', 'c'), 'moe a b c d', 'can partially apply with placeholders');

    func = _.partial(function() { return arguments.length; }, _, 'b', _, 'd');
    t.is(func('a', 'c', 'e'), 5, 'accepts more arguments than the number of placeholders');
    t.is(func('a'), 4, 'accepts fewer arguments than the number of placeholders');

    func = _.partial(function() { return typeof arguments[2]; }, _, 'b', _, 'd');
    t.is(func('a'), 'undefined', 'unfilled placeholders are undefined');
    t.end();
  });

  test('bindAll', function(t) {
    var curly = {name : 'curly'}, moe = {
      name    : 'moe',
      getName : function() { return 'name: ' + this.name; },
      sayHi   : function() { return 'hi: ' + this.name; }
    };
    curly.getName = moe.getName;
    _.bindAll(moe, 'getName', 'sayHi');
    curly.sayHi = moe.sayHi;
    t.is(curly.getName(), 'name: curly', 'unbound function is bound to current object');
    t.is(curly.sayHi(), 'hi: moe', 'bound function is still bound to original object');

    curly = {name : 'curly'};
    moe = {
      name    : 'moe',
      getName : function() { return 'name: ' + this.name; },
      sayHi   : function() { return 'hi: ' + this.name; }
    };

    t.throws(function() { _.bindAll(moe); }, Error, 'throws an error for bindAll with no functions named');

    _.bindAll(moe, 'sayHi');
    curly.sayHi = moe.sayHi;
    t.is(curly.sayHi(), 'hi: moe');
    t.end();
  });

  test('memoize', function(t) {
    var fib = function(n) {
      return n < 2 ? n : fib(n - 1) + fib(n - 2);
    };
    t.is(fib(10), 55, 'a memoized version of fibonacci produces identical results');
    fib = _.memoize(fib); // Redefine `fib` for memoization
    t.is(fib(10), 55, 'a memoized version of fibonacci produces identical results');

    var o = function(str) {
      return str;
    };
    var fastO = _.memoize(o);
    t.is(o('toString'), 'toString', 'checks hasOwnProperty');
    t.is(fastO('toString'), 'toString', 'checks hasOwnProperty');
    t.end();
  });

  test('delay', 2, function(t) {
    var delayed = false;
    _.delay(function(){ delayed = true; }, 100);
    setTimeout(function(){ t.ok(!delayed, "didn't delay the function quite yet"); }, 50);
    setTimeout(function(){ t.ok(delayed, 'delayed the function'); t.end(); }, 150);
  });

  test('defer', 1, function(t) {
    var deferred = false;
    _.defer(function(bool){ deferred = bool; }, true);
    _.delay(function(){ t.ok(deferred, 'deferred the function'); t.end(); }, 50);
  });

  test('throttle', 2, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 32);
    throttledIncr(); throttledIncr();

    t.is(counter, 1, 'incr was called immediately');
    _.delay(function(){ t.is(counter, 2, 'incr was throttled'); t.end(); }, 64);
  });

  test('throttle arguments', 2, function(t) {
    var value = 0;
    var update = function(val){ value = val; };
    var throttledUpdate = _.throttle(update, 32);
    throttledUpdate(1); throttledUpdate(2);
    _.delay(function(){ throttledUpdate(3); }, 64);
    t.is(value, 1, 'updated to latest value');
    _.delay(function(){ t.is(value, 3, 'updated to latest value'); t.end(); }, 96);
  });

  test('throttle once', 2, function(t) {
    var counter = 0;
    var incr = function(){ return ++counter; };
    var throttledIncr = _.throttle(incr, 32);
    var result = throttledIncr();
    _.delay(function(){
      t.is(result, 1, 'throttled functions return their value');
      t.is(counter, 1, 'incr was called once'); t.end();
    }, 64);
  });

  test('throttle twice', 1, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 32);
    throttledIncr(); throttledIncr();
    _.delay(function(){ t.is(counter, 2, 'incr was called twice'); t.end(); }, 64);
  });

  test('more throttling', 3, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 30);
    throttledIncr(); throttledIncr();
    t.ok(counter == 1);
    _.delay(function(){
      t.ok(counter == 2);
      throttledIncr();
      t.ok(counter == 3);
      t.end();
    }, 85);
  });

  test('throttle repeatedly with results', 6, function(t) {
    var counter = 0;
    var incr = function(){ return ++counter; };
    var throttledIncr = _.throttle(incr, 100);
    var results = [];
    var saveResult = function() { results.push(throttledIncr()); };
    saveResult(); saveResult();
    _.delay(saveResult, 50);
    _.delay(saveResult, 150);
    _.delay(saveResult, 160);
    _.delay(saveResult, 230);
    _.delay(function() {
      t.is(results[0], 1, 'incr was called once');
      t.is(results[1], 1, 'incr was throttled');
      t.is(results[2], 1, 'incr was throttled');
      t.is(results[3], 2, 'incr was called twice');
      t.is(results[4], 2, 'incr was throttled');
      t.is(results[5], 3, 'incr was called trailing');
      t.end();
    }, 300);
  });

  test('throttle triggers trailing call when invoked repeatedly', 2, function(t) {
    var counter = 0;
    var limit = 48;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 32);

    var stamp = new Date;
    while ((new Date - stamp) < limit) {
      throttledIncr();
    }
    var lastCount = counter;
    t.ok(counter > 1);

    _.delay(function() {
      t.ok(counter > lastCount);
      t.end();
    }, 96);
  });

  test('throttle does not trigger leading call when leading is set to false', 2, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 60, {leading: false});

    throttledIncr(); throttledIncr();
    t.ok(counter === 0);

    _.delay(function() {
      t.ok(counter == 1);
      t.end();
    }, 96);
  });

  test('more throttle does not trigger leading call when leading is set to false', 3, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 100, {leading: false});

    throttledIncr();
    _.delay(throttledIncr, 50);
    _.delay(throttledIncr, 60);
    _.delay(throttledIncr, 200);
    t.ok(counter === 0);

    _.delay(function() {
      t.ok(counter == 1);
    }, 250);

    _.delay(function() {
      t.ok(counter == 2);
      t.end();
    }, 350);
  });

  test('one more throttle with leading: false test', 2, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 100, {leading: false});

    var time = new Date;
    while (new Date - time < 350) throttledIncr();
    t.ok(counter <= 3);

    _.delay(function() {
      t.ok(counter <= 4);
      t.end();
    }, 200);
  });

  test('throttle does not trigger trailing call when trailing is set to false', 4, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var throttledIncr = _.throttle(incr, 60, {trailing: false});

    throttledIncr(); throttledIncr(); throttledIncr();
    t.ok(counter === 1);

    _.delay(function() {
      t.ok(counter == 1);

      throttledIncr(); throttledIncr();
      t.ok(counter == 2);

      _.delay(function() {
        t.ok(counter == 2);
        t.end();
      }, 96);
    }, 96);
  });

  test('debounce', 1, function(t) {
    var counter = 0;
    var incr = function(){ counter++; };
    var debouncedIncr = _.debounce(incr, 32);
    debouncedIncr(); debouncedIncr();
    _.delay(debouncedIncr, 16);
    _.delay(function(){ t.is(counter, 1, 'incr was debounced'); t.end(); }, 96);
  });

  test('debounce asap', 4, function(t) {
    var a, b;
    var counter = 0;
    var incr = function(){ return ++counter; };
    var debouncedIncr = _.debounce(incr, 64, true);
    a = debouncedIncr();
    b = debouncedIncr();
    t.is(a, 1);
    t.is(b, 1);
    t.is(counter, 1, 'incr was called immediately');
    _.delay(debouncedIncr, 16);
    _.delay(debouncedIncr, 32);
    _.delay(debouncedIncr, 48);
    _.delay(function(){ t.is(counter, 1, 'incr was debounced'); t.end(); }, 128);
  });

  test('debounce asap recursively', 2, function(t) {
    var counter = 0;
    var debouncedIncr = _.debounce(function(){
      counter++;
      if (counter < 10) debouncedIncr();
    }, 32, true);
    debouncedIncr();
    t.is(counter, 1, 'incr was called immediately');
    _.delay(function(){ t.is(counter, 1, 'incr was debounced'); t.end(); }, 96);
  });

  test('once', function(t) {
    var num = 0;
    var increment = _.once(function(){ num++; });
    increment();
    increment();
    t.is(num, 1);
    t.end();
  });

  test('Recursive onced function.', 1, function(t) {
    var f = _.once(function(){
      t.ok(true);
      f();
    });
    f();
    t.end();
  });

  test('wrap', function(t) {
    var greet = function(name){ return 'hi: ' + name; };
    var backwards = _.wrap(greet, function(func, name){ return func(name) + ' ' + name.split('').reverse().join(''); });
    t.is(backwards('moe'), 'hi: moe eom', 'wrapped the salutation function');

    var inner = function(){ return 'Hello '; };
    var obj   = {name : 'Moe'};
    obj.hi    = _.wrap(inner, function(fn){ return fn() + this.name; });
    t.is(obj.hi(), 'Hello Moe');

    var noop    = function(){};
    var wrapped = _.wrap(noop, function(fn){ return Array.prototype.slice.call(arguments, 0); });
    var ret     = wrapped(['whats', 'your'], 'vector', 'victor');
    t.same(ret, [noop, ['whats', 'your'], 'vector', 'victor']);
    t.end();
  });

  test('compose', function(t) {
    var greet = function(name){ return 'hi: ' + name; };
    var exclaim = function(sentence){ return sentence + '!'; };
    var composed = _.compose(exclaim, greet);
    t.is(composed('moe'), 'hi: moe!', 'can compose a function that takes another');

    composed = _.compose(greet, exclaim);
    t.is(composed('moe'), 'hi: moe!', 'in this case, the functions are also commutative');
    t.end();
  });

  test('after', function(t) {
    var testAfter = function(afterAmount, timesCalled) {
      var afterCalled = 0;
      var after = _.after(afterAmount, function() {
        afterCalled++;
      });
      while (timesCalled--) after();
      return afterCalled;
    };

    t.is(testAfter(5, 5), 1, 'after(N) should fire after being called N times');
    t.is(testAfter(5, 4), 0, 'after(N) should not fire unless called N times');
    t.is(testAfter(0, 0), 0, 'after(0) should not fire immediately');
    t.is(testAfter(0, 1), 1, 'after(0) should fire when first invoked');
    t.end();
  });

})();
