(function() {
  // Tests in this module only work in the node.js environment.
  if (typeof require !== 'function') return;

  var fixturePrefix = __dirname + '/../test-treeshake/';
  var moduleName = __dirname + '/../underscore.js';
  var fs = require('fs');

  QUnit.module('Tree-shaking');

  QUnit.test('should have an effect', function(assert) {
    var done = assert.async();
    var fixtureName = fixturePrefix + 'map-umd.js';
    fs.stat(moduleName, function(error, moduleStats) {
      assert.equal(error, null);
      if (error) return done();
      fs.stat(fixtureName, function(error, fixtureStats) {
        assert.equal(error, null);
        if (error) return done();
        // _.template depends on the entire underscore object, so all of the
        // source code should be included.
        assert.ok(fixtureStats.size < moduleStats.size);
        done();
      });
    });
  });

  QUnit.test('should not be overzealous', function(assert) {
    var done = assert.async();
    var fixtureName = fixturePrefix + 'template-umd.js';
    fs.readFile(moduleName, {encoding: 'utf8'}, function(error, moduleData) {
      assert.equal(error, null);
      if (error) return done();
      fs.readFile(fixtureName, {encoding: 'utf8'}, function(error, fixtureData) {
        assert.equal(error, null);
        if (error) return done();
        var moduleLines = moduleData.split('\n').length,
            fixtureLines = fixtureData.split('\n').length;
        // _.template depends on the entire underscore object, so all of the
        // source code should be included. Allowing for up to 9 lines of
        // difference; this is the size of the noConflict logic plus the
        // copyright intro, both of which are present in the official module but
        // not in the fixture.
        assert.ok(moduleLines - fixtureLines <= 9);
        done();
      });
    });
  });
}());
