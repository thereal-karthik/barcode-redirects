export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");

    // 1. POST /api/register: Verify password, reserve unique slug, store redirect + table
    if (request.method === "POST" && path === "api/register") {
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

      // Check if slug already exists so index.html can retry if taken
      const existing = await env.BARCODE_KV.get(slug);
      if (existing !== null) {
        return Response.json({ ok: false, error: "slug_taken" }, { status: 409 });
      }

      // Save redirect URL under <slug>
      await env.BARCODE_KV.put(slug, targetUrl);

      // Save uploaded table object under table:<slug> if provided
      if (table) {
        await env.BARCODE_KV.put(`table:${slug}`, JSON.stringify(table));
      }

      return Response.json({ ok: true, shortUrl: `${url.host}/${slug}` });
    }

    // 2. GET /api/tables: Return all uploaded tables stored in KV
    if (request.method === "GET" && path === "api/tables") {
      const list = await env.BARCODE_KV.list({ prefix: "table:" });
      const tables = [];
      for (const key of list.keys) {
        const raw = await env.BARCODE_KV.get(key.name);
        if (raw) {
          try {
            tables.push(JSON.parse(raw));
          } catch {}
        }
      }
      return Response.json({ tables });
    }

    // 3. GET /<4-char-slug>: Instant 302 barcode redirect
    if (request.method === "GET" && /^[A-Za-z0-9]{4}$/.test(path)) {
      const target = await env.BARCODE_KV.get(path);
      if (target) {
        return Response.redirect(target, 302);
      }
    }

    // 4. Otherwise serve static site files from cloudflare-deploy/
    return env.ASSETS.fetch(request);
  }
};
