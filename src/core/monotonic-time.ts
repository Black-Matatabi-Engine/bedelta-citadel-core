/**
 * @file monotonic-time.ts
 * @notice Proprietary Monotonic Clock SSOT & Saturating Arithmetic Engine
 * @dev Ultra-lean, zero-allocation typed-array backed memory layout for Stylus/Wasm parity.
 */

export const CLOCK_NEGATIVE_LEAP_DETECTED = "CLOCK_NEGATIVE_LEAP_DETECTED" as const;
export const CLOCK_EXCESSIVE_FORWARD_STEP = "CLOCK_EXCESSIVE_FORWARD_STEP" as const;

export type ClockAnomalyType = typeof CLOCK_NEGATIVE_LEAP_DETECTED | typeof CLOCK_EXCESSIVE_FORWARD_STEP;

export type WallClockAgeResult =
  | { readonly kind: "OK"; readonly ageMs: number }
  | { readonly kind: "LEAP"; readonly deltaMs: number };

const STATE_SLOT_LAST_WALL = 0;
const STATE_SLOT_OFFSET = 1;
const RPC_SLOT_BLOCK = 0;
const RPC_SLOT_TS_SEC = 1;

export class MonotonicTimeSSOT {
  private readonly memoryBuffer = new BigInt64Array(2);
  private stickyAnomaly: ClockAnomalyType | null = null;
  private readonly maxForwardStepMs: bigint;

  constructor(maxForwardStepMs = 1000) {
    this.maxForwardStepMs = BigInt(maxForwardStepMs);
  }

  /** Fast-path monotonic read with zero heap allocation. */
  read(currentWallMs: number): {
    readonly virtualWallMs: number;
    readonly anomaly: ClockAnomalyType | null;
  } {
    const raw = BigInt(Math.trunc(currentWallMs));
    const last = this.memoryBuffer[STATE_SLOT_LAST_WALL];
    const offset = this.memoryBuffer[STATE_SLOT_OFFSET];
    const candidate = raw + offset;

    if (last !== 0n && candidate < last) {
      this.memoryBuffer[STATE_SLOT_OFFSET] = offset + (last - candidate);
      this.stickyAnomaly = CLOCK_NEGATIVE_LEAP_DETECTED;
      return { virtualWallMs: Number(last), anomaly: this.stickyAnomaly };
    }

    if (last !== 0n && candidate - last > this.maxForwardStepMs) {
      const target = last + this.maxForwardStepMs;
      this.memoryBuffer[STATE_SLOT_OFFSET] = offset + (target - candidate);
      this.memoryBuffer[STATE_SLOT_LAST_WALL] = target;
      this.stickyAnomaly = CLOCK_EXCESSIVE_FORWARD_STEP;
      return { virtualWallMs: Number(target), anomaly: this.stickyAnomaly };
    }

    this.memoryBuffer[STATE_SLOT_LAST_WALL] = candidate;
    return { virtualWallMs: Number(candidate), anomaly: this.stickyAnomaly };
  }

  hasAnomaly(): boolean {
    return this.stickyAnomaly !== null;
  }

  reset(): void {
    this.memoryBuffer[STATE_SLOT_LAST_WALL] = 0n;
    this.memoryBuffer[STATE_SLOT_OFFSET] = 0n;
    this.stickyAnomaly = null;
  }

  /** Expose buffer for Wasm/Stylus ABI parity tests (i64 slots). */
  viewStateBuffer(): BigInt64Array {
    return this.memoryBuffer;
  }
}

/** RPC chain timestamp high-watermark — holds on block.timestamp regression. */
export class RpcTimestampWatermark {
  private readonly memoryBuffer = new BigInt64Array(2);

  ingest(blockNumber: bigint, timestampSec: bigint): {
    readonly ok: boolean;
    readonly regression: boolean;
    readonly heldTimestampSec: bigint;
  } {
    const lastBlock = this.memoryBuffer[RPC_SLOT_BLOCK];
    const lastTs = this.memoryBuffer[RPC_SLOT_TS_SEC];

    if (lastBlock !== 0n && blockNumber > lastBlock && timestampSec < lastTs) {
      return { ok: false, regression: true, heldTimestampSec: lastTs };
    }

    if (lastBlock === 0n || blockNumber >= lastBlock) {
      this.memoryBuffer[RPC_SLOT_BLOCK] = blockNumber;
      if (lastBlock === 0n || timestampSec >= lastTs) {
        this.memoryBuffer[RPC_SLOT_TS_SEC] = timestampSec;
      }
    }

    return {
      ok: true,
      regression: false,
      heldTimestampSec: this.memoryBuffer[RPC_SLOT_TS_SEC],
    };
  }

  reset(): void {
    this.memoryBuffer[RPC_SLOT_BLOCK] = 0n;
    this.memoryBuffer[RPC_SLOT_TS_SEC] = 0n;
  }

  viewStateBuffer(): BigInt64Array {
    return this.memoryBuffer;
  }
}

let globalMonotonicClock: MonotonicTimeSSOT | null = null;

export function getGlobalMonotonicClock(): MonotonicTimeSSOT {
  if (!globalMonotonicClock) globalMonotonicClock = new MonotonicTimeSSOT();
  return globalMonotonicClock;
}

export function __resetGlobalMonotonicClockForTests(): void {
  globalMonotonicClock?.reset();
  globalMonotonicClock = null;
}

/** Saturating subtraction avoiding Math.max for V8 JIT inline optimization. */
export function saturatingSub(a: number, b: number): number {
  return a > b ? a - b : 0;
}

/** Resolves wall clock age with negative leap detection (fail-closed on LEAP). */
export function resolveWallAge(nowMs: number, timestampMs: number): WallClockAgeResult {
  const delta = nowMs - timestampMs;
  return delta < 0 ? { kind: "LEAP", deltaMs: delta } : { kind: "OK", ageMs: delta };
}

/** Safe RPC block age in ms — LEAP yields 0 via saturatingSub after fail-closed gate upstream. */
export function computeRpcBlockAgeMs(nowMs: number, blockTimestampMs: number): number {
  const age = resolveWallAge(nowMs, blockTimestampMs);
  return age.kind === "OK" ? age.ageMs : 0;
}

/** Stylus/Wasm ABI pack: [virtualWallMs, offsetMs, anomalyFlags] as i64 bit pattern. */
export function packClockStateForWasm(clock: MonotonicTimeSSOT, wallMs: number): Float64Array {
  const sample = clock.read(wallMs);
  const out = new Float64Array(3);
  out[0] = sample.virtualWallMs;
  out[1] = Number(clock.viewStateBuffer()[STATE_SLOT_OFFSET]);
  out[2] = sample.anomaly === CLOCK_NEGATIVE_LEAP_DETECTED ? 1 : sample.anomaly === CLOCK_EXCESSIVE_FORWARD_STEP ? 2 : 0;
  return out;
}
