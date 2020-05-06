import createSizePropertyCheck from './_createSizePropertyCheck.js';
import getByteLength from './_getByteLength.js';

// Helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
export default createSizePropertyCheck(getByteLength);
