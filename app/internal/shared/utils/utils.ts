import crypto from "node:crypto";


export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);

  // timingSafeEqual throws if lengths differ, so guard it
  if (ba.length !== bb.length) return false;

  return crypto.timingSafeEqual(ba, bb);
}