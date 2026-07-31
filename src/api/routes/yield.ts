import { parseIngressChain, queryYieldTriangle } from "../../services/yield-router";

const SYMBOL_PATTERN = /^[A-Za-z0-9]{2,12}$/;

/**
 * GET /api/yield/triangle?symbol=ETH&ingressChain=SOLANA|ARBITRUM
 * Read-path yield triangle with 2PC gate status.
 */
export async function handleYieldTriangleRequest(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const rawSymbol = url.searchParams.get("symbol") ?? "ETH";
  const symbol = rawSymbol.trim().toUpperCase();
  const ingressChain = parseIngressChain(url.searchParams.get("ingressChain"));

  if (!SYMBOL_PATTERN.test(symbol)) {
    return Response.json(
      { error: "INVALID_SYMBOL", symbol: rawSymbol },
      { status: 400 },
    );
  }

  try {
    const payload = await queryYieldTriangle(symbol, { ingressChain });
    return Response.json(payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=5",
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: "YIELD_TRIANGLE_FAILED",
        symbol,
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
