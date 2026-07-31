import { useCallback, useEffect, useState } from "react";
import type { YieldTriangleResponse } from "../../../src/services/yield-router";
import { buildYieldTriangleViewModel } from "../lib/yield-view-model";
import type { YieldTriangleViewModel } from "../types";

const POLL_MS = 5_000;

export interface UseYieldTriangleOptions {
  symbol?: string;
  pollMs?: number;
  enabled?: boolean;
}

export function useYieldTriangle(
  options: UseYieldTriangleOptions = {},
): YieldTriangleViewModel & { refresh: () => void } {
  const symbol = (options.symbol ?? "ETH").toUpperCase();
  const pollMs = options.pollMs ?? POLL_MS;
  const enabled = options.enabled ?? true;

  const [data, setData] = useState<YieldTriangleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading((prev) => (data === null ? true : prev));
    try {
      const res = await fetch(`/api/yield/triangle?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as YieldTriangleResponse;
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [data, enabled, symbol]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const timer = setInterval(() => void refresh(), pollMs);
    return () => clearInterval(timer);
  }, [enabled, pollMs, refresh]);

  const view = buildYieldTriangleViewModel(data, loading, error, symbol);
  return { ...view, refresh };
}
