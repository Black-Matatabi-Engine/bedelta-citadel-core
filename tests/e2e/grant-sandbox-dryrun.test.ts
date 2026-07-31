import { describe, expect, it } from "vitest";
import { simulateTransactionIntent } from "../../src/index";
import type { SandboxDiagnosticReport } from "../../src/services/sandbox";
import { buildSystemState } from "../../src/core/state";

const PASSING_SOIL = {
  symbol: "BTC",
  hlSpot: 50_000,
  hlPerp: 50_010,
  dydxPerp: 50_005,
  depthUsd: 500_000,
};

const HEALTHY_STATE = buildSystemState({
  currentCri: 100,
  skipHardlockAssert: true,
});

const JUPITER_QUOTE = {
  inputMint: "So11111111111111111111111111111111111111112",
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  inAmount: "100000000",
  outAmount: "16198753",
  slippageBps: 10,
  priceImpactPct: "0.05",
};

interface GrantAuditLog {
  event: "GRANT_SANDBOX_DRY_RUN";
  step: number;
  venue: SandboxDiagnosticReport["venue"];
  zeroKeyDryRun: true;
  isAllowed: boolean;
  passedGates: SandboxDiagnosticReport["passedGates"];
  executionPath: string[];
  simulatedExecutionTimeMs: number;
  apiKeysRequired: false;
  timestamp: string;
}

function toAuditLog(
  step: number,
  report: SandboxDiagnosticReport,
): GrantAuditLog {
  return {
    event: "GRANT_SANDBOX_DRY_RUN",
    step,
    venue: report.venue,
    zeroKeyDryRun: report.zeroKeyDryRun,
    isAllowed: report.isAllowed,
    passedGates: report.passedGates,
    executionPath: report.executionPath,
    simulatedExecutionTimeMs: report.simulatedExecutionTimeMs,
    apiKeysRequired: false,
    timestamp: new Date().toISOString(),
  };
}

describe("grant sandbox dry-run e2e", () => {
  it("runs HL → Polymarket → Jupiter zero-key auditor sequence with structured audit logs", () => {
    const auditLogs: GrantAuditLog[] = [];

    const hlReport = simulateTransactionIntent(
      { venue: "HL", amountUsd: 50, symbol: "BTC", soil: PASSING_SOIL },
      HEALTHY_STATE,
    );
    auditLogs.push(toAuditLog(1, hlReport));

    const polyReport = simulateTransactionIntent(
      {
        venue: "POLYMARKET",
        amountUsd: 25,
        soil: PASSING_SOIL,
        tailHedge: { marketPrice: 0.06 },
      },
      HEALTHY_STATE,
    );
    auditLogs.push(toAuditLog(2, polyReport));

    const jupReport = simulateTransactionIntent(
      {
        venue: "JUPITER",
        amountUsd: 50,
        soil: PASSING_SOIL,
        jupiter: { quote: JUPITER_QUOTE },
      },
      HEALTHY_STATE,
    );
    auditLogs.push(toAuditLog(3, jupReport));

    for (const log of auditLogs) {
      expect(log.event).toBe("GRANT_SANDBOX_DRY_RUN");
      expect(log.zeroKeyDryRun).toBe(true);
      expect(log.apiKeysRequired).toBe(false);
      expect(log.isAllowed).toBe(true);
      expect(log.executionPath).toContain("mode:zero-key-dry-run");
      expect(log.executionPath.at(-1)).toBe("sandbox:complete");
      expect(log.passedGates.length).toBeGreaterThan(0);
      expect(() => JSON.parse(JSON.stringify(log))).not.toThrow();
    }

    expect(auditLogs.map((l) => l.venue)).toEqual([
      "HL",
      "POLYMARKET",
      "JUPITER",
    ]);
    expect(hlReport.passedGates.at(-1)).toBe("HL_DRY_RUN");
    expect(polyReport.passedGates.at(-1)).toBe("POLYMARKET_DRY_RUN");
    expect(jupReport.passedGates.at(-1)).toBe("JUPITER_DRY_RUN");
  });
});
