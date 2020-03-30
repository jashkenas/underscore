import { hasOwnProperty } from './_setup.js';

export default function has(obj, path) {
  return obj != null && hasOwnProperty.call(obj, path);
}
