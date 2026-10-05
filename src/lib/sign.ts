// HMAC-SHA1 for Thumbor URL signatures.
// Own implementation instead of node:crypto (not available in browsers)
// or WebCrypto (async only). Verified against node:crypto in tests.

const BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function utf8(str: string) {
  const out: number[] = []
  for (let i = 0; i < str.length; i++) {
    let c = str.codePointAt(i)!
    if (c > 0xffff) i++
    else if (c >= 0xd800 && c <= 0xdfff) c = 0xfffd // lone surrogate, same as TextEncoder
    if (c < 0x80) {
      out.push(c)
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 63))
    } else if (c < 0x10000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63))
    } else {
      out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63))
    }
  }
  return out
}

function sha1(bytes: number[]) {
  const ml = bytes.length
  const msg = bytes.concat(0x80)
  while (msg.length % 64 !== 56) msg.push(0)
  // message length in bits, big-endian 64-bit
  const bits = ml * 8
  msg.push(0, 0, 0, Math.floor(bits / 2 ** 32) & 0xff, (bits >>> 24) & 0xff, (bits >>> 16) & 0xff, (bits >>> 8) & 0xff, bits & 0xff)

  let h0 = 0x67452301
  let h1 = 0xefcdab89
  let h2 = 0x98badcfe
  let h3 = 0x10325476
  let h4 = 0xc3d2e1f0
  const w = new Array<number>(80)

  for (let off = 0; off < msg.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4
      w[i] = (msg[j] << 24) | (msg[j + 1] << 16) | (msg[j + 2] << 8) | msg[j + 3]
    }
    for (let i = 16; i < 80; i++) {
      const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]
      w[i] = (x << 1) | (x >>> 31)
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4
    for (let i = 0; i < 80; i++) {
      let f: number, k: number
      if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999 }
      else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1 }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc }
      else { f = b ^ c ^ d; k = 0xca62c1d6 }
      const t = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) | 0
      e = d
      d = c
      c = (b << 30) | (b >>> 2)
      b = a
      a = t
    }
    h0 = (h0 + a) | 0
    h1 = (h1 + b) | 0
    h2 = (h2 + c) | 0
    h3 = (h3 + d) | 0
    h4 = (h4 + e) | 0
  }

  const out: number[] = []
  for (const h of [h0, h1, h2, h3, h4]) {
    out.push((h >>> 24) & 0xff, (h >>> 16) & 0xff, (h >>> 8) & 0xff, h & 0xff)
  }
  return out
}

function hmacSha1(key: number[], data: number[]) {
  if (key.length > 64) key = sha1(key)
  const ipad: number[] = []
  const opad: number[] = []
  for (let i = 0; i < 64; i++) {
    const k = key[i] ?? 0
    ipad.push(k ^ 0x36)
    opad.push(k ^ 0x5c)
  }
  return sha1(opad.concat(sha1(ipad.concat(data))))
}

/**
 * URL-safe base64 with padding, same as Python's base64.urlsafe_b64encode
 * which Thumbor uses for signatures.
 */
function base64url(bytes: number[]) {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    out += BASE64URL[a >> 2]
    out += BASE64URL[((a & 3) << 4) | ((b ?? 0) >> 4)]
    out += b === undefined ? '=' : BASE64URL[((b & 15) << 2) | ((c ?? 0) >> 6)]
    out += c === undefined ? '=' : BASE64URL[c & 63]
  }
  return out
}

/**
 * Signs a Thumbor path (everything after the signature segment).
 */
export function sign(key: string, path: string) {
  return base64url(hmacSha1(utf8(key), utf8(path)))
}
