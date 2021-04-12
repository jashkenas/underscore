import glob from 'glob';
import { filter } from './underscore-esm.js';
import { outputConf, sourcemapConf, monolithConf } from './rollup.common.js';

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
  // Custom builds for Node.js, first pass. Second pass in rollup.config2.js.
  {
    input: {
      'underscore-node-cjs-pre': 'modules/index-default.js',
      'underscore-node-mjs-pre': 'modules/index-all.js',
    },
    treeshake: false,
    output: sourcemapConf({
      chunkFileNames: 'underscore-node-f-pre.js',
      dir: '.',
      minifyInternalExports: false,
      format: 'esm',
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
