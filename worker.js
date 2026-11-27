export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");

    // 1. Handle password-protected slug registration
    if (request.method === "POST" && path === "api/register") {
      const { password, slug, targetUrl } = await request.json();
      if (!password || password !== env.UPLOAD_PASSWORD) {
        return Response.json({ error: "Invalid password" }, { status: 401 });
      }
      if (!/^[A-Za-z0-9]{4}$/.test(slug) || !targetUrl?.startsWith("https://")) {
        return Response.json({ error: "Invalid slug or URL" }, { status: 400 });
      }
      await env.BARCODE_KV.put(slug, targetUrl);
      return Response.json({ ok: true, shortUrl: `${url.host}/${slug}` });
    }

    // 2. Check if a 4-character barcode slug exists in KV
    if (request.method === "GET" && /^[A-Za-z0-9]{4}$/.test(path)) {
      const target = await env.BARCODE_KV.get(path);
      if (target) {
        return Response.redirect(target, 302);
      }
    }

    // 3. Otherwise serve static site files (index.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
