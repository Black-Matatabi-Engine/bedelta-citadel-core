/**
 * 2PC Intent Ledger — dual-leg prepare / commit / abort with safe flatten simulation.
 * Coordinates cross-venue execution without leaving naked delta on partial failure.
 */

export type IntentPhase = "PENDING" | "PREPARED" | "COMMITTED" | "ABORTED";

export type IntentLegSide = "BUY" | "SELL" | "SHORT" | "LONG";

export type IntentVenue = "HL" | "POLYMARKET" | "JUPITER" | "GMX";

export interface IntentLeg {
  venue: IntentVenue;
  side: IntentLegSide;
  sizeUsd: number;
  symbol?: string;
}

export interface IntentLegPrepareResult {
  legIndex: number;
  ok: boolean;
  reason?: string;
  /** Simulated fill price for flatten math */
  fillPrice?: number;
  filledUsd?: number;
}

export interface FlattenAction {
  venue: IntentVenue;
  side: IntentLegSide;
  sizeUsd: number;
  reduceOnly: true;
  reason: string;
}

export interface CrossLegIntent {
  id: string;
  legs: [IntentLeg, IntentLeg];
  phase: IntentPhase;
  ttlMs: number;
  createdAt: number;
  preparedAt?: number;
  committedAt?: number;
  abortedAt?: number;
  legResults: IntentLegPrepareResult[];
  flattenActions: FlattenAction[];
  abortReason?: string;
}

export interface PrepareLegFn {
  (leg: IntentLeg, legIndex: number, intent: CrossLegIntent): Promise<IntentLegPrepareResult>;
}

export interface CommitLegFn {
  (leg: IntentLeg, legIndex: number, intent: CrossLegIntent): Promise<{ ok: boolean; reason?: string }>;
}

export interface FlattenLegFn {
  (action: FlattenAction, intent: CrossLegIntent): Promise<{ ok: boolean; reason?: string }>;
}

export interface IntentLedgerOptions {
  now?: () => number;
  prepareLeg?: PrepareLegFn;
  commitLeg?: CommitLegFn;
  flattenLeg?: FlattenLegFn;
}

export interface IntentTransitionResult {
  intent: CrossLegIntent;
  ok: boolean;
  reason?: string;
}

const DEFAULT_TTL_MS = 30_000;

/** In-memory ledger store — replace with Durable Object / SQLite in Milestone 2 */
const ledgerStore = new Map<string, CrossLegIntent>();

function nowMs(options?: IntentLedgerOptions): number {
  return options?.now?.() ?? Date.now();
}

function cloneIntent(intent: CrossLegIntent): CrossLegIntent {
  return {
    ...intent,
    legs: [...intent.legs] as [IntentLeg, IntentLeg],
    legResults: [...intent.legResults],
    flattenActions: [...intent.flattenActions],
  };
}

function persist(intent: CrossLegIntent): CrossLegIntent {
  const copy = cloneIntent(intent);
  ledgerStore.set(copy.id, copy);
  return copy;
}

function isExpired(intent: CrossLegIntent, now: number): boolean {
  if (intent.phase !== "PREPARED" || intent.preparedAt === undefined) return false;
  return now - intent.preparedAt > intent.ttlMs;
}

/** Exported for persistence crash-recovery checks */
export function isPreparedIntentExpired(intent: CrossLegIntent, now: number): boolean {
  return isExpired(intent, now);
}

function oppositeSide(side: IntentLegSide): IntentLegSide {
  switch (side) {
    case "BUY":
      return "SELL";
    case "SELL":
      return "BUY";
    case "LONG":
      return "SHORT";
    case "SHORT":
      return "LONG";
  }
}

/** Default prepare — marks leg ready unless sizeUsd <= 0 */
export async function defaultPrepareLeg(
  leg: IntentLeg,
  legIndex: number,
): Promise<IntentLegPrepareResult> {
  if (leg.sizeUsd <= 0) {
    return { legIndex, ok: false, reason: "INVALID_LEG_SIZE" };
  }
  return { legIndex, ok: true, fillPrice: 1, filledUsd: leg.sizeUsd };
}

/** Default commit — succeeds when leg was prepared OK */
export async function defaultCommitLeg(
  _leg: IntentLeg,
  legIndex: number,
  intent: CrossLegIntent,
): Promise<{ ok: boolean; reason?: string }> {
  const prep = intent.legResults.find((r) => r.legIndex === legIndex);
  if (!prep?.ok) return { ok: false, reason: "LEG_NOT_PREPARED" };
  return { ok: true };
}

/** Build reduce-only flatten action for a filled prepare leg */
export function buildFlattenAction(
  leg: IntentLeg,
  reason: string,
): FlattenAction {
  return {
    venue: leg.venue,
    side: oppositeSide(leg.side),
    sizeUsd: leg.sizeUsd,
    reduceOnly: true,
    reason,
  };
}

/** Create a new dual-leg intent in PENDING phase */
export function createCrossLegIntent(input: {
  id: string;
  legs: [IntentLeg, IntentLeg];
  ttlMs?: number;
  now?: number;
}): CrossLegIntent {
  const intent: CrossLegIntent = {
    id: input.id,
    legs: input.legs,
    phase: "PENDING",
    ttlMs: input.ttlMs ?? DEFAULT_TTL_MS,
    createdAt: input.now ?? Date.now(),
    legResults: [],
    flattenActions: [],
  };
  return persist(intent);
}

/** Read intent by id */
export function getIntent(id: string): CrossLegIntent | undefined {
  const stored = ledgerStore.get(id);
  return stored ? cloneIntent(stored) : undefined;
}

/** Restore a persisted intent into the hot ledger */
export function importCrossLegIntent(intent: CrossLegIntent): CrossLegIntent {
  return persist(cloneIntent(intent));
}

/** List all in-memory intents — persistence sync helper */
export function listAllIntents(): CrossLegIntent[] {
  return Array.from(ledgerStore.values()).map(cloneIntent);
}

/** Clear ledger — test helper */
export function __clearIntentLedgerForTests(): void {
  ledgerStore.clear();
}

/**
 * Phase 1 — Prepare both legs in parallel.
 * On any failure: ABORT + enqueue safe flatten for any leg that already prepared OK.
 */
export async function prepareIntent(
  id: string,
  options: IntentLedgerOptions = {},
): Promise<IntentTransitionResult> {
  const stored = ledgerStore.get(id);
  if (!stored) return { intent: { id, legs: [{ venue: "HL", side: "LONG", sizeUsd: 0 }, { venue: "HL", side: "SHORT", sizeUsd: 0 }], phase: "ABORTED", ttlMs: 0, createdAt: 0, legResults: [], flattenActions: [] }, ok: false, reason: "INTENT_NOT_FOUND" };

  let intent = cloneIntent(stored);
  if (intent.phase !== "PENDING") {
    return { intent, ok: false, reason: `INVALID_PHASE:${intent.phase}` };
  }

  const prepareLeg = options.prepareLeg ?? defaultPrepareLeg;
  const now = nowMs(options);

  const results = await Promise.all(
    intent.legs.map((leg, index) => prepareLeg(leg, index, intent)),
  );

  intent.legResults = results;
  const allOk = results.every((r) => r.ok);

  if (allOk) {
    intent.phase = "PREPARED";
    intent.preparedAt = now;
    intent = persist(intent);
    return { intent, ok: true };
  }

  const failed = results.filter((r) => !r.ok);
  const preparedOk = results
    .filter((r) => r.ok)
    .map((r) => intent.legs[r.legIndex]);

  intent.flattenActions = preparedOk.map((leg) =>
    buildFlattenAction(leg, "PREPARE_PARTIAL_FAILURE"),
  );
  intent.phase = "ABORTED";
  intent.abortedAt = now;
  intent.abortReason = failed.map((f) => f.reason ?? "PREPARE_FAILED").join("|");

  const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
  for (const action of intent.flattenActions) {
    await flattenLeg(action, intent);
  }

  intent = persist(intent);
  return { intent, ok: false, reason: intent.abortReason };
}

/**
 * Phase 2 — Commit all prepared legs.
 * Requires PREPARED and within TTL. Any commit failure triggers ABORT + flatten.
 */
export async function commitIntent(
  id: string,
  options: IntentLedgerOptions = {},
): Promise<IntentTransitionResult> {
  const stored = ledgerStore.get(id);
  if (!stored) {
    return {
      intent: {
        id,
        legs: [{ venue: "HL", side: "LONG", sizeUsd: 0 }, { venue: "HL", side: "SHORT", sizeUsd: 0 }],
        phase: "ABORTED",
        ttlMs: 0,
        createdAt: 0,
        legResults: [],
        flattenActions: [],
      },
      ok: false,
      reason: "INTENT_NOT_FOUND",
    };
  }

  let intent = cloneIntent(stored);
  const now = nowMs(options);

  if (intent.phase !== "PREPARED") {
    return { intent, ok: false, reason: `INVALID_PHASE:${intent.phase}` };
  }
  if (isExpired(intent, now)) {
    intent.phase = "ABORTED";
    intent.abortedAt = now;
    intent.abortReason = "PREPARE_TTL_EXPIRED";
    const preparedIndexes = new Set(
      intent.legResults.filter((r) => r.ok).map((r) => r.legIndex),
    );
    intent.flattenActions = intent.legs
      .filter((_, index) => preparedIndexes.has(index))
      .map((leg) => buildFlattenAction(leg, "TTL_EXPIRED"));
    const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
    for (const action of intent.flattenActions) {
      await flattenLeg(action, intent);
    }
    intent = persist(intent);
    return { intent, ok: false, reason: intent.abortReason };
  }

  const commitLeg = options.commitLeg ?? defaultCommitLeg;
  const commitResults = await Promise.all(
    intent.legs.map((leg, index) => commitLeg(leg, index, intent)),
  );

  if (commitResults.every((r) => r.ok)) {
    intent.phase = "COMMITTED";
    intent.committedAt = now;
    intent = persist(intent);
    return { intent, ok: true };
  }

  const failedReasons = commitResults
    .filter((r) => !r.ok)
    .map((r) => r.reason ?? "COMMIT_FAILED")
    .join("|");

  intent.flattenActions = intent.legs.map((leg) =>
    buildFlattenAction(leg, "COMMIT_PARTIAL_FAILURE"),
  );
  intent.phase = "ABORTED";
  intent.abortedAt = now;
  intent.abortReason = failedReasons;

  const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
  for (const action of intent.flattenActions) {
    await flattenLeg(action, intent);
  }

  intent = persist(intent);
  return { intent, ok: false, reason: intent.abortReason };
}

/** Explicit abort from PENDING or PREPARED — runs flatten simulation on prepared legs */
export async function abortIntent(
  id: string,
  reason: string,
  options: IntentLedgerOptions = {},
): Promise<IntentTransitionResult> {
  const stored = ledgerStore.get(id);
  if (!stored) {
    return {
      intent: {
        id,
        legs: [{ venue: "HL", side: "LONG", sizeUsd: 0 }, { venue: "HL", side: "SHORT", sizeUsd: 0 }],
        phase: "ABORTED",
        ttlMs: 0,
        createdAt: 0,
        legResults: [],
        flattenActions: [],
      },
      ok: false,
      reason: "INTENT_NOT_FOUND",
    };
  }

  let intent = cloneIntent(stored);
  if (intent.phase === "COMMITTED" || intent.phase === "ABORTED") {
    return { intent, ok: false, reason: `INVALID_PHASE:${intent.phase}` };
  }

  const preparedIndexes = new Set(
    intent.legResults.filter((r) => r.ok).map((r) => r.legIndex),
  );
  intent.flattenActions = intent.legs
    .filter((_, i) => preparedIndexes.has(i) || intent.phase === "PREPARED")
    .map((leg) => buildFlattenAction(leg, reason));

  intent.phase = "ABORTED";
  intent.abortedAt = nowMs(options);
  intent.abortReason = reason;

  const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
  for (const action of intent.flattenActions) {
    await flattenLeg(action, intent);
  }

  intent = persist(intent);
  return { intent, ok: true, reason };
}
