/** Zero-dependency ERC20 / router calldata selector parser for retail guard. */

export const SELECTOR_ERC20_APPROVE = "0x095ea7b3";
export const SELECTOR_ERC20_TRANSFER = "0xa9059cbb";
export const SELECTOR_UNISWAP_V2_SWAP_EXACT = "0x38ed1739";
export const SELECTOR_UNISWAP_V2_SWAP_ETH = "0x7ff36ab5";
export const SELECTOR_UNISWAP_V3_EXACT_INPUT_SINGLE = "0x414bf389";
export const SELECTOR_GMX_MULTICALL = "0xac9650d8";

export const UINT256_MAX =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

export type ParsedCalldataKind = "approve" | "transfer" | "swap" | "unknown";

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
  selector: string;
}

export interface ParsedUnknown {
  kind: "unknown";
  to: string;
  selector: string;
}

export type ParsedCalldata = ParsedApprove | ParsedTransfer | ParsedSwap | ParsedUnknown;

export interface TxCalldataInput {
  to?: string;
  data?: string;
}

function normalizeHex(data: string): string {
  const raw = data.trim().toLowerCase();
  return raw.startsWith("0x") ? raw.slice(2) : raw;
}

function readAddress(hex: string, byteOffset: number): string {
  const start = byteOffset * 2;
  const word = hex.slice(start, start + 64);
  if (word.length < 40) return "";
  return `0x${word.slice(-40)}`;
}

function readUint256(hex: string, byteOffset: number): bigint {
  const start = byteOffset * 2;
  const word = hex.slice(start, start + 64);
  if (!word) return 0n;
  return BigInt(`0x${word || "0"}`);
}

export function parseSelector(data?: string): string {
  if (!data?.trim()) return "";
  const hex = normalizeHex(data);
  if (hex.length < 8) return "";
  return `0x${hex.slice(0, 8)}`;
}

export function isInfiniteApproval(amountWei: bigint): boolean {
  return amountWei === UINT256_MAX;
}

/** Parse `eth_sendTransaction` calldata into retail guard action classes. */
export function parseTransactionCalldata(tx: TxCalldataInput): ParsedCalldata | null {
  const to = tx.to?.trim().toLowerCase();
  if (!to) return null;
  const data = tx.data?.trim();
  if (!data) return { kind: "unknown", to, selector: "" };

  const hex = normalizeHex(data);
  const selector = `0x${hex.slice(0, 8)}`;

  if (selector === SELECTOR_ERC20_APPROVE && hex.length >= 8 + 64 * 2) {
    const spender = readAddress(hex, 4);
    const amountWei = readUint256(hex, 36);
    return {
      kind: "approve",
      token: to,
      spender: spender.toLowerCase(),
      amountWei,
      infinite: isInfiniteApproval(amountWei),
    };
  }

  if (selector === SELECTOR_ERC20_TRANSFER && hex.length >= 8 + 64 * 2) {
    const recipient = readAddress(hex, 4);
    const amountWei = readUint256(hex, 36);
    return {
      kind: "transfer",
      token: to,
      to: recipient.toLowerCase(),
      amountWei,
    };
  }

  if (
    selector === SELECTOR_UNISWAP_V2_SWAP_EXACT ||
    selector === SELECTOR_UNISWAP_V2_SWAP_ETH ||
    selector === SELECTOR_UNISWAP_V3_EXACT_INPUT_SINGLE ||
    selector === SELECTOR_GMX_MULTICALL
  ) {
    return { kind: "swap", router: to, selector };
  }

  return { kind: "unknown", to, selector };
}

export function encodeApproveCalldata(spender: string, amountWei: bigint): string {
  const spenderClean = spender.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  const amountHex = amountWei.toString(16).padStart(64, "0");
  return `${SELECTOR_ERC20_APPROVE}${spenderClean.slice(-64)}${amountHex}`;
}
