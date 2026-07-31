import type { Env } from "../env";

/**
 * GET / and GET /index.html — serve v2 SPA via ASSETS binding.
 * Santenmoku v1 SSR dashboard archived under archive/santenmoku/ui/.
 */
export async function handlePageRequest(
  env: Env,
  request: Request,
): Promise<Response> {
  if (env.ASSETS) {
    return env.ASSETS.fetch(request);
  }

  return new Response(
    "BeDelta Living Water — build SPA with `pnpm run build:spa` before serving.",
    {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    },
  );
}
