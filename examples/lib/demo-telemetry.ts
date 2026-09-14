/** CLI demo → Dune audit CSV bridge (local telemetry trail for judges). */
import { basename } from "node:path";
import { appendExomeshDuneTelemetryRow } from "../../scripts/_shared/exomesh-dune-telemetry-audit";
import type { DuneVenue } from "../../scripts/_shared/exomesh-dune-telemetry";

const GRAY = "\x1b[90m";
const R = "\x1b[0m";

const VENUE_BY_SCRIPT: ReadonlyArray<[RegExp, DuneVenue]> = [
  [/gmx-demo/, "gmx"],
  [/pendle-demo/, "pendle"],
  [/usdai-demo/, "usdai"],
  [/variational-demo/, "variational"],
  [/hyperliquid-demo/, "hyperliquid"],
  [/eip1193-provider-demo/, "gmx"],
  [/exomesh/, "gmx"],
  [/ingress-escort/, "gmx"],
  [/sanctuary-demo/, "pendle"],
  [/matrix-cross-venue/, "variational"],
  [/agent-interceptor/, "hyperliquid"],
  [/elizaos-agent/, "hyperliquid"],
  [/langchain-agent/, "hyperliquid"],
  [/virtuals-agent/, "hyperliquid"],
  [/wayfinder-agent/, "hyperliquid"],
  [/stabilizer-demo/, "usdai"],
];

export function resolveDemoVenue(argv: readonly string[] = process.argv): DuneVenue {
  const script = argv[1] ?? "";
  for (const [pattern, venue] of VENUE_BY_SCRIPT) {
    if (pattern.test(script)) return venue;
  }
  return "gmx";
}

export function resolveDemoScriptId(argv: readonly string[] = process.argv): string {
  const script = basename(argv[1] ?? "demo.ts", ".ts");
  return script.replace(/-demo$/, "") || "cli";
}

export function printDemoTelemetrySyncNote(): void {
  console.log(
    `\n${GRAY}[ExoMesh Telemetry] Intercept logged locally. Run 'pnpm export:dune' to sync with Dune dashboard schema.${R}`,
  );
}

export function recordDemoCliTelemetry(input: {
  nowMs: number;
  tripped: boolean;
  reason: string;
  reflexLatencyUs?: number;
  demoId?: string;
}): void {
  const demoId = input.demoId ?? resolveDemoScriptId();
  appendExomeshDuneTelemetryRow({
    timestampMs: input.nowMs,
    venue: resolveDemoVenue(),
    status: input.tripped ? "FAIL_CLOSED" : "ALLOW",
    reason: input.reason,
    reflexLatencyUs: input.reflexLatencyUs,
    source: `demo:${demoId}:${input.tripped ? "trip" : "allow"}`,
  });
  printDemoTelemetrySyncNote();
}
