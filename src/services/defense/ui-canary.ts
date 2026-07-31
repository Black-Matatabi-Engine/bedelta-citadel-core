/**
 * Defense Matrix 3 — Santenmoku HUD canary handshake + Xuanwu watermark hash.
 */

export const HUD_CANARY_EXPECTED = "santenmoku" as const;
export const XUANWU_WATERMARK_SEED = "玄武" as const;
export const UI_LOCKED_MESSAGE = "Disconnected / Locked State" as const;

export type UiStreamState = "CONNECTED" | "DISCONNECTED_LOCKED";

export interface UiCanaryEnv {
  NEXT_PUBLIC_HUD_CANARY?: string;
}

export interface CanvasWatermarkPayload {
  seed: string;
  hash: string;
  webglHint: string;
}

let envOverride: UiCanaryEnv | undefined;

export function __setHudCanaryEnvForTests(env: UiCanaryEnv | undefined): void {
  envOverride = env;
}

function readCanaryEnv(): UiCanaryEnv {
  if (envOverride) return envOverride;
  if (typeof import.meta !== "undefined") {
    const meta = import.meta as ImportMeta & {
      env?: { NEXT_PUBLIC_HUD_CANARY?: string };
    };
    if (meta.env) {
      return { NEXT_PUBLIC_HUD_CANARY: meta.env.NEXT_PUBLIC_HUD_CANARY };
    }
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env as UiCanaryEnv;
  }
  return {};
}

export function resolveHudCanaryToken(
  env: UiCanaryEnv = readCanaryEnv(),
): string | null {
  const raw = env.NEXT_PUBLIC_HUD_CANARY?.trim();
  if (!raw) return HUD_CANARY_EXPECTED;
  return raw === HUD_CANARY_EXPECTED ? raw : null;
}

export function isHudCanaryAuthenticated(
  env: UiCanaryEnv = readCanaryEnv(),
): boolean {
  return resolveHudCanaryToken(env) !== null;
}

/** FNV-1a hash of Xuanwu watermark seed for Canvas/WebGL overlay */
export function computeXuanwuWatermarkHash(
  seed: string = XUANWU_WATERMARK_SEED,
): string {
  let hash = 2_166_136_261;
  const payload = `${seed}:santenmoku:hud:v1`;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }
  return `xw-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function generateCanvasWatermarkPayload(): CanvasWatermarkPayload {
  const hash = computeXuanwuWatermarkHash();
  return {
    seed: XUANWU_WATERMARK_SEED,
    hash,
    webglHint: `webgl-xuanwu-${hash.slice(3, 11)}`,
  };
}

export function buildUiHandshakeHeaders(
  env: UiCanaryEnv = readCanaryEnv(),
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Santenmoku-Canary": HUD_CANARY_EXPECTED,
  };
  if (isHudCanaryAuthenticated(env)) {
    headers["X-Xuanwu-Watermark"] = computeXuanwuWatermarkHash();
  }
  return headers;
}

export function resolveUiStreamState(
  env: UiCanaryEnv = readCanaryEnv(),
): UiStreamState {
  return isHudCanaryAuthenticated(env) ? "CONNECTED" : "DISCONNECTED_LOCKED";
}

export function assertUiWorkerHandshake(
  env: UiCanaryEnv = readCanaryEnv(),
): { ok: true } | { ok: false; message: string } {
  if (!isHudCanaryAuthenticated(env)) {
    return { ok: false, message: UI_LOCKED_MESSAGE };
  }
  return { ok: true };
}

/** Validate HUD stream request — header must carry santenmoku canary */
export function validateHudStreamRequest(
  request: Request,
): { ok: true } | { ok: false; status: 403; message: string } {
  const headerCanary =
    request.headers.get("X-Santenmoku-Canary")?.trim() ??
    request.headers.get("x-santenmoku-canary")?.trim();
  if (headerCanary === HUD_CANARY_EXPECTED) {
    return { ok: true };
  }
  return { ok: false, status: 403, message: UI_LOCKED_MESSAGE };
}
