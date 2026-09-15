import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  buildReadmeBadges,
  buildSepsbTable,
  loadSystemMetricsSsot,
  replaceMarkedBlock,
  shieldsStaticBadge,
} from "../../scripts/_shared/sync-ssot-docs-lib";

const ROOT = process.cwd();

describe("sync-ssot-docs", () => {
  const ssot = loadSystemMetricsSsot(ROOT);

  it("loads SYSTEM_METRICS_SSOT.json", () => {
    expect(ssot.badges.vitest.total_tests_passed).toBeGreaterThan(0);
    expect(ssot.sepsb_benchmark.truePositiveRatePct).toBe(100);
  });

  it("replaces marked blocks without dropping markers", () => {
    const source = "<!-- SSOT:README_BADGES_START -->\nold\n<!-- SSOT:README_BADGES_END -->";
    const next = replaceMarkedBlock(source, "README_BADGES", "new-badge");
    expect(next).toContain("<!-- SSOT:README_BADGES_START -->");
    expect(next).toContain("new-badge");
  });

  it("builds README badges from vitest SSOT counts", () => {
    const badges = buildReadmeBadges(ssot);
    expect(badges).toContain(String(ssot.badges.vitest.total_tests_passed));
    expect(badges).toContain(String(ssot.badges.vitest.test_files_passed));
  });

  it("URL-encodes shield badge messages so markdown parentheses do not truncate links", () => {
    const url = shieldsStaticBadge("V2.0 Stylus Probe", "9/9 PASS (Roadmap)", "blue", "rust");
    expect(url).toContain("%28Roadmap%29");
    expect(url).not.toContain("(Roadmap)");
    const badges = buildReadmeBadges(ssot);
    expect(badges).toContain("%28");
    expect(badges).toContain("%29");
  });

  it("builds SEPSB table with reflex p50/p99 from SSOT", () => {
    const table = buildSepsbTable(ssot);
    expect(table).toContain(`${ssot.sepsb_benchmark.reflexLatencyP50Us}µs`);
    expect(table).toContain(`${ssot.sepsb_benchmark.reflexLatencyP99Us}µs`);
  });

  it("README contains SSOT marker blocks for sync", () => {
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    expect(readme).toContain("<!-- SSOT:README_BADGES_START -->");
    expect(readme).toContain("<!-- SSOT:README_SEPSB_TABLE_END -->");
  });
});
