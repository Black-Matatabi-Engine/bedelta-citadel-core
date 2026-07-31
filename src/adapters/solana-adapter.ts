/**
 * Solana DEX adapter — Jupiter Aggregator · Phoenix CLOB · Raydium CLMM.
 * Santenmoku v0.8 · 1:3 Depth Matrix · Touchwood fault isolation · R20 failsafe.
 *
 * @see solana/guards.ts — slot latency + oracle gates
 * @see solana/depth-matrix.ts — 1:3 composite depth evaluation
 * @see solana/gates.ts — assertSolanaDexGates / executeSolanaDexIntent
 */

export * from "./solana/types";
export * from "./solana/guards";
export * from "./solana/depth-matrix";
export * from "./solana/gates";
