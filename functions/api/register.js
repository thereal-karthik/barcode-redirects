export async function onRequestPost({ request, env }) {
  const { password, slug, targetUrl } = await request.json();
  if (!password || password !== env.UPLOAD_PASSWORD) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }
  if (!/^[A-Za-z0-9]{4}$/.test(slug) || !targetUrl.startsWith("https://")) {
    return Response.json({ error: "Invalid slug or URL" }, { status: 400 });
  }
  await env.BARCODE_KV.put(slug, targetUrl);
  return Response.json({ ok: true, shortUrl: `barcode-redirects.pages.dev/${slug}` });
}
