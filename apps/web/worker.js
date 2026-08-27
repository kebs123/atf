/**
 * Cloudflare Worker: SPA assets + same-origin API proxy + runtime Mapbox config.
 * Secrets: API_ORIGIN, MAPBOX_ACCESS_TOKEN. Optional var: MAPBOX_STYLE.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/config.json") {
      return Response.json(
        {
          mapboxAccessToken: String(env.MAPBOX_ACCESS_TOKEN || "").trim(),
          mapboxStyle: String(env.MAPBOX_STYLE || "").trim(),
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (url.pathname === "/health" || url.pathname.startsWith("/api/")) {
      return proxyToApi(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function proxyToApi(request, env) {
  const raw = String(env.API_ORIGIN || "").trim();
  if (!raw) {
    return Response.json(
      { error: "API origin is not configured. Set the Worker secret API_ORIGIN." },
      { status: 503 },
    );
  }

  let origin;
  try {
    origin = new URL(raw);
  } catch {
    return Response.json({ error: "API_ORIGIN is not a valid URL." }, { status: 503 });
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, origin);

  try {
    const res = await fetch(new Request(target, request));
    if (res.status === 530) {
      return Response.json(
        { error: "Cannot reach Vero. The API tunnel may be down." },
        { status: 502 },
      );
    }
    return res;
  } catch {
    return Response.json(
      { error: "Cannot reach Vero. The API tunnel may be down. Try SMS if you have signal." },
      { status: 502 },
    );
  }
}
