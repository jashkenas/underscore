$(document).ready(function() {

  module("Object functions (values, extend, isEqual, and so on...)");

  test("objects: keys", function() {
    var exception = /object/;
    equals(_.keys({one : 1, two : 2}).join(', '), 'one, two', 'can extract the keys from an object');
    // the test above is not safe because it relies on for-in enumeration order
    var a = []; a[1] = 0;
    equals(_.keys(a).join(', '), '1', 'is not fooled by sparse arrays; see issue #95');
    raises(function() { _.keys(null); }, exception, 'throws an error for `null` values');
    raises(function() { _.keys(void 0); }, exception, 'throws an error for `undefined` values');
    raises(function() { _.keys(1); }, exception, 'throws an error for number primitives');
    raises(function() { _.keys('a'); }, exception, 'throws an error for string primitives');
    raises(function() { _.keys(true); }, exception, 'throws an error for boolean primitives');
  });

  test("objects: values", function() {
    equals(_.values({one : 1, two : 2}).join(', '), '1, 2', 'can extract the values from an object');
  });

  test("objects: keypathExists", function() {
    var object = {follow: {me: {down: {the: 'road'} } } };

    ok(_.hasKeypath(object, 'follow.me'), 'follow.me exists');
    ok(_.hasKeypath(object, ['follow','me']), 'follow.me as array exists');
    ok(_.hasKeypath(object, 'follow.me.down.the'), 'follow.me.down.the exists');
    ok(_.hasKeypath(object, ['follow','me','down','the']), 'follow.me.down.the as array exists');
    ok(!_.hasKeypath(object, 'follow.me.down.the.road'), 'follow.me.down.the.road does not exist');
    ok(!_.hasKeypath(object, ['follow','me','down','the','road']), 'follow.me.down.the.road as array does not exist');
  });

  test("objects: keypathValueOwner", function() {
    var object = {follow: {me: {down: {the: 'road'} } } };

    ok(object.follow === _.keypathValueOwner(object, 'follow.me'), 'follow.me owner as expected');
    ok(object.follow === _.keypathValueOwner(object, ['follow','me']), 'follow.me as array owner as expected');
    ok(object.follow.me.down === _.keypathValueOwner(object, 'follow.me.down.the'), 'follow.me.down.the owner as expected');
    ok(object.follow.me.down === _.keypathValueOwner(object, ['follow','me','down','the']), 'follow.me.down.the as array owner as expected');
    ok(!_.keypathValueOwner(object, 'follow.me.down.the.road'), 'follow.me.down.the.road owner does not exist');
    ok(!_.keypathValueOwner(object, ['follow','me','down','the','road']), 'follow.me.down.the.road owner as array does not exist');
  });

  test("objects: keypathValue", function() {
    var object = {follow: {me: {down: {the: 'road'} } } }, result;

    result = _.keypathValue(object, 'follow.me');
    ok(_.isEqual(result,{down: {the: 'road'} }), 'follow.me value as expected');
    result = _.keypathValue(object, ['follow','me']);
    ok(_.isEqual(result,{down: {the: 'road'} }), 'follow.me value as expected');
    result = _.keypathValue(object, 'follow.me.down.the');
    ok(_.isEqual(result,'road'), 'follow.me.down.the value as expected');
    result = _.keypathValue(object, ['follow','me','down','the']);
    ok(_.isEqual(result,'road'), 'follow.me.down.the value as array as expected');
    result = _.keypathValue(object, 'follow.me.down.the.road');
    ok(!result, 'follow.me.down.the.road does not exist');
    result = _.keypathValue(object, ['follow','me','down','the','road']);
    ok(!result, 'follow.me.down.the.road owner as array does not exist');
    result = _.keypathValue(object, 'follow.me.down.the.road', 'holding hands?');
    ok(result==='holding hands?', 'follow.me.down.the.road does not exist but we are happy?');
    result = _.keypathValue(object, ['follow','me','down','the','road'], 'and watch out for the...nevermind');
    ok(result==='and watch out for the...nevermind', 'follow.me.down.the.road owner as array does not exist and we didnt see it ahead of time?');
  });

  test("objects: keypathValue", function() {
    var object, result;

    object = {follow: {me: {down: {the: 'road'} } } }; _.keypathSetValue(object, 'follow.me', 'if you want to live');
    ok(_.isEqual(object.follow.me,'if you want to live'), 'follow.me value as expected');
    object = {follow: {me: {down: {the: 'road'} } } }; _.keypathSetValue(object, ['follow','me'], 'and hold this big bag of money');
    ok(_.isEqual(object.follow.me,'and hold this big bag of money'), 'follow.me value as expected');
    object = {follow: {me: {down: {the: 'road'} } } }; _.keypathSetValue(object, 'follow.me.down.the', 'rabbit hole');
    ok(_.isEqual(object.follow.me.down.the,'rabbit hole'), 'follow.me.down.the value as expected');
    object = {follow: {me: {down: {the: 'road'} } } }; _.keypathSetValue(object, ['follow','me','down','the'], '...damn, we are surrounded');
    ok(_.isEqual(object.follow.me.down.the,'...damn, we are surrounded'), 'follow.me.down.the value as array as expected');
    object = {follow: {me: {down: {the: 'road'} } } }; result = _.keypathSetValue(object, 'follow.me.down.the.road', 'nevermind');
    ok(!result, 'follow.me.down.the.road not set');
    object = {follow: {me: {down: {the: 'road'} } } }; result = _.keypathSetValue(object, ['follow','me','down','the','road'], 'bleach');
    ok(!result, 'follow.me.down.the.road as array not set');
  });

  test("objects: functions", function() {
    var obj = {a : 'dash', b : _.map, c : (/yo/), d : _.reduce};
    ok(_.isEqual(['b', 'd'], _.functions(obj)), 'can grab the function names of any passed-in object');

    var Animal = function(){};
    Animal.prototype.run = function(){};
    equals(_.functions(new Animal).join(''), 'run', 'also looks up functions on the prototype');
  });

  test("objects: extend", function() {
    var result;
    equals(_.extend({}, {a:'b'}).a, 'b', 'can extend an object with the attributes of another');
    equals(_.extend({a:'x'}, {a:'b'}).a, 'b', 'properties in source override destination');
    equals(_.extend({x:'x'}, {a:'b'}).x, 'x', 'properties not in source dont get overriden');
    result = _.extend({x:'x'}, {a:'a'}, {b:'b'});
    ok(_.isEqual(result, {x:'x', a:'a', b:'b'}), 'can extend from multiple source objects');
    result = _.extend({x:'x'}, {a:'a', x:2}, {a:'b'});
    ok(_.isEqual(result, {x:2, a:'b'}), 'extending from multiple source objects last property trumps');
    result = _.extend({}, {a: void 0, b: null});
    equals(_.keys(result).join(''), 'b', 'extend does not copy undefined values');
  });

  test("objects: defaults", function() {
    var result;
    var options = {zero: 0, one: 1, empty: "", nan: NaN, string: "string"};

    _.defaults(options, {zero: 1, one: 10, twenty: 20});
    equals(options.zero, 0, 'value exists');
    equals(options.one, 1, 'value exists');
    equals(options.twenty, 20, 'default applied');

    _.defaults(options, {empty: "full"}, {nan: "nan"}, {word: "word"}, {word: "dog"});
    equals(options.empty, "", 'value exists');
    ok(_.isNaN(options.nan), "NaN isn't overridden");
    equals(options.word, "word", 'new value is added, first one wins');
  });

  test("objects: clone", function() {
    var moe = {name : 'moe', lucky : [13, 27, 34]};
    var clone = _.clone(moe);
    equals(clone.name, 'moe', 'the clone as the attributes of the original');

    clone.name = 'curly';
    ok(clone.name == 'curly' && moe.name == 'moe', 'clones can change shallow attributes without affecting the original');

    clone.lucky.push(101);
    equals(_.last(moe.lucky), 101, 'changes to deep attributes are shared with the original');
  });

  test("objects: isEqual", function() {
    var moe   = {name : 'moe', lucky : [13, 27, 34]};
    var clone = {name : 'moe', lucky : [13, 27, 34]};
    ok(moe != clone, 'basic equality between objects is false');
    ok(_.isEqual(moe, clone), 'deep equality is true');
    ok(_(moe).isEqual(clone), 'OO-style deep equality works');
    ok(!_.isEqual(5, NaN), '5 is not equal to NaN');
    ok(NaN != NaN, 'NaN is not equal to NaN (native equality)');
    ok(NaN !== NaN, 'NaN is not equal to NaN (native identity)');
    ok(!_.isEqual(NaN, NaN), 'NaN is not equal to NaN');
    ok(_.isEqual(new Date(100), new Date(100)), 'identical dates are equal');
    ok(_.isEqual((/hello/ig), (/hello/ig)), 'identical regexes are equal');
    ok(!_.isEqual(null, [1]), 'a falsy is never equal to a truthy');
    ok(_.isEqual({isEqual: function () { return true; }}, {}), 'first object implements `isEqual`');
    ok(_.isEqual({}, {isEqual: function () { return true; }}), 'second object implements `isEqual`');
    ok(!_.isEqual({x: 1, y: undefined}, {x: 1, z: 2}), 'objects with the same number of undefined keys are not equal');
    ok(!_.isEqual(_({x: 1, y: undefined}).chain(), _({x: 1, z: 2}).chain()), 'wrapped objects are not equal');
    equals(_({x: 1, y: 2}).chain().isEqual(_({x: 1, y: 2}).chain()).value(), true, 'wrapped objects are equal');
  });

  test("objects: isEmpty", function() {
    ok(!_([1]).isEmpty(), '[1] is not empty');
    ok(_.isEmpty([]), '[] is empty');
    ok(!_.isEmpty({one : 1}), '{one : 1} is not empty');
    ok(_.isEmpty({}), '{} is empty');
    ok(_.isEmpty(new RegExp('')), 'objects with prototype properties are empty');
    ok(_.isEmpty(null), 'null is empty');
    ok(_.isEmpty(), 'undefined is empty');
    ok(_.isEmpty(''), 'the empty string is empty');
    ok(!_.isEmpty('moe'), 'but other strings are not');

    var obj = {one : 1};
    delete obj.one;
    ok(_.isEmpty(obj), 'deleting all the keys from an object empties it');
  });

  // Setup remote variables for iFrame tests.
  var iframe = document.createElement('iframe');
  jQuery(iframe).appendTo(document.body);
  var iDoc = iframe.contentDocument || iframe.contentWindow.document;
  iDoc.write(
    "<script>\
      parent.iElement   = document.createElement('div');\
      parent.iArguments = (function(){ return arguments; })(1, 2, 3);\
      parent.iArray     = [1, 2, 3];\
      parent.iString    = 'hello';\
      parent.iNumber    = 100;\
      parent.iFunction  = (function(){});\
      parent.iDate      = new Date();\
      parent.iRegExp    = /hi/;\
      parent.iNaN       = NaN;\
      parent.iNull      = null;\
      parent.iBoolean   = false;\
      parent.iUndefined = undefined;\
    </script>"
  );
  iDoc.close();

  test("objects: isElement", function() {
    ok(!_.isElement('div'), 'strings are not dom elements');
    ok(_.isElement($('html')[0]), 'the html tag is a DOM element');
    ok(_.isElement(iElement), 'even from another frame');
  });

  test("objects: isArguments", function() {
    var args = (function(){ return arguments; })(1, 2, 3);
    ok(!_.isArguments('string'), 'a string is not an arguments object');
    ok(!_.isArguments(_.isArguments), 'a function is not an arguments object');
    ok(_.isArguments(args), 'but the arguments object is an arguments object');
    ok(!_.isArguments(_.toArray(args)), 'but not when it\'s converted into an array');
    ok(!_.isArguments([1,2,3]), 'and not vanilla arrays.');
    ok(_.isArguments(iArguments), 'even from another frame');
  });

  test("objects: isObject", function() {
    ok(_.isObject(arguments), 'the arguments object is object');
    ok(_.isObject([1, 2, 3]), 'and arrays');
    ok(_.isObject($('html')[0]), 'and DOM element');
    ok(_.isObject(iElement), 'even from another frame');
    ok(_.isObject(function () {}), 'and functions');
    ok(_.isObject(iFunction), 'even from another frame');
    ok(!_.isObject(null), 'but not null');
    ok(!_.isObject(undefined), 'and not undefined');
    ok(!_.isObject('string'), 'and not string');
    ok(!_.isObject(12), 'and not number');
    ok(!_.isObject(true), 'and not boolean');
    ok(_.isObject(new String('string')), 'but new String()');
  });

  test("objects: isArray", function() {
    ok(!_.isArray(arguments), 'the arguments object is not an array');
    ok(_.isArray([1, 2, 3]), 'but arrays are');
    ok(_.isArray(iArray), 'even from another frame');
  });

  test("objects: isString", function() {
    ok(!_.isString(document.body), 'the document body is not a string');
    ok(_.isString([1, 2, 3].join(', ')), 'but strings are');
    ok(_.isString(iString), 'even from another frame');
  });

  test("objects: isNumber", function() {
    ok(!_.isNumber('string'), 'a string is not a number');
    ok(!_.isNumber(arguments), 'the arguments object is not a number');
    ok(!_.isNumber(undefined), 'undefined is not a number');
    ok(_.isNumber(3 * 4 - 7 / 10), 'but numbers are');
    ok(!_.isNumber(NaN), 'NaN is not a number');
    ok(_.isNumber(Infinity), 'Infinity is a number');
    ok(_.isNumber(iNumber), 'even from another frame');
  });

  test("objects: isBoolean", function() {
    ok(!_.isBoolean(2), 'a number is not a boolean');
   	ok(!_.isBoolean("string"), 'a string is not a boolean');
    ok(!_.isBoolean("false"), 'the string "false" is not a boolean');
    ok(!_.isBoolean("true"), 'the string "true" is not a boolean');
    ok(!_.isBoolean(arguments), 'the arguments object is not a boolean');
    ok(!_.isBoolean(undefined), 'undefined is not a boolean');
    ok(!_.isBoolean(NaN), 'NaN is not a boolean');
    ok(!_.isBoolean(null), 'null is not a boolean');
    ok(_.isBoolean(true), 'but true is');
    ok(_.isBoolean(false), 'and so is false');
    ok(_.isBoolean(iBoolean), 'even from another frame');
  });

  test("objects: isFunction", function() {
    ok(!_.isFunction([1, 2, 3]), 'arrays are not functions');
    ok(!_.isFunction('moe'), 'strings are not functions');
    ok(_.isFunction(_.isFunction), 'but functions are');
    ok(_.isFunction(iFunction), 'even from another frame');
  });

  test("objects: isDate", function() {
    ok(!_.isDate(100), 'numbers are not dates');
    ok(!_.isDate({}), 'objects are not dates');
    ok(_.isDate(new Date()), 'but dates are');
    ok(_.isDate(iDate), 'even from another frame');
  });

  test("objects: isRegExp", function() {
    ok(!_.isRegExp(_.identity), 'functions are not RegExps');
    ok(_.isRegExp(/identity/), 'but RegExps are');
    ok(_.isRegExp(iRegExp), 'even from another frame');
  });

  test("objects: isNaN", function() {
    ok(!_.isNaN(undefined), 'undefined is not NaN');
    ok(!_.isNaN(null), 'null is not NaN');
    ok(!_.isNaN(0), '0 is not NaN');
    ok(_.isNaN(NaN), 'but NaN is');
    ok(_.isNaN(iNaN), 'even from another frame');
  });

  test("objects: isNull", function() {
    ok(!_.isNull(undefined), 'undefined is not null');
    ok(!_.isNull(NaN), 'NaN is not null');
    ok(_.isNull(null), 'but null is');
    ok(_.isNull(iNull), 'even from another frame');
  });

  test("objects: isUndefined", function() {
    ok(!_.isUndefined(1), 'numbers are defined');
    ok(!_.isUndefined(null), 'null is defined');
    ok(!_.isUndefined(false), 'false is defined');
    ok(!_.isUndefined(NaN), 'NaN is defined');
    ok(_.isUndefined(), 'nothing is undefined');
    ok(_.isUndefined(undefined), 'undefined is undefined');
    ok(_.isUndefined(iUndefined), 'even from another frame');
  });

  if (window.ActiveXObject) {
    test("objects: IE host objects", function() {
      var xml = new ActiveXObject("Msxml2.DOMDocument.3.0");
      ok(!_.isNumber(xml));
      ok(!_.isBoolean(xml));
      ok(!_.isNaN(xml));
      ok(!_.isFunction(xml));
      ok(!_.isNull(xml));
      ok(!_.isUndefined(xml));
    });
  }

  test("objects: tap", function() {
    var intercepted = null;
    var interceptor = function(obj) { intercepted = obj; };
    var returned = _.tap(1, interceptor);
    equals(intercepted, 1, "passes tapped object to interceptor");
    equals(returned, 1, "returns tapped object");

    returned = _([1,2,3]).chain().
      map(function(n){ return n * 2; }).
      max().
      tap(interceptor).
      value();
    ok(returned == 6 && intercepted == 6, 'can use tapped objects in a chain');
  });
});
