module.exports = {
  input: '../modules/index-all.js',
  treeshake: false,
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
