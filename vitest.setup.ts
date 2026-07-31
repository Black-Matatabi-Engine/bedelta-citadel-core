import { afterEach, beforeEach, vi } from "vitest";
import { SAFE_TRADING_TIME } from "./tests/helpers/system-time";

function managesOwnTimers(filepath: string): boolean {
  return filepath.replace(/\\/g, "/").includes("/hl/websocket.test.ts");
}

beforeEach((ctx) => {
  if (managesOwnTimers(ctx.task.file.filepath)) return;

  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(SAFE_TRADING_TIME);
});

afterEach((ctx) => {
  if (managesOwnTimers(ctx.task.file.filepath)) return;

  vi.useRealTimers();
});
