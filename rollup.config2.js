import { resolve } from 'path';
import { monolithConf } from './rollup.common.js';

var sharedInput = './underscore-node-f-pre.js';
var sharedOutput = './underscore-node-f.cjs';

export default [
  // ESM entry point for Node.js 12+.
  {
    input: 'underscore-node-mjs-pre.js',
    external: sharedInput,
    output: monolithConf({
      file: 'underscore-node.mjs',
      format: 'esm',
      paths: {
        [resolve(__dirname, sharedInput)]: sharedOutput,
      },
    }),
  },
  // CJS entry point for Node.js 12+, plus code shared with the ESM entry.
  {
    input: {
      'underscore-node-f': sharedInput,
      'underscore-node': 'underscore-node-cjs-pre.js',
    },
    preserveModules: true,
    output: monolithConf({
      entryFileNames: '[name].cjs',
      dir: '.',
      exports: 'auto',
      format: 'cjs',
    }),
  },
];
