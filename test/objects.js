if (typeof require !== 'undefined') {
  var _ = require('../underscore');
}

(function (exports) {
//$(document).ready(function() {

  //module("Object functions (values, extend, isEqual, and so on...)");

exports["objects: keys"] = function(test) {
  test.equals(_.keys({one : 1, two : 2}).join(', '), 'one, two', 'can extract the keys from an object');
  test.done();
};

exports["objects: values"] = function(test) {
  test.equals(_.values({one : 1, two : 2}).join(', '), '1, 2', 'can extract the values from an object');
  test.done();
};

exports["objects: functions"] = function(test) {
  var obj = {a : 'dash', b : _.map, c : (/yo/), d : _.reduce};
  test.ok(_.isEqual(['b', 'd'], _.functions(obj)), 'can grab the function names of any passed-in object');
  test.done();
};

exports["objects: extend"] = function(test) {
  var result;
  test.equals(_.extend({}, {a:'b'}).a, 'b', 'can extend an object with the attributes of another');
  test.equals(_.extend({a:'x'}, {a:'b'}).a, 'b', 'properties in source override destination');
  test.equals(_.extend({x:'x'}, {a:'b'}).x, 'x', 'properties not in source dont get overriden');
  result = _.extend({x:'x'}, {a:'a'}, {b:'b'});
  test.ok(_.isEqual(result, {x:'x', a:'a', b:'b'}), 'can extend from multiple source objects');
  result = _.extend({x:'x'}, {a:'a', x:2}, {a:'b'});
  test.ok(_.isEqual(result, {x:2, a:'b'}), 'extending from multiple source objects last property trumps');
  test.done();
};

exports["objects: clone"] = function(test) {
  var moe = {name : 'moe', lucky : [13, 27, 34]};
  var clone = _.clone(moe);
  test.equals(clone.name, 'moe', 'the clone as the attributes of the original');

  clone.name = 'curly';
  test.ok(clone.name == 'curly' && moe.name == 'moe', 'clones can change shallow attributes without affecting the original');

  clone.lucky.push(101);
  test.equals(_.last(moe.lucky), 101, 'changes to deep attributes are shared with the original');
  test.done();
};

exports["objects: isEqual"] = function(test) {
  var moe   = {name : 'moe', lucky : [13, 27, 34]};
  var clone = {name : 'moe', lucky : [13, 27, 34]};
  test.ok(moe != clone, 'basic equality between objects is false');
  test.ok(_.isEqual(moe, clone), 'deep equality is true');
  test.ok(_(moe).isEqual(clone), 'OO-style deep equality works');
  test.ok(!_.isEqual(5, NaN), '5 is not equal to NaN');
  test.ok(NaN != NaN, 'NaN is not equal to NaN (native equality)');
  test.ok(NaN !== NaN, 'NaN is not equal to NaN (native identity)');
  test.ok(!_.isEqual(NaN, NaN), 'NaN is not equal to NaN');
  test.ok(_.isEqual(new Date(100), new Date(100)), 'identical dates are equal');
  test.ok(_.isEqual((/hello/ig), (/hello/ig)), 'identical regexes are equal');
  test.ok(!_.isEqual(null, [1]), 'a falsy is never equal to a truthy');
  test.ok(!_.isEqual({x: 1, y: undefined}, {x: 1, z: 2}), 'object with the same number of undefined keys are not equal');
  test.done();
};

exports["objects: isEmpty"] = function(test) {
  test.ok(!_([1]).isEmpty(), '[1] is not empty');
  test.ok(_.isEmpty([]), '[] is empty');
  test.ok(!_.isEmpty({one : 1}), '{one : 1} is not empty');
  test.ok(_.isEmpty({}), '{} is empty');
  test.ok(_.isEmpty(new RegExp('')), 'objects with prototype properties are empty');
  test.ok(_.isEmpty(null), 'null is empty');
  test.ok(_.isEmpty(), 'undefined is empty');
  test.ok(_.isEmpty(''), 'the empty string is empty');
  test.ok(!_.isEmpty('moe'), 'but other strings are not');

  var obj = {one : 1};
  delete obj.one;
  test.ok(_.isEmpty(obj), 'deleting all the keys from an object empties it');
  test.done();
};

if (typeof document !== 'undefined') {
  $(document).ready(function () {
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
  });
}

exports["objects: isElement"] = function(test) {
  test.ok(!_.isElement('div'), 'strings are not dom elements');
  if (typeof document !== 'undefined') {
    test.ok(_.isElement($('html')[0]), 'the html tag is a DOM element');
    test.ok(_.isElement(iElement), 'even from another frame');
  }
  test.done();
};

exports["objects: isArguments"] = function(test) {
  var args = (function(){ return arguments; })(1, 2, 3);
  test.ok(!_.isArguments('string'), 'a string is not an arguments object');
  test.ok(!_.isArguments(_.isArguments), 'a function is not an arguments object');
  test.ok(_.isArguments(args), 'but the arguments object is an arguments object');
  test.ok(!_.isArguments(_.toArray(args)), 'but not when it\'s converted into an array');
  test.ok(!_.isArguments([1,2,3]), 'and not vanilla arrays.');
  if (typeof document !== 'undefined') {
    test.ok(_.isArguments(iArguments), 'even from another frame');
  }
  test.done();
};

exports["objects: isArray"] = function(test) {
  test.ok(!_.isArray(arguments), 'the arguments object is not an array');
  test.ok(_.isArray([1, 2, 3]), 'but arrays are');
  if (typeof document !== 'undefined') {
    test.ok(_.isArray(iArray), 'even from another frame');
  }
  test.done();
};

exports["objects: isString"] = function(test) {
  if (typeof document !== 'undefined') {
    test.ok(!_.isString(document.body), 'the document body is not a string');
  }
  test.ok(_.isString([1, 2, 3].join(', ')), 'but strings are');
  if (typeof document !== 'undefined') {
    test.ok(_.isString(iString), 'even from another frame');
  }
  test.done();
};

exports["objects: isNumber"] = function(test) {
  test.ok(!_.isNumber('string'), 'a string is not a number');
  test.ok(!_.isNumber(arguments), 'the arguments object is not a number');
  test.ok(!_.isNumber(undefined), 'undefined is not a number');
  test.ok(_.isNumber(3 * 4 - 7 / 10), 'but numbers are');
  test.ok(!_.isNumber(NaN), 'NaN is not a number');
  test.ok(_.isNumber(Infinity), 'Infinity is a number');
  if (typeof document !== 'undefined') {
    test.ok(_.isNumber(iNumber), 'even from another frame');
  }
  test.done();
};

exports["objects: isBoolean"] = function(test) {
  test.ok(!_.isBoolean(2), 'a number is not a boolean');
  test.ok(!_.isBoolean("string"), 'a string is not a boolean');
  test.ok(!_.isBoolean("false"), 'the string "false" is not a boolean');
  test.ok(!_.isBoolean("true"), 'the string "true" is not a boolean');
  test.ok(!_.isBoolean(arguments), 'the arguments object is not a boolean');
  test.ok(!_.isBoolean(undefined), 'undefined is not a boolean');
  test.ok(!_.isBoolean(NaN), 'NaN is not a boolean');
  test.ok(!_.isBoolean(null), 'null is not a boolean');
  test.ok(_.isBoolean(true), 'but true is');
  test.ok(_.isBoolean(false), 'and so is false');
  if (typeof document !== 'undefined') {
    test.ok(_.isBoolean(iBoolean), 'even from another frame');
  }
  test.done();
};

exports["objects: isFunction"] = function(test) {
  test.ok(!_.isFunction([1, 2, 3]), 'arrays are not functions');
  test.ok(!_.isFunction('moe'), 'strings are not functions');
  test.ok(_.isFunction(_.isFunction), 'but functions are');
  if (typeof document !== 'undefined') {
    test.ok(_.isFunction(iFunction), 'even from another frame');
  }
  test.done();
};

exports["objects: isDate"] = function(test) {
  test.ok(!_.isDate(100), 'numbers are not dates');
  test.ok(!_.isDate({}), 'objects are not dates');
  test.ok(_.isDate(new Date()), 'but dates are');
  if (typeof document !== 'undefined') {
    test.ok(_.isDate(iDate), 'even from another frame');
  }
  test.done();
};

exports["objects: isRegExp"] = function(test) {
  test.ok(!_.isRegExp(_.identity), 'functions are not RegExps');
  test.ok(_.isRegExp(/identity/), 'but RegExps are');
  if (typeof document !== 'undefined') {
    test.ok(_.isRegExp(iRegExp), 'even from another frame');
  }
  test.done();
};

exports["objects: isNaN"] = function(test) {
  test.ok(!_.isNaN(undefined), 'undefined is not NaN');
  test.ok(!_.isNaN(null), 'null is not NaN');
  test.ok(!_.isNaN(0), '0 is not NaN');
  test.ok(_.isNaN(NaN), 'but NaN is');
  if (typeof document !== 'undefined') {
    test.ok(_.isNaN(iNaN), 'even from another frame');
  }
  test.done();
};

exports["objects: isNull"] = function(test) {
  test.ok(!_.isNull(undefined), 'undefined is not null');
  test.ok(!_.isNull(NaN), 'NaN is not null');
  test.ok(_.isNull(null), 'but null is');
  if (typeof document !== 'undefined') {
    test.ok(_.isNull(iNull), 'even from another frame');
  }
  test.done();
};

exports["objects: isUndefined"] = function(test) {
  test.ok(!_.isUndefined(1), 'numbers are defined');
  test.ok(!_.isUndefined(null), 'null is defined');
  test.ok(!_.isUndefined(false), 'false is defined');
  test.ok(_.isUndefined(), 'nothing is undefined');
  test.ok(_.isUndefined(undefined), 'undefined is undefined');
  if (typeof document !== 'undefined') {
    test.ok(_.isUndefined(iUndefined), 'even from another frame');
  }
  test.done();
};

exports["objects: tap"] = function(test) {
  var intercepted = null;
  var interceptor = function(obj) { intercepted = obj; };
  var returned = _.tap(1, interceptor);
  test.equals(intercepted, 1, "passes tapped object to interceptor");
  test.equals(returned, 1, "returns tapped object");

  returned = _([1,2,3]).chain().
    map(function(n){ return n * 2; }).
    max().
    tap(interceptor).
    value();
  test.ok(returned == 6 && intercepted == 6, 'can use tapped objects in a chain');
  test.done();
};
//});
})(typeof exports === 'undefined' ? this['objects'] = {}: exports);
