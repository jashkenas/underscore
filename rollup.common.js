import { readFileSync } from 'fs';
import { extend } from './underscore-esm.js';

var intro = readFileSync('modules/index.js', 'utf-8').split('\n').slice(3, 7).join('\n');

var outputBase = {
  strict: false,
  externalLiveBindings: false,
  freeze: false,
};

var sourcemapBase = {
  sourcemap: true,
  sourcemapExcludeSources: true,
};

export function outputConf(particular) {
  return extend(particular, outputBase);
}

export function sourcemapConf(particular) {
  return extend(particular, outputBase, sourcemapBase);
}

export function monolithConf(particular) {
  return extend(particular, outputBase, sourcemapBase, {intro});
}
