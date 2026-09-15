import { describe, expect, it } from "vitest";
import {
  GATE_ACTION_FAIL_CLOSED_BLOCK,
  GATE_ACTION_PASS_GREENLIGHT,
} from "../../src/core/gate-telemetry-types";
import {
  formatOnchainDuneCsv,
  mapOnchainLogToDuneRow,
  type ParsedOnchainGateLog,
} from "../../scripts/_shared/onchain-dune-telemetry";

function sampleLog(overrides: Partial<ParsedOnchainGateLog> = {}): ParsedOnchainGateLog {
  return {
    chainId: 42161,
    network: "mainnet",
    blockNumber: 501_230_000n,
    transactionHash: "0xabc123",
    logIndex: 1,
    timestampMs: Date.parse("2026-09-10T12:00:00.000Z"),
    gasUsed: 120_000n,
    gasPriceWei: 100_000_000n,
    eventName: "IntentAttested",
    intentHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    agent: "0xdddddddddddddddddddddddddddddddddddddddd",
    action: GATE_ACTION_FAIL_CLOSED_BLOCK,
    shadowMarginUsd: 42_100_000_000n,
    ...overrides,
  };
}

describe("onchain-dune-telemetry", () => {
  it("maps IntentAttested shadow margin into simulated_loss_prevented_usd", () => {
    const row = mapOnchainLogToDuneRow(sampleLog());
    expect(row.status).toBe("FAIL_CLOSED");
    expect(row.simulated_loss_prevented_usd).toBe(42100);
    expect(row.venue).toBe("pendle");
  });

  it("maps RiskTripBlocked to soil resistance trip telemetry", () => {
    const row = mapOnchainLogToDuneRow(
      sampleLog({
        eventName: "RiskTripBlocked",
        reason: "HL_SPREAD_JITTER",
        action: undefined,
        shadowMarginUsd: undefined,
      }),
    );
    expect(row.intercept_type).toBe("SOIL_RESISTANCE_TRIP");
    expect(row.status).toBe("FAIL_CLOSED");
    expect(row.venue).toBe("hyperliquid");
  });

  it("formats on-chain CSV with schema comment header", () => {
    const allow = mapOnchainLogToDuneRow(sampleLog({ action: GATE_ACTION_PASS_GREENLIGHT }));
    const csv = formatOnchainDuneCsv([allow]);
    expect(csv.startsWith("# silvervine.exomesh.dune-telemetry.v1")).toBe(true);
    expect(csv).toContain("simulated_loss_prevented_usd,gas_saved_usd,status");
    expect(csv).toContain("ALLOW");
  });
});
