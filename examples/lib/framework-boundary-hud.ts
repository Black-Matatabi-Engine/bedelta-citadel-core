import { CORE_BRIGHT_CYAN, R } from "./demo-timing";

const FRAMEWORK_BOX_W = 72;
const GRAY = "\x1b[90m";
const BOLD = "\x1b[1m";

export type FrameworkMeta = {
  name: string;
  layer: string;
  interception: string;
};

function padFrameworkLine(text: string): string {
  const pad = Math.max(0, FRAMEWORK_BOX_W - 2 - text.replace(/\x1b\[[0-9;]*m/g, "").length);
  return ` ${text}${" ".repeat(pad)}`;
}

export function printFrameworkBoundary(meta: FrameworkMeta): void {
  console.log(`\n${CORE_BRIGHT_CYAN}┌${"─".repeat(FRAMEWORK_BOX_W)}┐${R}`);
  console.log(`${CORE_BRIGHT_CYAN}│${R}${BOLD}${padFrameworkLine(meta.name)}${R}${CORE_BRIGHT_CYAN}│${R}`);
  console.log(`${CORE_BRIGHT_CYAN}│${R}${padFrameworkLine(`${GRAY}Layer:${R} ${meta.layer}`)}${CORE_BRIGHT_CYAN}│${R}`);
  console.log(
    `${CORE_BRIGHT_CYAN}│${R}${padFrameworkLine(`${GRAY}Interception:${R} ${CORE_BRIGHT_CYAN}${meta.interception}${R}`)}${CORE_BRIGHT_CYAN}│${R}`,
  );
  console.log(`${CORE_BRIGHT_CYAN}└${"─".repeat(FRAMEWORK_BOX_W)}┘${R}\n`);
}
