import {
  __clearIntentLedgerForTests,
  commitIntent,
  createCrossLegIntent,
  prepareIntent,
  type FlattenAction,
  type IntentPhase,
} from "../../../src/core/intent-ledger";
import type { IntentStreamEvent } from "../types";

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
const JUP_LEG = {
  venue: "JUPITER" as const,
  side: "BUY" as const,
  sizeUsd: 50,
  symbol: "SOL",
};

let eventSeq = 0;

function pushEvent(
  events: IntentStreamEvent[],
  kind: IntentStreamEvent["kind"],
  phase: IntentPhase,
  intentId: string,
  message: string,
  opts?: { highlight?: boolean; venue?: IntentStreamEvent["venue"] },
): void {
  eventSeq += 1;
  events.push({
    id: `evt-${eventSeq}`,
    ts: Date.now(),
    kind,
    phase,
    intentId,
    message,
    highlight: opts?.highlight,
    venue: opts?.venue,
  });
}

export type IntentDemoScenario = "commit" | "ttl_abort" | "prepare_fail";

export async function runIntentDemoScenario(
  scenario: IntentDemoScenario,
): Promise<IntentStreamEvent[]> {
  __clearIntentLedgerForTests();
  const events: IntentStreamEvent[] = [];
  const intentId = `demo-${scenario}-${Date.now()}`;

  createCrossLegIntent({ id: intentId, legs: [HL_LEG, POLY_LEG], ttlMs: 30_000 });
  pushEvent(events, "CREATE", "PENDING", intentId, "Cross-leg intent created (HL + POLY)");

  if (scenario === "prepare_fail") {
    const flattenLog: FlattenAction[] = [];
    const result = await prepareIntent(intentId, {
      prepareLeg: async (leg, index) => {
        if (index === 1) return { legIndex: index, ok: false, reason: "POLY_SPREAD_BLOCK" };
        return { legIndex: index, ok: true, filledUsd: leg.sizeUsd };
      },
      flattenLeg: async (action) => {
        flattenLog.push(action);
        pushEvent(
          events,
          "FLATTEN",
          "ABORTED",
          intentId,
          `HL reduce-only flatten · ${action.sizeUsd} USD · ${action.reason}`,
          { highlight: true, venue: action.venue },
        );
        return { ok: true };
      },
    });
    pushEvent(
      events,
      "PREPARE",
      result.intent.phase,
      intentId,
      "Leg-1 PREPARED · Leg-2 BLOCKED (Polymarket spread guard)",
    );
    pushEvent(
      events,
      "ABORT",
      "ABORTED",
      intentId,
      `Safe abort · ${result.reason ?? "PREPARE_PARTIAL_FAILURE"}`,
      { highlight: true },
    );
    return events;
  }

  const prep = await prepareIntent(intentId);
  pushEvent(
    events,
    "PREPARE",
    prep.intent.phase,
    intentId,
    "Both legs PREPARED · entering 2PC window",
  );

  if (scenario === "ttl_abort") {
    const flattenLog: FlattenAction[] = [];
    const result = await commitIntent(intentId, {
      now: () => Date.now() + 31_000,
      flattenLeg: async (action) => {
        flattenLog.push(action);
        pushEvent(
          events,
          "FLATTEN",
          "ABORTED",
          intentId,
          `HL reduce-only flatten · ${action.sizeUsd} USD · TTL_EXPIRED`,
          { highlight: true, venue: action.venue },
        );
        return { ok: true };
      },
    });
    pushEvent(events, "TTL", "ABORTED", intentId, "PREPARE_TTL exceeded (30s)", {
      highlight: true,
    });
    pushEvent(
      events,
      "ABORT",
      result.intent.phase,
      intentId,
      "Safe abort · flatten simulated on prepared HL leg",
      { highlight: true },
    );
    return events;
  }

  const commit = await commitIntent(intentId);
  pushEvent(events, "COMMIT", commit.intent.phase, intentId, "2PC COMMITTED · delta neutral");
  return events;
}

export async function runJupiterBlockDemo(): Promise<IntentStreamEvent[]> {
  __clearIntentLedgerForTests();
  const events: IntentStreamEvent[] = [];
  const intentId = `demo-jup-block-${Date.now()}`;

  createCrossLegIntent({ id: intentId, legs: [HL_LEG, JUP_LEG] });
  pushEvent(events, "CREATE", "PENDING", intentId, "Solana ingress intent (HL + JUPITER)");

  const result = await prepareIntent(intentId, {
    prepareLeg: async (_leg, index) => {
      if (index === 1) return { legIndex: index, ok: false, reason: "JUPITER_2PC_SLIPPAGE_BLOCK" };
      return { legIndex: index, ok: true, filledUsd: 100 };
    },
    flattenLeg: async (action) => {
      pushEvent(
        events,
        "FLATTEN",
        "ABORTED",
        intentId,
        `HL reduce-only flatten · ${action.reason}`,
        { highlight: true, venue: "HL" },
      );
      return { ok: true };
    },
  });

  pushEvent(
    events,
    "ABORT",
    result.intent.phase,
    intentId,
    "Jupiter ingress guard blocked 2PC · slippage cap exceeded",
    { highlight: true },
  );
  return events;
}
