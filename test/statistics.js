(function() {
    var _ = typeof require == 'function' ? require('..') : window._;
    QUnit.module('Statistics');
    QUnit.test('mean', function(assert) {

        assert.strictEqual(_.mean(null), 0, 'can handle null/undefined');
        assert.strictEqual(_.mean(void 0), -Infinity, 'can handle null/undefined');
        assert.strictEqual(_.mean([1, 2, 3]),2,"Avearge of the numbers in the collection");

        assert.strictEqual(_.mean({}), 0, 'Avearge value of an empty object');
        assert.strictEqual(_.mean([]), 0, 'Avearge value of an empty array');
    });
});