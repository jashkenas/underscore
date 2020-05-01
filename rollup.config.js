module.exports = {
  input: 'modules/index-default.js',
  treeshake: false,
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
