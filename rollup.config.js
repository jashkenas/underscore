module.exports = {
  input: 'underscore-umd.js',
  treeshake: false,
  context: 'this',
  output: {
    file: 'underscore.js',
    exports: 'default',
    format: 'umd',
    name: '_',
    amd: {
      id: 'underscore',
    },
    noConflict: true,
    sourcemap: true,
    sourcemapExcludeSources: true,
    legacy: true,
    strict: false,
    externalLiveBindings: false,
    freeze: false,
  },
};
