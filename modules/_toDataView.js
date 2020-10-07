import getByteLength from './_getByteLength.js';

// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new DataView, reusing the buffer.
export default function toDataView(bufferSource) {
  return new DataView(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    getByteLength(bufferSource)
  );
}
