/**
 * Hyperliquid WebSocket stream engine — Cloudflare Workers / browser native WebSocket.
 *
 * Subscriptions: allMids, l2Book, userEvents.
 * Resiliency: 30s heartbeat ping, stale detection (>5s), exponential backoff reconnect.
 * Risk: WS disconnect / latency >200ms flags soil resistance TRIPPED for signing pipeline.
 */

import { PGATE_MAX_LATENCY_MS } from "./execution";
import {
  checkSoilResistance,
  type SoilResistanceInput,
  type SoilResistanceResult,
} from "../../services/risk-control";
import type { SigningGateInput } from "./auth";

export const HL_WS_URL = "wss://api.hyperliquid.xyz/ws";
export const HL_WS_TESTNET_URL = "wss://api.hyperliquid-testnet.xyz/ws";

/** Client heartbeat ping interval */
export const WS_HEARTBEAT_INTERVAL_MS = 30_000;

/** No inbound activity within this window → stale + reconnect */
export const WS_STALE_THRESHOLD_MS = 5_000;

/** Initial reconnect delay (exponential backoff base) */
export const WS_RECONNECT_BASE_MS = 1_000;

/** Maximum reconnect backoff cap */
export const WS_RECONNECT_MAX_MS = 30_000;

export type HlWsChannel =
  | "subscriptionResponse"
  | "allMids"
  | "l2Book"
  | "user"
  | "pong"
  | string;

export interface HlWsSubscribeMessage {
  method: "subscribe" | "unsubscribe" | "ping";
  subscription?: Record<string, unknown>;
}

export interface HlWsInboundMessage {
  channel: HlWsChannel;
  data: unknown;
}

export interface AllMidsData {
  mids: Record<string, string>;
}

export interface WsBookLevel {
  px: string;
  sz: string;
  n?: number;
}

export interface WsBookData {
  coin: string;
  levels: [WsBookLevel[], WsBookLevel[]];
  time: number;
}

export interface WsUserEventData {
  fills?: unknown[];
  funding?: unknown;
  liquidation?: unknown;
  nonUserCancel?: unknown[];
  [key: string]: unknown;
}

export interface WsHealthSnapshot {
  connected: boolean;
  latencyMs: number | null;
  lastMessageAt: number | null;
  lastPingAt: number | null;
  stale: boolean;
  reconnectAttempts: number;
  soilTripped: boolean;
  tripReasons: string[];
}

export interface HyperliquidWsClientOptions {
  url?: string;
  isTestnet?: boolean;
  /** Injectable WebSocket constructor (for Workers tests) */
  WebSocketImpl?: typeof WebSocket;
  /** Injectable socket factory (preferred for unit tests) */
  wsFactory?: WsFactory;
  now?: () => number;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
  setIntervalFn?: typeof setInterval;
  clearIntervalFn?: typeof clearInterval;
  autoReconnect?: boolean;
  heartbeatIntervalMs?: number;
  staleThresholdMs?: number;
  onHealthChange?: (health: WsHealthSnapshot) => void;
  onMessage?: (message: HlWsInboundMessage) => void;
}

/** Minimal WebSocket surface used by the client (native + mock-friendly) */
export interface WsLike {
  readonly readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  onopen: ((ev: Event) => void) | null;
  onmessage: ((ev: MessageEvent) => void) | null;
  onclose: ((ev: CloseEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
}

export type WsFactory = (url: string) => WsLike;

const WS_OPEN = 1;

/** Build HL subscribe frame */
export function buildSubscribeFrame(
  subscription: Record<string, unknown>,
): string {
  return JSON.stringify({ method: "subscribe", subscription });
}

export function buildPingFrame(): string {
  return JSON.stringify({ method: "ping" });
}

export function parseWsMessage(raw: string): HlWsInboundMessage | null {
  try {
    const parsed = JSON.parse(raw) as HlWsInboundMessage;
    if (!parsed || typeof parsed !== "object" || !("channel" in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Compute spread from top-of-book (bid/ask) for slippage monitoring */
export function computeBookSpreadBps(book: WsBookData): number | null {
  const bids = book.levels?.[0] ?? [];
  const asks = book.levels?.[1] ?? [];
  const bestBid = bids[0]?.px ? Number(bids[0].px) : 0;
  const bestAsk = asks[0]?.px ? Number(asks[0].px) : 0;
  if (bestBid <= 0 || bestAsk <= 0) return null;
  const mid = (bestBid + bestAsk) / 2;
  return ((bestAsk - bestBid) / mid) * 10_000;
}

/** Evaluate WS health against Pgate latency / connectivity iron rules */
export function evaluateWsTripReasons(health: WsHealthSnapshot): string[] {
  const reasons: string[] = [];
  if (!health.connected) {
    reasons.push("WS_DISCONNECTED");
  }
  if (health.stale) {
    reasons.push(`WS_STALE_NO_ACTIVITY>${WS_STALE_THRESHOLD_MS}ms`);
  }
  if (
    health.latencyMs !== null &&
    health.latencyMs > PGATE_MAX_LATENCY_MS
  ) {
    reasons.push(
      `WS_LATENCY_MS=${health.latencyMs}>${PGATE_MAX_LATENCY_MS}`,
    );
  }
  return reasons;
}

/**
 * Merge WS health with optional venue soil input — tripped when either fails.
 * Use `gate.soilResistanceTripped` to block signing pipeline on stale WS data.
 */
export function evaluateWsSoilResistance(
  health: WsHealthSnapshot,
  baseInput?: SoilResistanceInput,
): SoilResistanceResult & { gate: SigningGateInput } {
  const wsReasons = evaluateWsTripReasons(health);
  const base = baseInput
    ? checkSoilResistance(baseInput)
    : ({
        ok: true,
        tripped: false,
        crossVenueSlippage: 0,
        spotPerpSlippage: 0,
        reasons: [],
      } satisfies SoilResistanceResult);

  const reasons = [...wsReasons, ...base.reasons];
  const tripped = wsReasons.length > 0 || base.tripped;

  return {
    ok: !tripped,
    tripped,
    crossVenueSlippage: base.crossVenueSlippage,
    spotPerpSlippage: base.spotPerpSlippage,
    reasons,
    gate: {
      soilResistanceTripped: tripped,
      symbol: baseInput?.symbol ?? "HL_WS",
    },
  };
}

export class HyperliquidWsClient {
  private ws: WsLike | null = null;
  private readonly url: string;
  private readonly wsFactory: WsFactory;
  private readonly now: () => number;
  private readonly setTimeoutFn: typeof setTimeout;
  private readonly clearTimeoutFn: typeof clearTimeout;
  private readonly setIntervalFn: typeof setInterval;
  private readonly clearIntervalFn: typeof clearInterval;
  private readonly autoReconnect: boolean;
  private readonly heartbeatIntervalMs: number;
  private readonly staleThresholdMs: number;
  private readonly onHealthChange?: (health: WsHealthSnapshot) => void;
  private readonly onMessage?: (message: HlWsInboundMessage) => void;

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private staleTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingPingAt: number | null = null;
  private reconnectAttempts = 0;
  private intentionalClose = false;

  private health: WsHealthSnapshot = {
    connected: false,
    latencyMs: null,
    lastMessageAt: null,
    lastPingAt: null,
    stale: false,
    reconnectAttempts: 0,
    soilTripped: true,
    tripReasons: ["WS_DISCONNECTED"],
  };

  private allMids: Record<string, string> = {};
  private l2Books = new Map<string, WsBookData>();
  private userEvents: WsUserEventData[] = [];
  private subscriptions: Record<string, unknown>[] = [];

  constructor(options: HyperliquidWsClientOptions = {}) {
    this.url =
      options.url ??
      (options.isTestnet ? HL_WS_TESTNET_URL : HL_WS_URL);
    this.wsFactory =
      options.wsFactory ??
      ((url: string) => {
        const Impl = options.WebSocketImpl ?? WebSocket;
        return new Impl(url) as unknown as WsLike;
      });
    this.now = options.now ?? (() => Date.now());
    this.setTimeoutFn = options.setTimeoutFn ?? setTimeout;
    this.clearTimeoutFn = options.clearTimeoutFn ?? clearTimeout;
    this.setIntervalFn = options.setIntervalFn ?? setInterval;
    this.clearIntervalFn = options.clearIntervalFn ?? clearInterval;
    this.autoReconnect = options.autoReconnect ?? true;
    this.heartbeatIntervalMs =
      options.heartbeatIntervalMs ?? WS_HEARTBEAT_INTERVAL_MS;
    this.staleThresholdMs = options.staleThresholdMs ?? WS_STALE_THRESHOLD_MS;
    this.onHealthChange = options.onHealthChange;
    this.onMessage = options.onMessage;
  }

  getHealth(): WsHealthSnapshot {
    return { ...this.health };
  }

  getLatestAllMids(): Readonly<Record<string, string>> {
    return this.allMids;
  }

  getLatestL2Book(coin: string): WsBookData | null {
    return this.l2Books.get(coin.toUpperCase()) ?? null;
  }

  getUserEvents(): readonly WsUserEventData[] {
    return this.userEvents;
  }

  /** Connect and re-subscribe to all tracked channels */
  connect(): void {
    this.intentionalClose = false;
    this.openSocket();
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearTimers();
    if (this.reconnectTimer) {
      this.clearTimeoutFn(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close(1000, "client_disconnect");
    this.ws = null;
    this.setHealth({ connected: false, stale: true });
  }

  subscribeAllMids(dex?: string): void {
    const sub: Record<string, unknown> = { type: "allMids" };
    if (dex) sub.dex = dex;
    this.trackSubscription(sub);
    this.sendSubscribe(sub);
  }

  subscribeL2Book(
    coin: string,
    options: { nSigFigs?: number; mantissa?: number; fast?: boolean } = {},
  ): void {
    const sub: Record<string, unknown> = {
      type: "l2Book",
      coin: coin.toUpperCase(),
      ...options,
    };
    this.trackSubscription(sub);
    this.sendSubscribe(sub);
  }

  subscribeUserEvents(user: string): void {
    const sub = { type: "userEvents", user: user.toLowerCase() };
    this.trackSubscription(sub);
    this.sendSubscribe(sub);
  }

  /** Force reconnect (used by stale watchdog) */
  reconnect(): void {
    if (this.intentionalClose || !this.ws) return;
    this.ws.close(4000, "reconnect");
  }

  private openSocket(): void {
    if (this.ws && this.ws.readyState === WS_OPEN) return;

    const socket = this.wsFactory(this.url);
    this.ws = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.touchActivity();
      this.setHealth({ connected: true, stale: false, reconnectAttempts: 0 });
      this.resubscribeAll();
      this.startTimers();
    };

    socket.onmessage = (event: MessageEvent) => {
      this.handleRawMessage(String(event.data));
    };

    socket.onerror = () => {
      this.setHealth({ connected: false, stale: true });
    };

    socket.onclose = () => {
      this.clearTimers();
      this.ws = null;
      this.setHealth({ connected: false, stale: true });
      if (!this.intentionalClose && this.autoReconnect) {
        this.scheduleReconnect();
      }
    };
  }

  private handleRawMessage(raw: string): void {
    this.touchActivity();

    if (this.pendingPingAt !== null) {
      const latencyMs = this.now() - this.pendingPingAt;
      this.pendingPingAt = null;
      this.setHealth({ latencyMs });
    }

    const message = parseWsMessage(raw);
    if (!message) return;

    this.onMessage?.(message);

    switch (message.channel) {
      case "allMids":
        this.allMids = (message.data as AllMidsData)?.mids ?? this.allMids;
        break;
      case "l2Book": {
        const book = message.data as WsBookData;
        if (book?.coin) {
          this.l2Books.set(book.coin.toUpperCase(), book);
        }
        break;
      }
      case "user":
        this.userEvents.push(message.data as WsUserEventData);
        break;
      case "pong":
        break;
      default:
        break;
    }

    this.refreshSoilTrip();
  }

  private sendSubscribe(subscription: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WS_OPEN) return;
    this.ws.send(buildSubscribeFrame(subscription));
  }

  private trackSubscription(sub: Record<string, unknown>): void {
    const key = JSON.stringify(sub);
    if (!this.subscriptions.some((s) => JSON.stringify(s) === key)) {
      this.subscriptions.push(sub);
    }
  }

  private resubscribeAll(): void {
    for (const sub of this.subscriptions) {
      this.sendSubscribe(sub);
    }
  }

  private sendPing(): void {
    if (!this.ws || this.ws.readyState !== WS_OPEN) return;
    this.pendingPingAt = this.now();
    this.ws.send(buildPingFrame());
    this.setHealth({ lastPingAt: this.pendingPingAt });
  }

  private startTimers(): void {
    this.clearTimers();
    this.heartbeatTimer = this.setIntervalFn(() => {
      this.sendPing();
    }, this.heartbeatIntervalMs);

    this.staleTimer = this.setIntervalFn(() => {
      this.checkStale();
    }, 1_000);
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      this.clearIntervalFn(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.staleTimer) {
      this.clearIntervalFn(this.staleTimer);
      this.staleTimer = null;
    }
  }

  private checkStale(): void {
    if (!this.health.connected) return;
    const last = this.health.lastMessageAt;
    if (last === null) return;

    const idleMs = this.now() - last;
    if (idleMs > this.staleThresholdMs) {
      this.setHealth({ stale: true });
      this.refreshSoilTrip();
      this.reconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.intentionalClose) return;
    const delay = Math.min(
      WS_RECONNECT_BASE_MS * 2 ** this.reconnectAttempts,
      WS_RECONNECT_MAX_MS,
    );
    this.reconnectAttempts += 1;
    this.setHealth({ reconnectAttempts: this.reconnectAttempts });
    this.reconnectTimer = this.setTimeoutFn(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay);
  }

  private touchActivity(): void {
    this.setHealth({
      lastMessageAt: this.now(),
      stale: false,
    });
  }

  private refreshSoilTrip(): void {
    const tripReasons = evaluateWsTripReasons(this.health);
    this.health.soilTripped = tripReasons.length > 0;
    this.health.tripReasons = tripReasons;
    this.emitHealth();
  }

  private setHealth(patch: Partial<WsHealthSnapshot>): void {
    this.health = { ...this.health, ...patch };
    this.refreshSoilTrip();
  }

  private emitHealth(): void {
    this.onHealthChange?.(this.getHealth());
  }
}

/**
 * Test/mock WebSocket with controllable events and sent-frame capture.
 * Implements the subset of WebSocket used by HyperliquidWsClient.
 */
export class MockWebSocket implements WsLike {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly sent: string[] = [];
  readyState = MockWebSocket.CONNECTING;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  constructor(public readonly url: string) {}

  /** Simulate server accepting connection */
  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({ type: "open" } as Event);
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }

  simulateClose(code = 1006): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ type: "close", code } as CloseEvent);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(code?: number): void {
    this.simulateClose(code ?? 1000);
  }
}

/** Factory helper for tests */
export function createMockWsFactory(
  instances: MockWebSocket[],
): WsFactory {
  return (url: string) => {
    const ws = new MockWebSocket(url);
    instances.push(ws);
    return ws;
  };
}
