var fs = require('fs');

module.exports = {
  input: 'modules/index-default.js',
  treeshake: false,
  output: {
    file: 'underscore.js',
    exports: 'default',
    intro: fs.readFileSync('modules/index.js', 'utf-8').split('\n').slice(0, 4).join('\n'),
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
