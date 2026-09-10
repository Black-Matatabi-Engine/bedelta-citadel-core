/**
 * SPDX-License-Identifier: Apache-2.0
 * Zero-dependency calldata parser — u32 bitwise selector dispatch (no string split hot path).
 */
import { bindTransportStreamScratch } from "./transport-stream";

/** ERC20 / router / Permit2 selectors as u32 big-endian fingerprints. */
export const SEL_ERC20_APPROVE = 0x095ea7b3;
export const SEL_ERC20_TRANSFER = 0xa9059cbb;
export const SEL_UNISWAP_V2_SWAP_EXACT = 0x38ed1739;
export const SEL_UNISWAP_V2_SWAP_ETH = 0x7ff36ab5;
export const SEL_UNISWAP_V3_EXACT_INPUT_SINGLE = 0x414bf389;
export const SEL_GMX_MULTICALL = 0xac9650d8;
/** Permit2 permit(address,PermitSingle,bytes) — EIP-7730-exposed router surface. */
export const SEL_PERMIT2_PERMIT = 0x2a0886f7;
/** Permit2 approve(address,address,uint160,uint48). */
export const SEL_PERMIT2_APPROVE = 0x87517c45;

/** Hex string mirrors for tests / logging only — not used in hot-path compare. */
export const SELECTOR_ERC20_APPROVE = "0x095ea7b3";
export const SELECTOR_ERC20_TRANSFER = "0xa9059cbb";
export const SELECTOR_UNISWAP_V2_SWAP_EXACT = "0x38ed1739";
export const SELECTOR_UNISWAP_V3_EXACT_INPUT_SINGLE = "0x414bf389";
export const SELECTOR_GMX_MULTICALL = "0xac9650d8";
export const SELECTOR_PERMIT2_PERMIT = "0x2a0886f7";
export const SELECTOR_PERMIT2_APPROVE = "0x87517c45";

export const UINT256_MAX =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
export const UINT160_MAX = (1n << 160n) - 1n;

export interface ParsedApprove {
  kind: "approve";
  token: string;
  spender: string;
  amountWei: bigint;
  infinite: boolean;
}

export interface ParsedTransfer {
  kind: "transfer";
  token: string;
  to: string;
  amountWei: bigint;
}

export interface ParsedSwap {
  kind: "swap";
  router: string;
  selectorU32: number;
}

export interface ParsedPermit2Approve {
  kind: "permit2_approve";
  permit2: string;
  token: string;
  spender: string;
  amountWei: bigint;
  infinite: boolean;
}

export interface ParsedPermit2Permit {
  kind: "permit2_permit";
  permit2: string;
  owner: string;
  token: string;
  spender: string;
  amountWei: bigint;
  infinite: boolean;
}

export interface ParsedUnknown {
  kind: "unknown";
  to: string;
  selectorU32: number;
}

export type ParsedCalldata =
  | ParsedApprove
  | ParsedTransfer
  | ParsedSwap
  | ParsedPermit2Approve
  | ParsedPermit2Permit
  | ParsedUnknown;

export interface TxCalldataInput {
  to?: string;
  data?: string;
}

/** Module-load reusable calldata byte scratch (max 1 KiB per tx). */
const CALLDATA_SCRATCH = new Uint8Array(1024);
const HEX_NIBBLE = new Uint8Array(256);

for (let i = 0; i < 10; i += 1) HEX_NIBBLE[48 + i] = i;
for (let i = 0; i < 6; i += 1) {
  HEX_NIBBLE[97 + i] = 10 + i;
  HEX_NIBBLE[65 + i] = 10 + i;
}

function decodeHexCalldata(data: string, out: Uint8Array): number {
  const raw = data.trim();
  let start = 0;
  if (raw.startsWith("0x") || raw.startsWith("0X")) start = 2;
  const hexLen = raw.length - start;
  const byteLen = hexLen >> 1;
  const limit = Math.min(byteLen, out.length);
  for (let i = 0; i < limit; i += 1) {
    const hi = HEX_NIBBLE[raw.charCodeAt(start + i * 2)] ?? 0;
    const lo = HEX_NIBBLE[raw.charCodeAt(start + i * 2 + 1)] ?? 0;
    out[i] = (hi << 4) | lo;
  }
  return limit;
}

/** Read 4-byte selector as u32 (big-endian) — O(1) bitwise. */
export function readSelectorU32(bytes: Uint8Array, byteLen: number): number {
  if (byteLen < 4) return 0;
  return (
    ((bytes[0]! & 0xff) << 24) |
    ((bytes[1]! & 0xff) << 16) |
    ((bytes[2]! & 0xff) << 8) |
    (bytes[3]! & 0xff)
  ) >>> 0;
}

function readAddressAt(bytes: Uint8Array, byteOffset: number): string {
  const start = byteOffset + 12;
  let hex = "0x";
  for (let i = 0; i < 20; i += 1) {
    hex += (bytes[start + i]! & 0xff).toString(16).padStart(2, "0");
  }
  return hex;
}

function readUint256At(bytes: Uint8Array, byteOffset: number): bigint {
  let v = 0n;
  for (let i = 0; i < 32; i += 1) v = (v << 8n) | BigInt(bytes[byteOffset + i]! & 0xff);
  return v;
}

export function parseSelector(data?: string): string {
  if (!data?.trim()) return "";
  const len = decodeHexCalldata(data, CALLDATA_SCRATCH);
  const sel = readSelectorU32(CALLDATA_SCRATCH, len);
  if (sel === 0) return "";
  return `0x${sel.toString(16).padStart(8, "0")}`;
}

export function isInfiniteApproval(amountWei: bigint): boolean {
  return amountWei === UINT256_MAX || amountWei === UINT160_MAX;
}

function readUint160At(bytes: Uint8Array, byteOffset: number): bigint {
  let v = 0n;
  for (let i = 12; i < 32; i += 1) v = (v << 8n) | BigInt(bytes[byteOffset + i]! & 0xff);
  return v;
}

function readWordU32(bytes: Uint8Array, byteOffset: number, byteLen: number): number {
  if (byteOffset + 32 > byteLen) return 0;
  return readUint256At(bytes, byteOffset) <= 0xffffn
    ? Number(readUint256At(bytes, byteOffset))
    : 0;
}

/** Decode Permit2 PermitSingle (static or ABI-offset layout) into scratch indices. */
function decodePermit2PermitSingle(
  bytes: Uint8Array,
  byteLen: number,
): { token: string; spender: string; amountWei: bigint } | null {
  if (byteLen < 4 + 96) return null;

  const head = readWordU32(bytes, 36, byteLen);
  let base = 36;
  if (head > 0 && head < byteLen - 4) base = 4 + head;

  if (base + 96 > byteLen) return null;
  const token = readAddressAt(bytes, base).toLowerCase();
  const amountWei = readUint160At(bytes, base + 32);
  const spender = readAddressAt(bytes, base + 64).toLowerCase();
  return { token, spender, amountWei };
}

function isSwapSelector(sel: number): boolean {
  return (
    sel === SEL_UNISWAP_V2_SWAP_EXACT ||
    sel === SEL_UNISWAP_V2_SWAP_ETH ||
    sel === SEL_UNISWAP_V3_EXACT_INPUT_SINGLE ||
    sel === SEL_GMX_MULTICALL
  );
}

/** Parse `eth_sendTransaction` calldata via bitwise selector + scratch buffer. */
export function parseTransactionCalldata(tx: TxCalldataInput): ParsedCalldata | null {
  const to = tx.to?.trim().toLowerCase();
  if (!to) return null;
  const data = tx.data?.trim();
  if (!data) return { kind: "unknown", to, selectorU32: 0 };

  const byteLen = decodeHexCalldata(data, CALLDATA_SCRATCH);
  bindTransportStreamScratch(CALLDATA_SCRATCH, byteLen);
  const sel = readSelectorU32(CALLDATA_SCRATCH, byteLen);

  if (sel === SEL_ERC20_APPROVE && byteLen >= 4 + 64) {
    const spender = readAddressAt(CALLDATA_SCRATCH, 4).toLowerCase();
    const amountWei = readUint256At(CALLDATA_SCRATCH, 36);
    return {
      kind: "approve",
      token: to,
      spender,
      amountWei,
      infinite: isInfiniteApproval(amountWei),
    };
  }

  if (sel === SEL_ERC20_TRANSFER && byteLen >= 4 + 64) {
    return {
      kind: "transfer",
      token: to,
      to: readAddressAt(CALLDATA_SCRATCH, 4).toLowerCase(),
      amountWei: readUint256At(CALLDATA_SCRATCH, 36),
    };
  }

  if (sel === SEL_PERMIT2_APPROVE && byteLen >= 4 + 128) {
    const token = readAddressAt(CALLDATA_SCRATCH, 4).toLowerCase();
    const spender = readAddressAt(CALLDATA_SCRATCH, 36).toLowerCase();
    const amountWei = readUint160At(CALLDATA_SCRATCH, 68);
    return {
      kind: "permit2_approve",
      permit2: to,
      token,
      spender,
      amountWei,
      infinite: isInfiniteApproval(amountWei),
    };
  }

  if (sel === SEL_PERMIT2_PERMIT) {
    const owner = readAddressAt(CALLDATA_SCRATCH, 4).toLowerCase();
    const single = decodePermit2PermitSingle(CALLDATA_SCRATCH, byteLen);
    if (single) {
      return {
        kind: "permit2_permit",
        permit2: to,
        owner,
        token: single.token,
        spender: single.spender,
        amountWei: single.amountWei,
        infinite: isInfiniteApproval(single.amountWei),
      };
    }
  }

  if (isSwapSelector(sel)) {
    return { kind: "swap", router: to, selectorU32: sel };
  }

  return { kind: "unknown", to, selectorU32: sel };
}

export function encodeApproveCalldata(spender: string, amountWei: bigint): string {
  const body = new Uint8Array(68);
  body[0] = 0x09;
  body[1] = 0x5e;
  body[2] = 0xa7;
  body[3] = 0xb3;
  const spenderHex = spender.toLowerCase().replace(/^0x/, "");
  for (let i = 0; i < 20; i += 1) {
    const byte = parseInt(spenderHex.slice(i * 2, i * 2 + 2) || "00", 16);
    body[16 + i] = byte;
  }
  let amt = amountWei;
  for (let i = 67; i >= 36; i -= 1) {
    body[i] = Number(amt & 0xffn);
    amt >>= 8n;
  }
  let hex = "0x";
  for (let i = 0; i < body.length; i += 1) hex += body[i]!.toString(16).padStart(2, "0");
  return hex;
}

/** Encode Permit2 approve(address,address,uint160,uint48) for harness / tests. */
export function encodePermit2ApproveCalldata(
  token: string,
  spender: string,
  amountWei: bigint,
  expiration = 0,
): string {
  const body = new Uint8Array(132);
  body[0] = 0x87;
  body[1] = 0x51;
  body[2] = 0x7c;
  body[3] = 0x45;
  const writeAddr = (hex: string, wordOff: number): void => {
    const raw = hex.toLowerCase().replace(/^0x/, "");
    const base = 4 + wordOff + 12;
    for (let i = 0; i < 20; i += 1) {
      body[base + i] = parseInt(raw.slice(i * 2, i * 2 + 2) || "00", 16);
    }
  };
  writeAddr(token, 0);
  writeAddr(spender, 32);
  let amt = amountWei;
  for (let i = 99; i >= 80; i -= 1) {
    body[i] = Number(amt & 0xffn);
    amt >>= 8n;
  }
  let exp = BigInt(expiration);
  for (let i = 131; i >= 116; i -= 1) {
    body[i] = Number(exp & 0xffn);
    exp >>= 8n;
  }
  let hex = "0x";
  for (let i = 0; i < body.length; i += 1) hex += body[i]!.toString(16).padStart(2, "0");
  return hex;
}

/** Encode inlined Permit2 permit(address,PermitSingle,bytes) skeleton for tests. */
export function encodePermit2PermitCalldata(
  owner: string,
  token: string,
  spender: string,
  amountWei: bigint,
): string {
  const body = new Uint8Array(260);
  body[0] = 0x2a;
  body[1] = 0x08;
  body[2] = 0x86;
  body[3] = 0xf7;
  const writeAddr = (hex: string, wordOff: number): void => {
    const raw = hex.toLowerCase().replace(/^0x/, "");
    const base = 4 + wordOff + 12;
    for (let i = 0; i < 20; i += 1) {
      body[base + i] = parseInt(raw.slice(i * 2, i * 2 + 2) || "00", 16);
    }
  };
  writeAddr(owner, 0);
  writeAddr(token, 32);
  let amt = amountWei;
  for (let i = 99; i >= 80; i -= 1) {
    body[i] = Number(amt & 0xffn);
    amt >>= 8n;
  }
  writeAddr(spender, 96);
  body[228] = 0xc0;
  let hex = "0x";
  for (let i = 0; i < body.length; i += 1) hex += body[i]!.toString(16).padStart(2, "0");
  return hex;
}
