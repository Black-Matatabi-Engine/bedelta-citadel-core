/**
 * Step 2 scan orchestrator — Hyperliquid meta + L2 weak-target selection.
 * @theory Hamilton (1989) — regime handshake gate from Step 1 SAFE status.
 * @see step2/scoring.ts — weakness score composition.
 */

import { HL_INFO_URL, MAX_TARGETS, STEP2_HANDSHAKE_TTL_MS, TIER2_L2_TOP_N } from "../../../config/constants";
import type { Step1ScanResult } from "../../types/step1";
import type {
  Step2AnalysisResult,
  Step2MockConfig,
  Step2MockL2Book,
  Step2MockUniverseRow,
  WeakTargetMetric,
} from "../../types/step2-targets";
import { defaultMockL2Books, defaultMockUniverse } from "./mocks";
import { buildWeakTargetMetric, passesTier1Filter, tier1Priority } from "./scoring";
import {
  emptyStep2Result,
  type HlAssetCtx,
  type HlL2Book,
  type HlUniverseAsset,
  type Tier1Candidate,
} from "./types";

function parseMetaAndAssetCtxs(raw: unknown): Tier1Candidate[] {
  if (!Array.isArray(raw) || raw.length < 2) return [];
  const universe = (raw[0] as { universe?: HlUniverseAsset[] })?.universe ?? [];
  const ctxs = (raw[1] as HlAssetCtx[]) ?? [];
  const out: Tier1Candidate[] = [];

  universe.forEach((asset, index) => {
    const name = (asset.name ?? "").trim().toUpperCase();
    if (!name || name.includes(":")) return;
    const ctx = ctxs[index] ?? {};
    const midPx = parseFloat(ctx.midPx ?? ctx.oraclePx ?? ctx.markPx ?? "0");
    const prevDayPx = parseFloat(ctx.prevDayPx ?? "0");
    const fundingRateHourly = parseFloat(ctx.funding ?? "0") || 0;
    const oiContracts = parseFloat(ctx.openInterest ?? "0") || 0;
    const dayNtlVlm = parseFloat(ctx.dayNtlVlm ?? "0") || 0;
    if (!(midPx > 0)) return;

    const priceChange24hRatio =
      prevDayPx > 0 ? (midPx - prevDayPx) / prevDayPx : 0;
    const openInterestUsd = oiContracts * midPx;
    const oiIntensity = dayNtlVlm > 0 ? openInterestUsd / dayNtlVlm : 0;
    const oiChange24hRatio =
      oiIntensity >= 1.5
        ? Math.min(0.5, (oiIntensity - 1) * 0.2) * Math.sign(priceChange24hRatio || 1) * -1
        : oiIntensity >= 0.8
          ? 0.08 * Math.sign(-priceChange24hRatio || 1)
          : 0;

    out.push({
      symbol: name,
      fundingRateHourly,
      oiChange24hRatio,
      priceChange24hRatio,
      dayNtlVlm,
      openInterestUsd,
      midPx,
    });
  });

  return out;
}

function mockRowsToCandidates(rows: Step2MockUniverseRow[]): Tier1Candidate[] {
  return rows.map((row) => ({
    symbol: row.symbol.toUpperCase(),
    fundingRateHourly: row.fundingRateHourly,
    oiChange24hRatio: row.oiChange24hRatio,
    priceChange24hRatio:
      row.prevDayPx > 0 ? (row.midPx - row.prevDayPx) / row.prevDayPx : 0,
    dayNtlVlm: row.dayNtlVlm,
    openInterestUsd: row.openInterest * row.midPx,
    midPx: row.midPx,
  }));
}

function sumLevelsUsd(
  levels: Array<[string, string] | { px: string; sz: string }> | undefined,
  midPx: number,
  maxLevels = 10,
): number {
  if (!levels || levels.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < Math.min(levels.length, maxLevels); i++) {
    const lvl = levels[i];
    const px = Array.isArray(lvl) ? parseFloat(lvl[0]) : parseFloat(lvl.px ?? "0");
    const sz = Array.isArray(lvl) ? parseFloat(lvl[1]) : parseFloat(lvl.sz ?? "0");
    if (Number.isFinite(px) && Number.isFinite(sz)) sum += px * sz;
  }
  void midPx;
  return sum;
}

function estimateLiqDistanceFromBook(
  bidDepthUsd: number,
  askDepthUsd: number,
  midPx: number,
): number {
  if (!(midPx > 0)) return 5;
  const thin = Math.min(bidDepthUsd, askDepthUsd);
  if (thin < 50_000) return 0.6;
  if (thin < 200_000) return 1.2;
  if (thin < 1_000_000) return 2.5;
  return 4.0;
}

async function postHlInfo(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(HL_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Hyperliquid info HTTP ${res.status}`);
  return res.json();
}

async function fetchL2BookFeatures(
  symbol: string,
  midPx: number,
  mockBook?: Step2MockL2Book,
): Promise<{
  bidDepthUsd: number;
  askDepthUsd: number;
  estimatedLiquidationDistancePct: number;
}> {
  if (mockBook) return mockBook;

  const raw = (await postHlInfo({ type: "l2Book", coin: symbol })) as HlL2Book;
  const bids = raw.levels?.[0];
  const asks = raw.levels?.[1];
  const bidDepthUsd = sumLevelsUsd(bids, midPx);
  const askDepthUsd = sumLevelsUsd(asks, midPx);
  return {
    bidDepthUsd,
    askDepthUsd,
    estimatedLiquidationDistancePct: estimateLiqDistanceFromBook(
      bidDepthUsd,
      askDepthUsd,
      midPx,
    ),
  };
}

export async function runStep2Scan(
  step1Result: Step1ScanResult,
  config?: Step2MockConfig,
): Promise<Step2AnalysisResult> {
  const startedAt = Date.now();
  const step1Timestamp = step1Result.timestamp;
  const ageMs = startedAt - step1Timestamp;
  const isHandshakeValid = ageMs < STEP2_HANDSHAKE_TTL_MS;

  if (!isHandshakeValid) {
    return emptyStep2Result({
      startedAt,
      timestamp: Date.now(),
      handshake: {
        step1Timestamp,
        isHandshakeValid: false,
        handshakeMessage: `Step 1 handshake stale (${ageMs}ms >= ${STEP2_HANDSHAKE_TTL_MS}ms)`,
      },
      status: "HANDSHAKE_FAILED",
    });
  }

  if (step1Result.status !== "SAFE") {
    return emptyStep2Result({
      startedAt,
      timestamp: Date.now(),
      handshake: {
        step1Timestamp,
        isHandshakeValid: true,
        handshakeMessage: "Handshake OK; Step 1 not SAFE — scan skipped",
      },
      status: "SKIPPED_DUE_TO_STEP1",
    });
  }

  let universe: Tier1Candidate[] = [];
  let usedMock = false;
  const mockBooks = config?.mockL2Books ?? defaultMockL2Books();

  if (config?.isMockMode) {
    usedMock = true;
    universe = mockRowsToCandidates(
      config.mockUniverse?.length ? config.mockUniverse : defaultMockUniverse(),
    );
  } else {
    try {
      if (config?.forceApiFailure) throw new Error("Forced API failure");
      const raw = await postHlInfo({ type: "metaAndAssetCtxs" });
      universe = parseMetaAndAssetCtxs(raw);
    } catch {
      usedMock = true;
      universe = mockRowsToCandidates(defaultMockUniverse());
    }
  }

  const totalUniverseScanned = universe.length;
  const filtered = universe.filter(passesTier1Filter);
  filtered.sort((a, b) => tier1Priority(b) - tier1Priority(a));
  const tier2 = filtered.slice(0, TIER2_L2_TOP_N);

  const metrics: WeakTargetMetric[] = [];
  for (const candidate of tier2) {
    try {
      const book = await fetchL2BookFeatures(
        candidate.symbol,
        candidate.midPx,
        usedMock
          ? (mockBooks[candidate.symbol] ?? {
              bidDepthUsd: 100_000,
              askDepthUsd: 100_000,
              estimatedLiquidationDistancePct: 2.0,
            })
          : undefined,
      );
      metrics.push(buildWeakTargetMetric(candidate, book));
    } catch {
      // Skip candidate if L2 fetch fails
    }
  }

  metrics.sort((a, b) => b.weaknessScore - a.weaknessScore);
  const targets = metrics.filter((t) => t.weaknessScore > 0).slice(0, MAX_TARGETS);

  return {
    timestamp: Date.now(),
    handshake: {
      step1Timestamp,
      isHandshakeValid: true,
      handshakeMessage: usedMock
        ? "Handshake OK; dry-run/mock market data"
        : "Handshake OK; live Hyperliquid scan",
    },
    status: targets.length > 0 ? "TARGETS_FOUND" : "NO_WEAK_TARGETS",
    targets,
    executionMetadata: {
      totalUniverseScanned,
      filteredCandidatesCount: filtered.length,
      executionTimeMs: Date.now() - startedAt,
    },
  };
}
