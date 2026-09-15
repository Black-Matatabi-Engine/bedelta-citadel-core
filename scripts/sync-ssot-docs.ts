#!/usr/bin/env tsx
/** Propagate docs/audit/SYSTEM_METRICS_SSOT.json → public markdown files. */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSystemMetricsSsot, syncMarkdownFile } from "./_shared/sync-ssot-docs-lib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TARGETS = [
  "README.md",
  "JUDGE_BRIEF.md",
  "docs/internal/0915_1000_Grok_zh.md",
  "docs/audit/0915_1000_Grok_zh.md",
];

function main(): void {
  const ssot = loadSystemMetricsSsot(ROOT);
  const synced: string[] = [];
  for (const target of TARGETS) {
    const fullPath = join(ROOT, target);
    if (!existsSync(fullPath)) continue;
    syncMarkdownFile(ROOT, target, ssot);
    synced.push(target);
  }
  console.error(
    `[sync:docs] generatedAt=${ssot.generatedAt} vitest=${ssot.badges.vitest.total_tests_passed}/${ssot.badges.vitest.test_files_passed} sepsb_tpr=${ssot.sepsb_benchmark.truePositiveRatePct}% files=${synced.join(", ")}`,
  );
}

main();
