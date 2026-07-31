import { useCallback, useState } from "react";
import {
  runIntentDemoScenario,
  runJupiterBlockDemo,
  type IntentDemoScenario,
} from "../services/intent-stream-demo";
import type { IntentStreamEvent } from "../types";

export function useIntentStream() {
  const [events, setEvents] = useState<IntentStreamEvent[]>([]);
  const [running, setRunning] = useState(false);

  const appendEvents = useCallback((next: IntentStreamEvent[]) => {
    setEvents((prev) => [...next, ...prev].slice(0, 200));
  }, []);

  const runScenario = useCallback(
    async (scenario: IntentDemoScenario) => {
      setRunning(true);
      try {
        const next = await runIntentDemoScenario(scenario);
        appendEvents(next);
      } finally {
        setRunning(false);
      }
    },
    [appendEvents],
  );

  const runJupiterBlock = useCallback(async () => {
    setRunning(true);
    try {
      appendEvents(await runJupiterBlockDemo());
    } finally {
      setRunning(false);
    }
  }, [appendEvents]);

  const clear = useCallback(() => setEvents([]), []);

  return { events, running, runScenario, runJupiterBlock, clear };
}
