export async function onRequestGet({ params, env }) {
  const slug = params.slug;
  if (!/^[A-Za-z0-9]{4}$/.test(slug)) {
    return env.ASSETS.fetch(new URL("/", "https://placeholder.local"));
  }
  const target = await env.BARCODE_KV.get(slug);
  if (!target) {
    return new Response("Redirect not found", { status: 404 });
  }
  return Response.redirect(target, 302);
}
