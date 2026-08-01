/**
 * Cloudflare Workers environment bindings for slivervine-app.
 * Runtime telemetry persists to SLIVERVINE_KV (native KV binding).
 */
export interface Env {
  /** Optional Python multi-exchange gateway */
  PYTHON_GATEWAY_URL?: string;
  /** "true" | "false" — prefer native fetch when false */
  USE_PYTHON_GATEWAY?: string;
  /** Static assets (public/) — brand images etc. */
  ASSETS?: Fetcher;
  /** Isolated BeDelta Water KV (wrangler.jsonc SSOT) */
  BEDELTA_WATER_KV?: KVNamespace;
  /** Compat alias — same namespace as BEDELTA_WATER_KV */
  SLIVERVINE_KV?: KVNamespace;
  /** Alias binding — same namespace as BEDELTA_WATER_KV (system:state SSOT) */
  SYSTEM_STATE_KV?: KVNamespace;
  /** Runtime integrity unlock — inject via wrangler secret put (never commit) */
  XUANWU_SALT?: string;
  OWNER_IDENTITY?: string;
  JAVIER_SIGNATURE?: string;
  /** Public HUD canary for /api/hud-stream handshake (also Vite build var) */
  NEXT_PUBLIC_HUD_CANARY?: string;
  /** Strike alpha — inject via Wrangler vars (see docs/ARCHITECTURE.md) */
  STRIKE_IMBALANCE_RATIO_MIN?: string;
  STRIKE_MICRO_SPREAD_COLLAPSE_BPS?: string;
  STRIKE_SENSING_PROBE_USD?: string;
  STRIKE_SENSING_COOLDOWN_MS?: string;
  STRIKE_PITSTOP_FUNDING_BPS?: string;
  STRIKE_PITSTOP_MAX_HOLD_MS?: string;
  STRIKE_FLEET_MODE?: string;
  /** Coach alpha — inject via Wrangler vars (see docs/ARCHITECTURE.md) */
  COACH_VIX_SPIKE_THRESHOLD?: string;
  COACH_DVOL_SPIKE_THRESHOLD?: string;
  COACH_VENUE_DELAY_MS?: string;
  COACH_MARGIN_SUBSTITUTION_PCT?: string;
  COACH_MIN_EDGE_BPS?: string;
  COACH_FLEET_DAILY_LOSS_MULTIPLIER?: string;
  /** "true" — append pop-culture tacticalAlias to structured log details */
  TACTICAL_LOG_METAPHORS?: string;
  /** Telegram Bot API token for panic alerts */
  TELEGRAM_BOT_TOKEN?: string;
  /** Telegram chat id for panic alerts */
  TELEGRAM_CHAT_ID?: string;
}
