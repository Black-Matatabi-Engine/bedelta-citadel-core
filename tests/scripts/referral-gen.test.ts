import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildReferralHookInUrl,
  formatReferralCode,
  parseReferralCode,
  resolvePaymasterSlot,
} from "../../src/sdk/exomesh-agentic-wallet-guard";
import { mintReferralRecord, verifyReferralRecord } from "../../scripts/referral/referral-crypto";
import { parseReferralCli, runReferralGen } from "../../scripts/referral-gen";

describe("agentic referral", () => {
  it("formats and parses SV-REF codes", () => {
    const code = formatReferralCode(1_700_000_000_000, "abcdef0123456789");
    expect(code).toBe("SV-REF-1700000000000-abcdef0123456789");
    expect(parseReferralCode(code)).toEqual({ unixMs: 1_700_000_000_000, hash: "abcdef0123456789" });
    expect(parseReferralCode("nope")).toBeNull();
    expect(buildReferralHookInUrl(code)).toContain("ref=SV-REF-");
    expect(resolvePaymasterSlot("ff00")).toBe(7);
  });

  it("mints HMAC-signed records that verify", () => {
    const rec = mintReferralRecord("ZeroDev-Agent-01", 1_700_000_000_123, "deadbeef");
    expect(rec.code.startsWith("SV-REF-")).toBe(true);
    expect(verifyReferralRecord(rec)).toBe(true);
    expect(rec.zerodevPaymasterSlot).toBeGreaterThanOrEqual(0);
    expect(rec.zerodevPaymasterSlot).toBeLessThan(8);
  });

  it("parses CLI flags and persists JSON metrics", () => {
    const cli = parseReferralCli(["node", "x", "--agent", "ZeroDev-Agent-01", "--json"]);
    expect(cli.agentId).toBe("ZeroDev-Agent-01");
    expect(cli.json).toBe(true);
    const dir = mkdtempSync(join(tmpdir(), "sv-ref-"));
    const path = join(dir, "referral_metrics.json");
    const a = runReferralGen(["node", "x", "--agent", "ZeroDev-Agent-01"], path);
    const b = runReferralGen(["node", "x", "--agent", "ZeroDev-Agent-02", "--hook-in"], path);
    expect(a.totals.issued).toBe(1);
    expect(b.totals.issued).toBe(2);
    expect(b.totals.hookIns).toBe(1);
    expect(a.code).not.toBe(b.code);
  });
});
