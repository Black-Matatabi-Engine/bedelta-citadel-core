/**
 * SPDX-License-Identifier: Apache-2.0
 * Zero-dependency calldata parser — u32 bitwise selector dispatch (no string split hot path).
 */

/** ERC20 / router selectors as u32 big-endian fingerprints. */
export const SEL_ERC20_APPROVE = 0x095ea7b3;
export const SEL_ERC20_TRANSFER = 0xa9059cbb;
export const SEL_UNISWAP_V2_SWAP_EXACT = 0x38ed1739;
export const SEL_UNISWAP_V2_SWAP_ETH = 0x7ff36ab5;
export const SEL_UNISWAP_V3_EXACT_INPUT_SINGLE = 0x414bf389;
export const SEL_GMX_MULTICALL = 0xac9650d8;

/** Hex string mirrors for tests / logging only — not used in hot-path compare. */
export const SELECTOR_ERC20_APPROVE = "0x095ea7b3";
export const SELECTOR_ERC20_TRANSFER = "0xa9059cbb";
export const SELECTOR_UNISWAP_V2_SWAP_EXACT = "0x38ed1739";
export const SELECTOR_UNISWAP_V3_EXACT_INPUT_SINGLE = "0x414bf389";
export const SELECTOR_GMX_MULTICALL = "0xac9650d8";

export const UINT256_MAX =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

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

export interface ParsedUnknown {
  kind: "unknown";
  to: string;
  selectorU32: number;
}

export type ParsedCalldata = ParsedApprove | ParsedTransfer | ParsedSwap | ParsedUnknown;

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
  return amountWei === UINT256_MAX;
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
