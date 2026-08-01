import { useCallback, useEffect, useState } from "react";
import type { TelemetryHealthResponse } from "../../../src/api/routes/telemetry";

const POLL_MS = 4_000;

export interface TelemetryHealthModel {
  data: TelemetryHealthResponse | null;
  loading: boolean;
  error: string | null;
  online: boolean;
  refresh: () => void;
}

export function useTelemetryHealth(pollMs = POLL_MS): TelemetryHealthModel {
  const [data, setData] = useState<TelemetryHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading((prev) => (data === null ? true : prev));
    try {
      const res = await fetch("/api/telemetry/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as TelemetryHealthResponse;
      if (!payload.success) throw new Error("Telemetry payload rejected");
      setData(payload);
      setOnline(true);
      setError(null);
    } catch (err) {
      setOnline(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), pollMs);
    return () => clearInterval(timer);
  }, [pollMs, refresh]);

  return { data, loading, error, online, refresh };
}
