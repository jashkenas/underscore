(function() {
  var _ = typeof require == 'function' ? require('..') : window._;
  QUnit.module('Statistics');
  QUnit.test('mean', function(assert) {
    assert.strictEqual(_.mean(null), 0, 'can handle null/undefined');
    assert.strictEqual(_.mean(void 0), 0, 'can handle undefined');
    assert.strictEqual(_.mean([1, 2, 3]), 2, "Avearge of the numbers in the collection");
    assert.strictEqual(_.mean({}), 0, 'Avearge value of an empty object');
    assert.strictEqual(_.mean([]), 0, 'Avearge value of an empty array');
  });

  QUnit.test('median', function(assert) {
    assert.strictEqual(_.median(null), undefined, 'can handle null/undefined');
    assert.strictEqual(_.median(void 0), undefined, 'can handle undefined');
    assert.strictEqual(_.median([1, 2, 3]), 2, "Median of the numbers in the collection");
    assert.strictEqual(_.median([1, 2, 3, 4]), 2.5, "Median of the numbers in the collection");
    assert.strictEqual(_.median({}), undefined, 'Median value of an empty object');
    assert.strictEqual(_.median([]), undefined, 'Median value of an empty array');
  });

  QUnit.test('sum', function(assert) {
    assert.strictEqual(_.sum(null), 0, 'can handle null/undefined');
    assert.strictEqual(_.sum(void 0), 0, 'can handle undefined');
    assert.strictEqual(_.sum([1, 2, 3]), 6, "SUM of the numbers in the collection");
    assert.strictEqual(_.sum([1, 2, 3, 4]), 10, "SUM of the numbers in the collection");
    assert.strictEqual(_.sum({}), 0, 'sum value of an empty object');
    assert.strictEqual(_.sum([]), 0, 'sum value of an empty array');
  });

  QUnit.test('variance', function(assert) {
    assert.strictEqual(_.variance(null), 0, 'can handle null/undefined');
    assert.strictEqual(_.variance(void 0), 0, 'can handle undefined');
    assert.strictEqual(_.variance([0, 1, 2, 3, 4]), 2, "variance of the numbers in the collection");
    assert.strictEqual(_.variance([1, 2, 3, 4]), 1.25, "variance of the numbers in the collection");
    assert.strictEqual(_.variance({}), 0, 'variance value of an empty object');
    assert.strictEqual(_.variance([]), 0, 'variance value of an empty array');
  });

  QUnit.test('standardDeviation', function(assert) {
    assert.strictEqual(_.standardDeviation(null), 0, 'can handle null/undefined');
    assert.strictEqual(_.standardDeviation(void 0), 0, 'can handle undefined');
    assert.strictEqual(_.standardDeviation([0, 1, 2, 3, 4]), 1.4142135623730951, "Standard Deviation of the numbers in the collection");
    assert.strictEqual(_.standardDeviation([1, 2, 3, 4]), 1.118033988749895, "Standard Deviation of the numbers in the collection");
    assert.strictEqual(_.standardDeviation({}), 0, 'Standard Deviation value of an empty object');
    assert.strictEqual(_.standardDeviation([]), 0, 'Standard Deviation value of an empty array');
  });

  QUnit.test('standardError', function(assert) {
    assert.strictEqual(_.standardError(null), 0, 'can handle null/undefined');
    assert.strictEqual(_.standardError(void 0), 0, 'can handle undefined');
    assert.strictEqual(_.standardError([0, 1, 2, 3, 4]), 0.7071067811865476, "Standard Error of the numbers in the collection");
    assert.strictEqual(_.standardError([1, 2, 3, 4]), 0.6454972243679028, "Standard Error of the numbers in the collection");
    assert.strictEqual(_.standardError({}), 0, 'Standard Error value of an empty object');
    assert.strictEqual(_.standardError([]), 0, 'Standard Error value of an empty array');
  });

  QUnit.test('mode', function(assert) {
    assert.strictEqual(_.mode(null), undefined, 'can handle null/undefined');
    assert.strictEqual(_.mode(void 0), undefined, 'can handle undefined');
    assert.strictEqual(_.mode([0, 1, 2, 3, 4]), 0, "Mode of the numbers in the collection");
    assert.strictEqual(_.mode([1, 1, 3, 4]), 1, "Mode of the numbers in the collection");
    assert.strictEqual(_.mode({}), undefined, 'Mode value of an empty object');
    assert.strictEqual(_.mode([]), undefined, 'Mode value of an empty array');
  });

  QUnit.test('statRange', function(assert) {
    assert.strictEqual(_.statRange(null), -Infinity, 'can handle null/undefined');
    assert.strictEqual(_.statRange(void 0), -Infinity, 'can handle undefined');
    assert.strictEqual(_.statRange([0, 1, 2, 3, 4]), 4, "Stat Range of the numbers in the collection");
    assert.strictEqual(_.statRange([1, 1, 3, 4]), 3, "Stat Range of the numbers in the collection");
    assert.strictEqual(_.statRange({}), -Infinity, 'Stat Range value of an empty object');
    assert.strictEqual(_.statRange([]), -Infinity, 'Stat Range value of an empty array');
  });
  
  QUnit.test('percentile', function(assert) {
    assert.strictEqual(_.percentile(null, 25), 0, 'can handle null/undefined');
    assert.strictEqual(_.percentile(void 0, 50), 0, 'can handle undefined');
    assert.strictEqual(_.percentile([0, 1, 2, 3, 4], 75), 3, "75th percentile of the numbers in the collection");
    assert.strictEqual(_.percentile([1, 1, 3, 4], 50), 2, "50th of the numbers in the collection");
    assert.strictEqual(_.percentile({}, 10), 0, 'Percentile value of an empty object');
    assert.strictEqual(_.percentile([], 50), 0, 'Percentile value of an empty array');
    assert.raises(function() {
      _.percentile([1, 1, 3, 4], "50")
    }, TypeError, 'Percentile must be a number between 0 - 100');
 });
}());