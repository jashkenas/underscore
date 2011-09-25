(function() {

  var numbers = [];
  for (var i=0; i<1000; i++) numbers.push(i);
  var objects = _.map(numbers, function(n){ return {num : n}; });
  var randomized = _.sortBy(numbers, function(){ return Math.random(); });

  JSLitmus.test('_.each()', function() {
    var timesTwo = [];
    _.each(numbers, function(num){ timesTwo.push(num * 2); });
    return timesTwo;
  });

  JSLitmus.test('_(list).each()', function() {
    var timesTwo = [];
    _(numbers).each(function(num){ timesTwo.push(num * 2); });
    return timesTwo;
  });

  JSLitmus.test('jQuery.each()', function() {
    var timesTwo = [];
    jQuery.each(numbers, function(){ timesTwo.push(this * 2); });
    return timesTwo;
  });

  JSLitmus.test('_.map()', function() {
    return _.map(objects, function(obj){ return obj.num; });
  });

  JSLitmus.test('jQuery.map()', function() {
    return jQuery.map(objects, function(obj){ return obj.num; });
  });

  JSLitmus.test('_.pluck()', function() {
    return _.pluck(objects, 'num');
  });

  JSLitmus.test('_.uniq()', function() {
    return _.uniq(randomized);
  });

  JSLitmus.test('_.uniq() (sorted)', function() {
    return _.uniq(numbers, true);
  });

  JSLitmus.test('_.sortBy()', function() {
    return _.sortBy(numbers, function(num){ return -num; });
  });

  JSLitmus.test('_.isEqual()', function() {
    return _.isEqual(numbers, randomized);
  });

  JSLitmus.test('_.keys()', function() {
    return _.keys(objects);
  });

  JSLitmus.test('_.values()', function() {
    return _.values(objects);
  });

  JSLitmus.test('_.intersect() with 2 parameters', function() {
    return _.intersect(numbers, randomized);
  });

  // Make 5 arrays with respectively 10000, 5000, 3333, 2500, 1428 elements each
  var every = _.map([1,2,3,5,7], function (n) {
    var res = [];
    for (var i = 1; i <= 10000; i += n) {
      res.push(i);
    }
    return res;
  });

  JSLitmus.test('_.intersect() with 5 parameters', function() {
    return _.intersect.apply(_, every);
  });

  JSLitmus.test('_.range()', function() {
    return _.range(1000);
  });

})();
