module.exports = {
  input: 'underscore-umd.js',
  treeshake: false,
  context: 'this',
  output: {
    file: 'underscore.js',
    format: 'umd',
    legacy: true,
    strict: false,
    name: '_',
    sourcemap: true,
    sourcemapExcludeSources: true,
    amd: {
      id: 'underscore',
    },
    exports: 'default',
    externalLiveBindings: false,
    freeze: false,
  },
};
