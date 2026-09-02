/**
 * Vite 5 calls crypto.getRandomValues on the node:crypto default export.
 * That API exists on Node 18.17+/20+, but not on Node 16.
 * Patch before Vite boots so `npm run dev` works on older Node.
 */
const crypto = require('crypto');

function getRandomValues(typedArray) {
  if (crypto.webcrypto?.getRandomValues) {
    return crypto.webcrypto.getRandomValues(typedArray);
  }
  const bytes = crypto.randomBytes(typedArray.byteLength);
  typedArray.set(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  );
  return typedArray;
}

if (typeof crypto.getRandomValues !== 'function') {
  crypto.getRandomValues = getRandomValues;
}

if (
  typeof globalThis.crypto === 'undefined' ||
  typeof globalThis.crypto.getRandomValues !== 'function'
) {
  globalThis.crypto = crypto.webcrypto || { getRandomValues };
}
