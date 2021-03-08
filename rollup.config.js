import { readFileSync } from 'fs';
import { extend, filter } from './underscore-esm.js';
import glob from 'glob';

var intro = readFileSync('modules/index.js', 'utf-8').split('\n').slice(3, 7).join('\n');

var outputBase = {
  strict: false,
  externalLiveBindings: false,
  freeze: false,
};

var monolithicBase = {
  intro,
  sourcemap: true,
  sourcemapExcludeSources: true,
};

function outputConf(particular) {
  return extend(particular, outputBase);
}

function monolithConf(particular) {
  return extend(particular, outputBase, monolithicBase);
}

export default [
  // Monolithic ESM bundle for client use.
  {
    input: 'modules/index-all.js',
    treeshake: false,
    output: monolithConf({
      file: 'underscore-esm.js',
      format: 'esm',
    }),
  },
  // Monolithic UMD bundle for client use.
  {
    input: 'modules/index-default.js',
    treeshake: false,
    output: monolithConf({
      file: 'underscore.js',
      exports: 'default',
      format: 'umd',
      name: '_',
      amd: {
        id: 'underscore',
      },
      noConflict: true,
    }),
  },
  // AMD and CJS versions of the individual modules for development, server use
  // and custom bundles.
  {
    input: filter(
      glob.sync('modules/**/*.js'),
      function(path) { return path !== 'modules/index-all.js'; }
    ),
    preserveModules: true,
    output: [
      outputConf({
        dir: 'amd',
        exports: 'auto',
        format: 'amd',
      }),
      outputConf({
        dir: 'cjs',
        exports: 'auto',
        format: 'cjs',
      }),
    ],
  }
];
