export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.password || body.password !== env.UPLOAD_PASSWORD) {
    return Response.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }
  return Response.json({ ok: true });
}
