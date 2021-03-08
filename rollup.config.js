import { resolve } from 'path';
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

function resolveModule(id) {
  return resolve(__dirname, 'modules', id);
}

export default [
  // Monolithic ESM bundle for browsers and deno.
  {
    input: 'modules/index-all.js',
    treeshake: false,
    output: monolithConf({
      file: 'underscore-esm.js',
      format: 'esm',
    }),
  },
  // Monolithic UMD bundle for browsers, AMD and old Node.js.
  {
    input: 'modules/index-default.js',
    treeshake: false,
    output: monolithConf({
      file: 'underscore-umd.js',
      exports: 'default',
      format: 'umd',
      name: '_',
      amd: {
        id: 'underscore',
      },
      noConflict: true,
    }),
  },
  // Custom CJS build for new Node.js.
  {
    input: 'modules/index-default.js',
    treeshake: false,
    output: monolithConf({
      entryFileNames: 'underscore-node.cjs',
      chunkFileNames: 'underscore-node-[name].cjs',
      dir: '.',
      minifyInternalExports: false,
      exports: 'auto',
      format: 'cjs',
      manualChunks: function(path) {
        if (!path.match(/index(-default)?\.js$/)) return 'f';
      },
    }),
  },
  // Custom ESM build for new Node.js. Thin layer on top of CJS build.
  {
    input: 'modules/index-all.js',
    external: ['./index.js', './index-default.js'],
    output: monolithConf({
      file: 'underscore-node.mjs',
      format: 'esm',
      paths: {
        [resolveModule('index.js')]: './underscore-node-f.cjs',
        [resolveModule('index-default.js')]: './underscore-node.cjs',
      },
    }),
  },
  // AMD and CJS versions of the individual modules for development
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
