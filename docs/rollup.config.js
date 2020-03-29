module.exports = {
  input: '../modules/index-all.js',
  treeshake: false,
  context: 'this',
  output: {
    file: 'underscore.js',
    exports: 'named',
    format: 'esm',
    legacy: true,
    strict: false,
    externalLiveBindings: false,
    freeze: false,
  },
};
