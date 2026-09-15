/** Treasury ingress demo execution proof JSON — CI / judge audit trail. */
/// <reference types="node" />
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { DemoBenchmarkSnapshot } from "./demo-timing";

export const INGRESS_RUN_REL_PATH = "docs/logging/last_ingress_run.json";
export const INGRESS_RUN_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../docs/logging/last_ingress_run.json",
);

export type IngressRouteId = "A" | "B" | "C";

export interface IngressRouteJsonResult {
  route: IngressRouteId;
  status: string;
  latencyUs?: number;
  capitalLabel?: string;
  deployable?: boolean;
  inFlightUsd?: number;
  settledUsd?: number;
  lostUsd?: number;
  directionOk?: boolean;
  inboundBlocked?: boolean;
  reasons?: string[];
}

export interface IngressRunPayload {
  event: "SANCTUARY_TREASURY_INGRESS_DEMO";
  timestamp: string;
  tripped: boolean;
  tripReason?: string;
  benchmark: {
    pureInvariantUs: number;
    fullMatrixUs: number;
    e2eHarnessUs: number;
  };
  routes: IngressRouteJsonResult[];
}

export function buildIngressRunPayload(
  routes: IngressRouteJsonResult[],
  benchmark: DemoBenchmarkSnapshot,
  timestamp: string,
  tripped: boolean,
  tripReason?: string,
): IngressRunPayload {
  return {
    event: "SANCTUARY_TREASURY_INGRESS_DEMO",
    timestamp,
    tripped,
    tripReason,
    benchmark: {
      pureInvariantUs: benchmark.pureInvariantUs,
      fullMatrixUs: benchmark.fullMatrixUs,
      e2eHarnessUs: benchmark.e2eHarnessUs,
    },
    routes,
  };
}

export function saveIngressRunPayload(payload: IngressRunPayload): void {
  mkdirSync(dirname(INGRESS_RUN_PATH), { recursive: true });
  writeFileSync(INGRESS_RUN_PATH, `${JSON.stringify(payload, null, 2)}\n`);
}
