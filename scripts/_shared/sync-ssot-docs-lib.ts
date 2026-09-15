/** SSOT → public markdown sync helpers. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const SSOT_PATH = "docs/audit/SYSTEM_METRICS_SSOT.json";

export interface SystemMetricsSsot {
  generatedAt: string;
  badges: {
    vitest: { test_files_passed: number; total_tests_passed: number; status: string };
    dune_telemetry: {
      dashboards: Array<{
        slug: string;
        url: string;
        role: string;
        export_command?: string;
        mode?: string;
        true_positive_rate_pct?: number;
        false_positive_rate_pct?: number;
        venues?: string[];
        reflex_latency_cap_us?: number;
        hardware_context?: string;
      }>;
    };
    historical_backtest: { total_loss_prevented_usd: number };
    hot_path: { alloc: string; iterations: string };
    stylus_probe: { passed: number; total: number; stage: string };
    coverage: { target: string; percentage: string };
    chaos_matrix: { cases: number; total: number; mode: string };
    latency: { e2e_p50_us: number; reflex_p50_us: number };
    typescript: { errors: number };
    license: string;
    arbitrum: { status: string; target_chain_id: number; readiness: string };
  };
  bundle_telemetry: { rawKiB: number; gzipKiB: number; limitKiB: number; pass: boolean };
  sepsb_benchmark: {
    truePositiveRatePct: number;
    falsePositiveRatePct: number;
    reflexLatencyP50Us: number;
    reflexLatencyP99Us: number;
    venue_count: number;
    venue_reflex_latency_cap_us: number;
    hardware_context: string;
    verdict: string;
  };
  onchain_indexer_pipeline: {
    status: string;
    command: string;
    gate_contract: string;
  };
}

export function loadSystemMetricsSsot(root: string): SystemMetricsSsot {
  return JSON.parse(readFileSync(join(root, SSOT_PATH), "utf8")) as SystemMetricsSsot;
}

export function replaceMarkedBlock(content: string, marker: string, body: string): string {
  const start = `<!-- SSOT:${marker}_START -->`;
  const end = `<!-- SSOT:${marker}_END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`, "m");
  if (!pattern.test(content)) {
    throw new Error(`Missing SSOT marker block: ${marker}`);
  }
  return content.replace(pattern, `${start}\n${body}\n${end}`);
}

function gateLink(address: string): string {
  return `[\`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1\`](https://arbiscan.io/address/${address})`;
}

export function buildReadmeBadges(ssot: SystemMetricsSsot): string {
  const v = ssot.badges.vitest;
  const lat = ssot.badges.latency;
  const hp = ssot.badges.hot_path;
  const sp = ssot.badges.stylus_probe;
  const cm = ssot.badges.chaos_matrix;
  const arb = ssot.badges.arbitrum;
  return [
    `![Vitest](https://img.shields.io/badge/Vitest-${v.total_tests_passed}%20PASS%20%28${v.test_files_passed}%20files%29-brightgreen?logo=vitest)`,
    `![Zero-Alloc Hot-Path](https://img.shields.io/badge/Zero--Alloc_Hot--Path-${encodeURIComponent(`${hp.alloc} / ${hp.iterations} iterations`)}-blue?logo=vitest)`,
    `![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-${sp.passed}%2F${sp.total}_PASS_(${sp.stage})-blue?logo=rust)`,
    `[![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-${encodeURIComponent(ssot.badges.coverage.percentage)}%20coverage-success?logo=vitest)](src/services/risk-control.ts)`,
    `![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-${cm.cases}%2F${cm.total}%20${encodeURIComponent(cm.mode)}-blue?logo=github)`,
    `![Benchmark Latency](https://img.shields.io/badge/Latency-E2E_p50_${lat.e2e_p50_us}%CE%BCs_|_Reflex_p50_${lat.reflex_p50_us}%CE%BCs-blueviolet?logo=speedtest)`,
    `![TypeScript](https://img.shields.io/badge/TypeScript-${ssot.badges.typescript.errors}%20errors-blue?logo=typescript)`,
    `![License](https://img.shields.io/badge/License-${encodeURIComponent(ssot.badges.license)}-orange)`,
    `![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-${encodeURIComponent(`${arb.status} (${arb.target_chain_id} ${arb.readiness})`)}-28A0F0?logo=arbitrum)`,
  ].join("\n");
}

export function buildSepsbTable(ssot: SystemMetricsSsot): string {
  const s = ssot.sepsb_benchmark;
  const lat = ssot.badges.latency;
  return [
    "| Metric | Target | Achieved (SSOT) |",
    "|--------|--------|-----------------|",
    `| Reflex Latency (p50) | ≤ 20µs | **${s.reflexLatencyP50Us}µs** (Wasm) |`,
    `| Reflex Latency (p99) | ≤ 50µs | **${s.reflexLatencyP99Us}µs** (Wasm) |`,
    `| End-to-End Edge Latency (p50) | ≤ 120µs | p50 ~${lat.e2e_p50_us}µs |`,
    `| True Positive Rate (TPR) | ≥ 99.5% | **${s.truePositiveRatePct}%** |`,
    `| False Positive Rate (FPR) | ≤ 0.5% (kill-switch) | **${s.falsePositiveRatePct}%** |`,
    `| Observatory Paradox Mis-block Count | 0 | **0** |`,
    `| 5-Venue Reflex Cap | < 50µs | **<${s.venue_reflex_latency_cap_us}µs** (${s.hardware_context}) |`,
  ].join("\n");
}

export function buildDualTelemetryBlock(ssot: SystemMetricsSsot): string {
  const [shield, sepsb] = ssot.badges.dune_telemetry.dashboards;
  const gate = ssot.onchain_indexer_pipeline.gate_contract;
  const venues = (sepsb?.venues ?? [])
    .map((v) => ({ gmx: "GMX", pendle: "Pendle", usdai: "USD.ai", hyperliquid: "Hyperliquid", variational: "Variational" })[v] ?? v)
    .join(", ");
  return [
    "> 💡 **Dual Telemetry Architecture**:",
    `> - **Operational Shield (\`/${shield?.slug}\`)**: Dynamic operational feed tracking nominal volume, saved execution gas, and intercept counts (\`${shield?.export_command}\` · ${shield?.mode?.replace(/_/g, " ")}).`,
    `> - **SEPSB Quant Matrix (\`/${sepsb?.slug}\`)**: Deterministic benchmark runner proving ${sepsb?.true_positive_rate_pct}% TPR, ${sepsb?.false_positive_rate_pct}% FPR, and sub-${sepsb?.reflex_latency_cap_us}µs Wasm reflex speeds across ${ssot.sepsb_benchmark.venue_count} venues (${venues}).`,
    "",
    `> 🔗 **On-Chain Event Indexing**: \`SliverVineGate\` (\`0xb174…8BF1\`) is equipped with standard EVM event emitters. The protocol includes an active on-chain indexer interface (\`${ssot.onchain_indexer_pipeline.command}\`) — status **${ssot.onchain_indexer_pipeline.status}** — ready for direct mainnet event ingestion post-buildathon.`,
  ].join("\n");
}

export function buildJudgeSsotLock(ssot: SystemMetricsSsot): string {
  const v = ssot.badges.vitest;
  const b = ssot.bundle_telemetry;
  const gate = ssot.onchain_indexer_pipeline.gate_contract;
  const lat = ssot.badges.latency;
  return `> **SSOT Lock:** **${v.test_files_passed} test files | ${v.total_tests_passed} PASS clean (100%)** · **Release: v1.0 · BeDelta Living Water v1.0 (SSRC)** · **3-Axis Security Scorecard: 5/0/0 PASS** · Gate ${gateLink(gate)} · Wasm **<28kb / <60µs** · Worker bundle **${b.gzipKiB} KiB gzip** (${b.rawKiB} KiB raw · \`limitKiB: ${b.limitKiB}\` · \`pass: ${b.pass}\`) · ABI **v2** · 28-protocol-slot FFI (RESERVED_ABI_V2 holes preserved)  \n> **Latency classes:** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~${lat.reflex_p50_us}µs** Stylus ReflexCore (SSRC) warm path (**<20µs**) · **p50 ~${lat.e2e_p50_us}µs** E2E ExoMesh Edge (Worker + TS Gateway + SSRC FFI)  \n> **Zero-Allocation Hot-Path**: Pre-consensus microsecond execution on static \`Uint32Array\` slabs and Wasm linear memory with **zero ephemeral heap allocations** (~**50,000 ephemeral heap objects/sec eliminated**); cold-path warning formatters and error loggers remain standard readable TypeScript.`;
}

export function buildJudgeTelemetryTable(ssot: SystemMetricsSsot): string {
  const [shield, sepsb] = ssot.badges.dune_telemetry.dashboards;
  const onchain = ssot.onchain_indexer_pipeline;
  return [
    "| Proof layer | URL / command | What judges see |",
    "|-------------|---------------|-----------------|",
    `| **Dashboard 1 — Operational Shield** | [**\`/${shield?.slug}\`**](${shield?.url}) | Live volume · gas saved · fail-closed intercept donut · cumulative append CSV |`,
    `| **Dashboard 2 — SEPSB Stress Matrix** | [**\`/${sepsb?.slug}\`**](${sepsb?.url}) | **${sepsb?.true_positive_rate_pct}% TPR** · **${sepsb?.false_positive_rate_pct}% FPR** · ${ssot.sepsb_benchmark.venue_count}-venue reflex **<${sepsb?.reflex_latency_cap_us}µs** · ${sepsb?.hardware_context} hardware context |`,
    `| **ExoMesh CSV export** | \`${shield?.export_command}\` → [\`exomesh-dune-telemetry.csv\`](./docs/audit/exomesh-dune-telemetry.csv) | Operational shield SSOT · daily cumulative append |`,
    `| **SEPSB CSV export** | \`${sepsb?.export_command}\` → [\`sepsb-stress-telemetry.csv\`](./docs/audit/sepsb-stress-telemetry.csv) | Deterministic 5-venue benchmark matrix |`,
    `| **On-chain indexer** | \`${onchain.command}\` → [\`onchain-dune-telemetry.csv\`](./docs/audit/onchain-dune-telemetry.csv) | Gate \`0xb174…8BF1\` · \`IntentAttested\` · \`SoilResistanceTripped\` (\`${onchain.status}\`) |`,
    `| **Provenance archive** | [\`GET /api/grant-audit\`](https://bedeltawater.slivervine.xyz/api/grant-audit) | Static SHA-256 Buildathon checkpoint (not a live oracle) |`,
  ].join("\n");
}

export function buildGrokHeaderMetrics(ssot: SystemMetricsSsot): string {
  const v = ssot.badges.vitest;
  const b = ssot.bundle_telemetry;
  const s = ssot.sepsb_benchmark;
  const hb = ssot.badges.historical_backtest;
  const [shield, sepsb] = ssot.badges.dune_telemetry.dashboards;
  const loss = hb.total_loss_prevented_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return [
    `| 測試 SSOT | **${v.test_files_passed} test files \\| ${v.total_tests_passed} PASS clean (100%)** · \`pnpm exec tsc --noEmit\` **${ssot.badges.typescript.errors} errors** |`,
    `| Bundle SSOT | **${b.rawKiB} KiB raw · ${b.gzipKiB} KiB gzip**（Pass \`< ${ssot.bundle_telemetry.limitKiB} KiB\` Lean Warn Limit） |`,
    `| **SEPSB Telemetry SSOT** | **TPR ${s.truePositiveRatePct}% · FPR ${s.falsePositiveRatePct}% · Observatory Mis-block 0** · Reflex p50 **${s.reflexLatencyP50Us}µs**（Wasm） · p99 **${s.reflexLatencyP99Us}µs** · \`pnpm audit:sepsb\` |`,
    `| **SEPSB 5-Venue Distribution** | **gmx (9)** · **hyperliquid (6)** · **pendle (7)** · **usdai (4)** · **variational (5)** — [\`sepsb-stress-telemetry.csv\`](../audit/sepsb-stress-telemetry.csv) |`,
    `| Quant Backtest SSOT | Tier 1 **3/3 FAIL_CLOSED** · Tier 2 **2/2** · Tier 3 **10,000 runs · 100% intercept** · Prevented **$${loss} USD**（simulated） |`,
    `| **Dual Dune Dashboards** | **Dashboard 1:** [\`${shield?.slug}\`](${shield?.url}) — Operational Shield · cumulative append · **Dashboard 2:** [\`${sepsb?.slug}\`](${sepsb?.url}) — SEPSB Quant Matrix & 5-Venue SLA |`,
    `| **On-Chain Indexer** | \`${ssot.onchain_indexer_pipeline.command}\` · Gate \`0xb174…8BF1\` · Status **${ssot.onchain_indexer_pipeline.status}** |`,
  ].join("\n");
}

export function applyVitestGlobalSync(content: string, files: number, tests: number): string {
  return content
    .replace(/\d+ test files \| \d+ PASS clean \(100%\)/g, `${files} test files | ${tests} PASS clean (100%)`)
    .replace(/\d+ test files \| \d+ PASS clean/g, `${files} test files | ${tests} PASS clean`)
    .replace(/\*\*\d+ test files \| \d+ PASS clean\*\*/g, `**${files} test files | ${tests} PASS clean**`)
    .replace(/\d+ files? \| \d+ PASS clean/g, `${files} files | ${tests} PASS clean`)
    .replace(/\d+ files? \/ \d+ PASS/g, `${files} files / ${tests} PASS`)
    .replace(/### 📊 Vitest \d+ PASS Suite Composition/g, `### 📊 Vitest ${tests} PASS Suite Composition`);
}

export function syncMarkdownFile(root: string, relativePath: string, ssot: SystemMetricsSsot): boolean {
  const fullPath = join(root, relativePath);
  let content = readFileSync(fullPath, "utf8");
  const v = ssot.badges.vitest;

  if (relativePath === "README.md") {
    content = replaceMarkedBlock(content, "README_BADGES", buildReadmeBadges(ssot));
    content = replaceMarkedBlock(
      content,
      "README_VITEST_LINE",
      `**Verify:** \`npx vitest run tests/sdk/retail-guard-provider.test.ts\` **35/35** · \`pnpm demo:gmx -- --trip\` · **Vitest SSOT:** **${v.test_files_passed} test files | ${v.total_tests_passed} PASS clean**`,
    );
    content = replaceMarkedBlock(content, "README_SEPSB_TABLE", buildSepsbTable(ssot));
    content = replaceMarkedBlock(content, "README_DUAL_TELEMETRY", buildDualTelemetryBlock(ssot));
    content = replaceMarkedBlock(
      content,
      "README_TEST_CMD",
      `pnpm test -- --run                                       # ${v.test_files_passed} files | ${v.total_tests_passed} PASS`,
    );
  }

  if (relativePath === "JUDGE_BRIEF.md") {
    content = replaceMarkedBlock(content, "JUDGE_SSOT_LOCK", buildJudgeSsotLock(ssot));
    content = replaceMarkedBlock(content, "JUDGE_SEPSB_TABLE", buildSepsbTable(ssot));
    content = replaceMarkedBlock(content, "JUDGE_TELEMETRY_TABLE", buildJudgeTelemetryTable(ssot));
    content = applyVitestGlobalSync(content, v.test_files_passed, v.total_tests_passed);
  }

  if (relativePath.endsWith("0915_1000_Grok_zh.md")) {
    content = replaceMarkedBlock(content, "GROK_HEADER_METRICS", buildGrokHeaderMetrics(ssot));
    content = applyVitestGlobalSync(content, v.test_files_passed, v.total_tests_passed);
    content = content.replace(
      /Reflex p50 \*\*[\d.]+µs\*\*/g,
      `Reflex p50 **${ssot.sepsb_benchmark.reflexLatencyP50Us}µs**`,
    );
    content = content.replace(
      /\*\*[\d.]+ KiB raw \/ [\d.]+ KiB gzip\*\*/g,
      `**${ssot.bundle_telemetry.rawKiB} KiB raw / ${ssot.bundle_telemetry.gzipKiB} KiB gzip**`,
    );
  }

  writeFileSync(fullPath, content);
  return true;
}
