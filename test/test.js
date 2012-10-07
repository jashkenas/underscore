define('test', function(require) {
  ['collections', 'arrays', 'functions', 'objects',
        'utility', 'chaining', 'speed'].map(function(reqId) {
    return require(reqId);
  }).forEach(function(test) {
    test();
  });
});
