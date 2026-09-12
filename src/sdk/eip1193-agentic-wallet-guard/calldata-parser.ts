/**
 * SPDX-License-Identifier: Apache-2.0
 * Zero-dependency calldata parser — u32 bitwise selector dispatch (no string split hot path).
 */
import {
  CALLDATA_SCRATCH,
  decodeHexCalldata,
  readAddressAt,
  readSelectorU32,
  readUint160At,
  readUint256At,
  readWordU32,
} from "./calldata-hex";
import { bindTransportStreamScratch } from "./transport-stream";
import {
  SEL_ERC20_APPROVE,
  SEL_ERC20_TRANSFER,
  SEL_ERC7540_REQUEST_DEPOSIT,
  SEL_ERC7540_REQUEST_REDEEM,
  SEL_ERC7540_SET_OPERATOR,
  SEL_GMX_MULTICALL,
  SEL_PERMIT2_APPROVE,
  SEL_PERMIT2_PERMIT,
  SEL_UNISWAP_V2_SWAP_ETH,
  SEL_UNISWAP_V2_SWAP_EXACT,
  SEL_UNISWAP_V3_EXACT_INPUT_SINGLE,
  UINT160_MAX,
  UINT256_MAX,
  type ParsedCalldata,
  type TxCalldataInput,
} from "./calldata-types";

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

  if (
    (sel === SEL_ERC7540_REQUEST_DEPOSIT || sel === SEL_ERC7540_REQUEST_REDEEM) &&
    byteLen >= 4 + 96
  ) {
    return {
      kind: sel === SEL_ERC7540_REQUEST_DEPOSIT ? "erc7540_request_deposit" : "erc7540_request_redeem",
      vault: to,
      amountWei: readUint256At(CALLDATA_SCRATCH, 4),
      controller: readAddressAt(CALLDATA_SCRATCH, 36).toLowerCase(),
      owner: readAddressAt(CALLDATA_SCRATCH, 68).toLowerCase(),
    };
  }

  if (sel === SEL_ERC7540_SET_OPERATOR && byteLen >= 4 + 64) {
    const approvedWord = readUint256At(CALLDATA_SCRATCH, 36);
    return {
      kind: "erc7540_set_operator",
      vault: to,
      operator: readAddressAt(CALLDATA_SCRATCH, 4).toLowerCase(),
      approved: approvedWord !== 0n,
    };
  }

  if (
    sel === SEL_UNISWAP_V2_SWAP_EXACT ||
    sel === SEL_UNISWAP_V2_SWAP_ETH ||
    sel === SEL_UNISWAP_V3_EXACT_INPUT_SINGLE ||
    sel === SEL_GMX_MULTICALL
  ) {
    return { kind: "swap", router: to, selectorU32: sel };
  }

  return { kind: "unknown", to, selectorU32: sel };
}

