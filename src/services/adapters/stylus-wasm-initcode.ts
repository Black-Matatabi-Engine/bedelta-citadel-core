/** Stylus wasm-file initcode — mirrors cargo-stylus `--wasm-file` (zeroed project hash, no wasm-opt). */
import { brotliCompressSync, constants } from "node:zlib";
import { readFileSync } from "node:fs";
import type { Hex } from "viem";

const EOF_NO_DICT = new Uint8Array([0xef, 0xf0, 0x00, 0x00]);
const PRELUDE_LENGTH = 43;
const PROJECT_HASH = new Uint8Array(32);

function readLeb128(buf: Uint8Array, offset: number): { value: number; next: number } {
  let result = 0;
  let shift = 0;
  let i = offset;
  while (i < buf.length) {
    const byte = buf[i++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return { value: result, next: i };
    shift += 7;
  }
  throw new Error("stylus-wasm: truncated LEB128");
}

function encodeLeb128(value: number): Uint8Array {
  const out: number[] = [];
  let v = value;
  do {
    let byte = v & 0x7f;
    v >>>= 7;
    if (v !== 0) byte |= 0x80;
    out.push(byte);
  } while (v !== 0);
  return Uint8Array.from(out);
}

/** Strip custom wasm sections (id 0) — matches stylus-tools strip_user_metadata. */
export function stripWasmCustomSections(input: Uint8Array): Uint8Array {
  if (input.length < 8) throw new Error("stylus-wasm: invalid wasm (too short)");
  const sections: Uint8Array[] = [];
  let pos = 8;
  while (pos < input.length) {
    const start = pos;
    const { value: sectionId, next: sizeStart } = readLeb128(input, pos);
    const { value: sectionSize, next: payloadStart } = readLeb128(input, sizeStart);
    const end = payloadStart + sectionSize;
    if (end > input.length) throw new Error("stylus-wasm: truncated section");
    if (sectionId !== 0) sections.push(input.slice(start, end));
    pos = end;
  }
  const out = new Uint8Array(8 + sections.reduce((n, s) => n + s.length, 0));
  out.set(input.subarray(0, 8), 0);
  let o = 8;
  for (const s of sections) { out.set(s, o); o += s.length; }
  return out;
}

function appendProjectHashSection(wasm: Uint8Array): Uint8Array {
  const name = new TextEncoder().encode("project_hash");
  const payload = new Uint8Array([
    ...encodeLeb128(name.length), ...name,
    ...encodeLeb128(PROJECT_HASH.length), ...PROJECT_HASH,
  ]);
  const section = new Uint8Array([0, ...encodeLeb128(payload.length), ...payload]);
  const out = new Uint8Array(wasm.length + section.length);
  out.set(wasm, 0);
  out.set(section, wasm.length);
  return out;
}

function compressWasm(wasm: Uint8Array): Uint8Array {
  return brotliCompressSync(wasm, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
}

function buildStylusContractCode(compressed: Uint8Array): Uint8Array {
  const code = new Uint8Array(EOF_NO_DICT.length + compressed.length);
  code.set(EOF_NO_DICT, 0);
  code.set(compressed, EOF_NO_DICT.length);
  return code;
}

/** EVM contract-creation initcode with Stylus prelude (stylus-tools prelude.rs). */
export function buildDeploymentCalldata(code: Uint8Array): Uint8Array {
  const lenBytes = new Uint8Array(32);
  let n = BigInt(code.length);
  for (let i = 31; i >= 0; i--) { lenBytes[i] = Number(n & 0xffn); n >>= 8n; }
  const deploy = new Uint8Array(PRELUDE_LENGTH + code.length);
  let o = 0;
  deploy[o++] = 0x7f;
  deploy.set(lenBytes, o); o += 32;
  deploy[o++] = 0x80; deploy[o++] = 0x60; deploy[o++] = PRELUDE_LENGTH;
  deploy[o++] = 0x60; deploy[o++] = 0x00; deploy[o++] = 0x39;
  deploy[o++] = 0x60; deploy[o++] = 0x00; deploy[o++] = 0xf3;
  deploy[o++] = 0x00;
  deploy.set(code, o);
  return deploy;
}

export function wasmFileToInitcode(wasmBytes: Uint8Array): Hex {
  const stripped = stripWasmCustomSections(wasmBytes);
  const tagged = appendProjectHashSection(stripped);
  const compressed = compressWasm(tagged);
  const code = buildStylusContractCode(compressed);
  const initcode = buildDeploymentCalldata(code);
  return `0x${Buffer.from(initcode).toString("hex")}` as Hex;
}

export function loadWasmInitcode(wasmPath: string): Hex {
  return wasmFileToInitcode(readFileSync(wasmPath));
}
