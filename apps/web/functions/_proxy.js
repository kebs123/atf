/**
 * Same-origin proxy so the browser never talks to *.trycloudflare.com
 * (those hostnames expire, and some blockers refuse to resolve them).
 * Set API_ORIGIN on the Pages project: wrangler pages secret put API_ORIGIN
 */
export async function onRequest(context) {
  const raw = String(context.env.API_ORIGIN || "").trim();
  if (!raw) {
    return Response.json(
      { error: "API origin is not configured. Set the API_ORIGIN Pages secret." },
      { status: 503 },
    );
  }

  let origin;
  try {
    origin = new URL(raw);
  } catch {
    return Response.json({ error: "API_ORIGIN is not a valid URL." }, { status: 503 });
  }

  const url = new URL(context.request.url);
  url.protocol = origin.protocol;
  url.hostname = origin.hostname;
  url.port = origin.port;

  try {
    const res = await fetch(new Request(url, context.request));
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
