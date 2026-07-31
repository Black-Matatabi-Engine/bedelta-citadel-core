#!/usr/bin/env tsx
/**
 * HL Testnet 2PC verification — Prepare → Commit or TTL Abort audit log.
 *
 * Dry-run by default. Set HL_TESTNET_PRIVATE_KEY for live testnet exchange posts.
 *
 * Usage:
 *   pnpm grant:hl-testnet
 *   HL_TESTNET_PRIVATE_KEY=0x... HL_LIVE=1 pnpm grant:hl-testnet
 */

import { createHash } from "node:crypto";
import { Wallet } from "ethers";
import { createHlIntentBridge } from "../src/adapters/hl/hl-intent-bridge";
import {
  __clearIntentLedgerForTests,
  abortIntent,
  commitIntent,
  createCrossLegIntent,
  prepareIntent,
} from "../src/core/intent-ledger";
import { buildSystemState } from "../src/core/state";

const HL_LEG = {
  venue: "HL" as const,
  side: "SHORT" as const,
  sizeUsd: 100,
  symbol: "ETH",
};

const POLY_LEG = {
  venue: "POLYMARKET" as const,
  side: "BUY" as const,
  sizeUsd: 25,
  symbol: "ETH",
};

interface AuditStep {
  step: string;
  intentId: string;
  phase: string;
  ok: boolean;
  reason?: string;
  dryRun: boolean;
  responseRef?: string;
}

function responseRef(payload: unknown): string {
  const raw = JSON.stringify(payload);
  return `sha256:${createHash("sha256").update(raw).digest("hex").slice(0, 16)}`;
}

async function main(): Promise<void> {
  const privateKey =
    process.env.HL_TESTNET_PRIVATE_KEY ??
    "0x0000000000000000000000000000000000000000000000000000000000000001";
  const live = process.env.HL_LIVE === "1" || process.env.HL_LIVE === "true";
  const dryRun = !live;
  const runTtlDemo = process.env.HL_VERIFY_TTL !== "0";

  __clearIntentLedgerForTests();

  const bridge = createHlIntentBridge({
    signer: new Wallet(privateKey),
    dryRun,
    isTestnet: true,
    systemState: buildSystemState({
      accountBalanceUsd: 50_000,
      currentCri: 100,
      skipHardlockAssert: true,
    }),
  });

  const auditLog: AuditStep[] = [];
  const intentId = `hl-testnet-${Date.now()}`;

  createCrossLegIntent({
    id: intentId,
    legs: [HL_LEG, POLY_LEG],
    ttlMs: 30_000,
    now: Date.now(),
  });

  auditLog.push({
    step: "CREATE",
    intentId,
    phase: "PENDING",
    ok: true,
    dryRun,
  });

  const prepared = await prepareIntent(intentId, {
    prepareLeg: async (leg, index, intent) => {
      if (dryRun) {
        if (leg.sizeUsd <= 0) {
          return { legIndex: index, ok: false, reason: "INVALID_LEG_SIZE" };
        }
        return { legIndex: index, ok: true, filledUsd: leg.sizeUsd };
      }
      return bridge.prepareLeg(leg, index, intent);
    },
    flattenLeg: bridge.flattenLeg,
  });

  auditLog.push({
    step: "PREPARE",
    intentId,
    phase: prepared.intent.phase,
    ok: prepared.ok,
    reason: prepared.reason,
    dryRun,
    responseRef: responseRef({
      legResults: prepared.intent.legResults,
      flattenLog: bridge.hlFlattenLog,
    }),
  });

  if (runTtlDemo && prepared.ok) {
    const committed = await commitIntent(intentId, {
      commitLeg: bridge.commitLeg,
      flattenLeg: bridge.flattenLeg,
    });

    auditLog.push({
      step: "COMMIT",
      intentId,
      phase: committed.intent.phase,
      ok: committed.ok,
      reason: committed.reason,
      dryRun,
      responseRef: responseRef({
        flattenActions: committed.intent.flattenActions,
        flattenLog: bridge.hlFlattenLog,
      }),
    });
  }

  const abortId = `hl-testnet-abort-${Date.now()}`;
  createCrossLegIntent({ id: abortId, legs: [HL_LEG, POLY_LEG] });
  await prepareIntent(abortId, {
    prepareLeg: async (leg, index, intent) => {
      if (dryRun) {
        return { legIndex: index, ok: true, filledUsd: leg.sizeUsd };
      }
      return bridge.prepareLeg(leg, index, intent);
    },
    flattenLeg: bridge.flattenLeg,
  });
  const aborted = await abortIntent(abortId, "GRANT_VERIFY_OPERATOR_ABORT", {
    flattenLeg: bridge.flattenLeg,
  });

  auditLog.push({
    step: "ABORT",
    intentId: abortId,
    phase: aborted.intent.phase,
    ok: aborted.ok,
    reason: aborted.reason,
    dryRun,
    responseRef: responseRef({ flattenActions: aborted.intent.flattenActions }),
  });

  const report = {
    event: "HL_TESTNET_2PC_VERIFY",
    network: "hyperliquid-testnet",
    dryRun,
    liveHint: dryRun
      ? "Set HL_TESTNET_PRIVATE_KEY + HL_LIVE=1 for live exchange posts"
      : "Live mode — check Hyperliquid testnet explorer for wallet activity",
    auditLog,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(report, null, 2));

  const failed = auditLog.some(
    (s) => !s.ok && (s.step === "PREPARE" || s.step === "COMMIT"),
  );
  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[grant:hl-testnet] failed", err);
  process.exitCode = 1;
});
