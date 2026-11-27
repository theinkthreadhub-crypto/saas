/**
 * UUID v7 (RFC 9562): 48-bit Unix time in ms + random bits.
 * Time-ordered, so new rows sort after old rows and indexes stay fast.
 */

let lastMs = -1;
let lastSeq = 0;

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export function uuidv7(nowMs: number = Date.now()): string {
  const bytes = randomBytes(16);

  // Keep ids strictly increasing inside the same millisecond (12-bit counter in rand_a).
  if (nowMs === lastMs) {
    lastSeq = (lastSeq + 1) & 0x0fff;
    if (lastSeq === 0) nowMs = lastMs + 1;
  } else {
    lastSeq = (((bytes[6] ?? 0) & 0x0f) << 8) | (bytes[7] ?? 0);
    lastSeq &= 0x07ff; // leave head-room for increments
  }
  lastMs = nowMs;

  let ms = nowMs;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms % 256;
    ms = Math.floor(ms / 256);
  }
  bytes[6] = 0x70 | ((lastSeq >> 8) & 0x0f); // version 7
  bytes[7] = lastSeq & 0xff;
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f); // variant 10xx

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isUuidV7(value: string): boolean {
  return UUID_V7.test(value);
}

/** Read the creation time (ms) back out of a UUID v7. */
export function uuidv7Time(id: string): number {
  if (!isUuidV7(id)) throw new RangeError(`Not a UUID v7: ${id}`);
  return parseInt(id.replace(/-/g, "").slice(0, 12), 16);
}
