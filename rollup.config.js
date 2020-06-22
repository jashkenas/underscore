import { readFileSync } from 'fs';
import _ from './underscore-esm.js';
import glob from 'glob';

var intro = readFileSync('modules/index.js', 'utf-8').split('\n').slice(3, 7).join('\n');

var outputBase = {
  strict: false,
  externalLiveBindings: false,
  freeze: false,
};

export default [
  // Monolithic ESM bundle for client use.
  {
    input: 'modules/index-all.js',
    treeshake: false,
    output: _.extend({
      file: 'underscore-esm.js',
      intro,
      format: 'esm',
      sourcemap: true,
      sourcemapExcludeSources: true,
    }, outputBase),
  },
  // Monolithic UMD bundle for client use.
  {
    input: 'modules/index-default.js',
    treeshake: false,
    output: _.extend({
      file: 'underscore.js',
      exports: 'default',
      intro,
      format: 'umd',
      name: '_',
      amd: {
        id: 'underscore',
      },
      noConflict: true,
      sourcemap: true,
      sourcemapExcludeSources: true,
    }, outputBase),
  },
  // AMD and CJS versions of the individual modules for development, server use
  // and custom bundles.
  {
    input: _.filter(
      glob.sync('modules/**/*.js'),
      function(path) { return path !== 'modules/index-all.js'; }
    ),
    preserveModules: true,
    output: [
      _.extend({
        dir: 'amd',
        format: 'amd',
      }, outputBase),
      _.extend({
        dir: 'cjs',
        format: 'cjs',
      }, outputBase),
    ],
  }
];
