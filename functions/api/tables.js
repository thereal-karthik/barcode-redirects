export async function onRequestGet({ env }) {
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
