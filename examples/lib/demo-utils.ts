/** Shared CLI demo utilities — safe HKT time, Pino mute, clean trip exits. */

/** HKT 14:00 — outside tsunami shield window (21:00–23:00 HKT). */
const DEMO_SAFE_ISO = "2026-07-25T06:00:00.000Z";

const R = "\x1b[0m";
const GREEN = "\x1b[32;1m";
const CYAN = "\x1b[36;1m";
const BOLD = "\x1b[1m";
const BOX_W = 65;

export function getDemoSafeTimestamp(): { nowMs: number; at: Date } {
  const at = new Date(DEMO_SAFE_ISO);
  return { nowMs: at.getTime(), at };
}

function isPinoJsonLine(msg: string): boolean {
  return msg.includes('"level"') && msg.includes('"module"');
}

export function muteLibraryConsole(): () => void {
  const warn = console.warn;
  const log = console.log;
  const error = console.error;
  const filter = (fn: typeof console.warn) => (...args: unknown[]) => {
    const msg = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
    if (isPinoJsonLine(msg)) return;
    fn(...args);
  };
  console.warn = filter(warn);
  console.log = filter(log);
  console.error = filter(error);
  return () => {
    console.warn = warn;
    console.log = log;
    console.error = error;
  };
}

export function handleDemoExit(isTripped: boolean, reason: string): void {
  if (!isTripped) return;
  const line = "═".repeat(BOX_W);
  console.log(`\n${GREEN}${line}${R}`);
  console.log(
    `${GREEN}${BOLD}🟢 INTERCEPTION VERIFIED: This exit is an INTENTIONAL 0-Gas Fail-Closed Guard (NOT a script crash).${R}`,
  );
  console.log(`${CYAN}  Trigger: ${reason}${R}`);
  console.log(`${GREEN}${line}${R}\n`);
  process.exit(0);
}
