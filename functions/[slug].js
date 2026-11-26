export async function onRequestGet({ params, env }) {
  const slug = params.slug;
  const target = await env.BARCODE_KV.get(slug);
  if (!target) {
    return new Response("Redirect not found", { status: 404 });
  }
  return Response.redirect(target, 302);
}
