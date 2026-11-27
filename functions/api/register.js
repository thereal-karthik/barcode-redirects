export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { password, slug, targetUrl, table } = body;

  if (!password || password !== env.UPLOAD_PASSWORD) {
    return Response.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }
  if (!/^[A-Za-z0-9]{4}$/.test(slug) || !targetUrl?.startsWith("https://")) {
    return Response.json({ ok: false, error: "Invalid slug or URL" }, { status: 400 });
  }

  const existing = await env.BARCODE_KV.get(slug);
  if (existing !== null) {
    return Response.json({ ok: false, error: "slug_taken" }, { status: 409 });
  }

  await env.BARCODE_KV.put(slug, targetUrl);
  if (table) {
    await env.BARCODE_KV.put(`table:${slug}`, JSON.stringify(table));
  }

  return Response.json({ ok: true, shortUrl: `${new URL(request.url).host}/${slug}` });
}
