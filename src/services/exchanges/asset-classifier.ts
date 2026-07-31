/**
 * Hyperliquid asset classification — TradFi keyword aliases (not data filters).
 * Keyword tables only map canonical names / buckets; full xyz universe is still included.
 * Used to keep metaAndAssetCtxs crypto-only; live TradFi prices come from allMids.
 */

export type AssetClass =
  | "commodity"
  | "stock"
  | "index"
  | "fx"
  | "preipo"
  | "crypto"
  | "unknown";

export type TradFiBucket = Exclude<AssetClass, "crypto" | "unknown">;

/** Alias → canonical key. Commodities = closed oil / precious-metals set only. */
const COMMODITY_KEYWORD_KEYS: ReadonlyArray<readonly [string, string]> = [
  ["BRENTOIL", "brent"],
  ["WTIOIL", "wti"],
  ["NATGAS", "natgas"],
  ["PALLADIUM", "palladium"],
  ["PLATINUM", "platinum"],
  ["ALUMINIUM", "aluminium"],
  ["ALUMINUM", "aluminium"],
  ["COPPER", "copper"],
  ["SILVER", "silver"],
  ["URNM", "urnm"],
  ["BRENT", "brent"],
  ["GOLD", "gold"],
  ["WTI", "wti"],
];

/** Optional stock ticker aliases — unknown xyz equities still land in Stocks via catch-all */
const STOCK_KEYWORD_KEYS: ReadonlyArray<readonly [string, string]> = [
  ["SKHYNIX", "skhynix"],
  ["SAMSUNG", "samsung"],
  ["SSNHY", "samsung"],
  ["SMSN", "smsn"],
  ["GOOGL", "googl"],
  ["GOOG", "goog"],
  ["MSFT", "msft"],
  ["INTC", "intc"],
  ["CRCL", "crcl"],
  ["AAPL", "aapl"],
  ["TSLA", "tsla"],
  ["META", "meta"],
  ["AMZN", "amzn"],
  ["TSMC", "tsmc"],
  ["SNDK", "sndk"],
  ["DRAM", "dram"],
  ["NVDA", "nvda"],
  ["SKHY", "skhynix"],
  ["AMD", "amd"],
  ["TSM", "tsm"],
  ["MU", "mu"],
];

const INDEX_KEYWORD_KEYS: ReadonlyArray<readonly [string, string]> = [
  ["XYZ100", "xyz100"],
  ["S&P500", "sp500"],
  ["SP500", "sp500"],
  ["US500", "us500"],
  ["JP225", "jp225"],
  ["KR200", "kr200"],
  ["NDX", "xyz100"],
  ["QQQ", "qqq"],
];

const FX_KEYWORD_KEYS: ReadonlyArray<readonly [string, string]> = [
  ["USDJPY", "usdjpy"],
  ["EURUSD", "eurusd"],
  ["GBPUSD", "gbpusd"],
  ["USDKRW", "usdkrw"],
  ["DXY", "dxy"],
];

const FX_SINGLE_CCY: ReadonlyArray<readonly [string, string]> = [
  ["EUR", "eurusd"],
  ["GBP", "gbpusd"],
  ["JPY", "usdjpy"],
  ["KRW", "usdkrw"],
];

/**
 * Highlight / forced Pre-IPO aliases — NOT a data-source filter.
 * Used for UI badges + canonical preipo bucket placement when ticker lacks PRE-IPO in name.
 */
export const PRE_IPO_HIGHLIGHT_TICKERS = ["CXMT", "QNT"] as const;

/** @deprecated use PRE_IPO_HIGHLIGHT_TICKERS — kept for import compatibility */
export const PRE_IPO_WHITELIST = PRE_IPO_HIGHLIGHT_TICKERS;

export interface ClassifiedAsset {
  rawName: string;
  normalizedSymbol: string;
  assetClass: AssetClass;
  tradFiKey?: string;
}

export interface TradFiPlacement {
  category: TradFiBucket;
  key: string;
  hlSymbol: string;
  /** Matched via highlight alias table (UI badge), not a fetch filter */
  isHighlight?: boolean;
}

function findKeywordKey(
  upperName: string,
  table: ReadonlyArray<readonly [string, string]>,
): string | undefined {
  for (const [keyword, key] of table) {
    if (keyword === "MU") {
      if (/(?:^|[^A-Z0-9])MU(?:[^A-Z0-9]|$)/.test(upperName)) return key;
      continue;
    }
    if (keyword === "GOLD") {
      if (
        upperName.includes("GOLD") &&
        !upperName.includes("GOLDMAN") &&
        !upperName.includes("GOLDFISH") &&
        !upperName.includes("GOOGL") &&
        !upperName.includes("GOOG")
      ) {
        return key;
      }
      continue;
    }
    if (keyword === "TSM") {
      if (/(?:^|[^A-Z0-9])TSM(?:[^A-Z0-9]|$)/.test(upperName)) return key;
      continue;
    }
    if (keyword === "NDX") {
      if (/(?:^|[^A-Z0-9])NDX(?:[^A-Z0-9]|$)/.test(upperName)) return key;
      continue;
    }
    if (upperName.includes(keyword)) return key;
  }
  return undefined;
}

function isPreIpoName(upper: string): boolean {
  return (
    upper.includes("PRE-IPO") ||
    upper.includes("PREIPO") ||
    upper.includes("PRE_IPO") ||
    /PRE[\s_-]?IPO/.test(upper)
  );
}

export function normalizeTradFiBody(rawName: string): string {
  let upper = String(rawName ?? "").trim().toUpperCase();
  upper = upper.replace(/&/g, "");
  upper = upper.replace(
    /^(XYZ|HIP3|FLAUNCH|XYZDEX|UNIT|CASH)[:/\-_]+/i,
    "",
  );
  const xyzIdx = upper.indexOf("XYZ:");
  if (xyzIdx >= 0) upper = upper.slice(xyzIdx + 4);
  upper = upper.replace(/[-_/]USDC$/i, "");
  upper = upper.replace(/[-_/]USD$/i, "");
  return upper.trim();
}

export function isXyzOrHip3Key(rawName: string): boolean {
  const k = String(rawName ?? "").trim().toUpperCase();
  // Require delimiter after XYZ so bare "XYZ100" is not treated as a venue prefix
  return (
    /^(XYZ|HIP3|FLAUNCH|XYZDEX)[:/\-_]/i.test(k) || k.includes("XYZ:")
  );
}

function hlBodySymbol(rawName: string): string {
  const normalized = normalizeTradFiBody(rawName);
  const parts = normalized.split(/[^A-Z0-9]+/).filter(Boolean);
  return parts[parts.length - 1] ?? normalized;
}

function preIpoPayloadKey(bodyUpper: string): string {
  const body = bodyUpper
    .replace(/PRE[\s_-]?IPO/g, " ")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
  const parts = body.split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] || parts[0] || "preipo").toLowerCase();
}

function isPreIpoHighlight(normalized: string): string | undefined {
  for (const sym of PRE_IPO_HIGHLIGHT_TICKERS) {
    if (normalized === sym || normalized.endsWith(sym)) return sym.toLowerCase();
  }
  return undefined;
}

export interface PlaceTradFiOptions {
  /**
   * When true (xyz dex meta universe), every unmatched ticker catch-alls to Stocks.
   * When false (merged allMids), only xyz:/HIP3-prefixed keys catch-all — plain BTC stays crypto.
   */
  assumeTradFiUniverse?: boolean;
}

/**
 * Place any TradFi / xyz asset into a panel bucket.
 * Keyword tables are aliases only — unmatched TradFi tickers catch-all to Stocks.
 * Returns null only for plain crypto when assumeTradFiUniverse is false.
 */
export function placeTradFiAsset(
  rawName: string,
  opts?: PlaceTradFiOptions,
): TradFiPlacement | null {
  const trimmed = String(rawName ?? "").trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  const bodyUpper = normalizeTradFiBody(trimmed);
  const hlSymbol = hlBodySymbol(trimmed);
  const catchAll =
    opts?.assumeTradFiUniverse === true || isXyzOrHip3Key(trimmed);

  if (isPreIpoName(upper) || isPreIpoName(bodyUpper)) {
    return {
      category: "preipo",
      key: preIpoPayloadKey(bodyUpper),
      hlSymbol,
    };
  }

  const highlightKey = isPreIpoHighlight(bodyUpper);
  if (highlightKey) {
    return {
      category: "preipo",
      key: highlightKey,
      hlSymbol: highlightKey.toUpperCase(),
      isHighlight: true,
    };
  }

  const indexKey =
    findKeywordKey(upper, INDEX_KEYWORD_KEYS) ??
    findKeywordKey(bodyUpper, INDEX_KEYWORD_KEYS);
  if (indexKey) {
    return { category: "index", key: indexKey, hlSymbol };
  }

  for (const [ccy, fxKey] of FX_SINGLE_CCY) {
    if (bodyUpper === ccy) {
      return { category: "fx", key: fxKey, hlSymbol: ccy };
    }
  }

  const fxKey =
    findKeywordKey(upper, FX_KEYWORD_KEYS) ??
    findKeywordKey(bodyUpper, FX_KEYWORD_KEYS);
  if (fxKey) {
    return { category: "fx", key: fxKey, hlSymbol };
  }

  // WTI listed as CL on HL xyz
  if (bodyUpper === "CL") {
    return { category: "commodity", key: "wti", hlSymbol: "CL" };
  }
  if (bodyUpper === "BRENTOIL" || bodyUpper.includes("BRENTOIL")) {
    return { category: "commodity", key: "brent", hlSymbol: "BRENTOIL" };
  }

  const commodityKey =
    findKeywordKey(upper, COMMODITY_KEYWORD_KEYS) ??
    findKeywordKey(bodyUpper, COMMODITY_KEYWORD_KEYS);
  if (commodityKey) {
    return { category: "commodity", key: commodityKey, hlSymbol };
  }

  const stockKey =
    findKeywordKey(upper, STOCK_KEYWORD_KEYS) ??
    findKeywordKey(bodyUpper, STOCK_KEYWORD_KEYS);
  if (stockKey) {
    return { category: "stock", key: stockKey, hlSymbol };
  }

  // Full-universe catch-all: remaining TradFi tickers → Stocks (never dropped)
  if (catchAll) {
    const key = hlSymbol.replace(/[^A-Z0-9]/gi, "").toLowerCase();
    if (!key || key.length < 1) return null;
    return { category: "stock", key, hlSymbol };
  }

  return null;
}

/**
 * Classify HL universe / mid key names.
 * TradFi never enters crypto funding / Rule A paths.
 */
export function classifyHyperliquidAsset(rawName: string): ClassifiedAsset {
  const trimmed = rawName.trim();
  const placement = placeTradFiAsset(trimmed);

  if (placement) {
    return {
      rawName: trimmed,
      normalizedSymbol: trimmed,
      assetClass: placement.category,
      tradFiKey: placement.key,
    };
  }

  let body = trimmed;
  if (body.startsWith("@")) body = body.slice(1);

  return {
    rawName: trimmed,
    normalizedSymbol: body.toUpperCase(),
    assetClass: "crypto",
  };
}

export function isTradFiAsset(name: string): boolean {
  const c = classifyHyperliquidAsset(name);
  return c.assetClass !== "crypto";
}

/** Infer TradFi bucket — null only for plain crypto. */
export function inferTradFiCategory(rawName: string): TradFiBucket | null {
  return placeTradFiAsset(rawName)?.category ?? null;
}

/** @deprecated use isTradFiAsset */
export function isXyzAsset(name: string): boolean {
  return name.toUpperCase().includes("XYZ:") || isTradFiAsset(name);
}
