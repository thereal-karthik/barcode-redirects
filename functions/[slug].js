export async function onRequestGet(context) {
  const { params, env } = context;
  const slug = params.slug;

  // Pass non-4-character paths through to your static site
  if (!/^[A-Za-z0-9]{4}$/.test(slug)) {
    return context.next();
  }

  if (!env.BARCODE_KV) {
    return new Response("BARCODE_KV binding is missing", { status: 500 });
  }

  const target = await env.BARCODE_KV.get(slug);
  if (!target) {
    return context.next();
  }

  return Response.redirect(target, 302);
}
