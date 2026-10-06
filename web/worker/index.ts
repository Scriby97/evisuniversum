// Cloudflare Worker: liefert die statische Seite aus `out/` aus und zieht nach einer Bestellung
// den Lagerbestand in Sanity ab. Der Schreibschlüssel (SANITY_WRITE_TOKEN) ist ein Secret des
// Workers und gelangt nie in den Browser.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SANITY_WRITE_TOKEN?: string;
}

type StockDoc = { _id: string; _rev: string; stock: number; slug: string };

const API = "https://wg30antz.api.sanity.io/v2026-09-01";
const DATASET = "production";

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/stock") return handleStock(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

export default worker;

async function handleStock(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
  // Nur Aufrufe von der eigenen Seite (hält fremde Websites ab; kein Schutz gegen gezielte Skripte)
  const origin = request.headers.get("Origin");
  if (!origin || new URL(origin).host !== url.host) return json({ error: "forbidden" }, 403);
  if (!env.SANITY_WRITE_TOKEN) return json({ error: "not configured" }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const wanted = parseItems(body);
  if (wanted.size === 0) return json({ updated: [] });

  // Bei gleichzeitigen Bestellungen schlägt die Revisionsprüfung fehl → neu lesen und nochmals versuchen
  for (let attempt = 0; attempt < 3; attempt++) {
    const docs = await trackedDocs([...wanted.keys()], env);
    if (docs.length === 0) return json({ updated: [] });
    const mutations = docs.map((d) => ({
      patch: { id: d._id, ifRevisionID: d._rev, set: { stock: Math.max(0, d.stock - wanted.get(d.slug)!) } },
    }));
    const res = await fetch(`${API}/data/mutate/${DATASET}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.SANITY_WRITE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ mutations }),
    });
    if (res.ok) {
      return json({ updated: docs.map((d) => ({ slug: d.slug, draft: d._id.startsWith("drafts."), stock: Math.max(0, d.stock - wanted.get(d.slug)!) })) });
    }
    if (res.status !== 409) return json({ error: "sanity error", status: res.status }, 502);
  }
  return json({ error: "conflict" }, 409);
}

// Erlaubt nur gültige Kurznamen und Mengen 1–99; gleiche Produkte werden zusammengezählt
function parseItems(body: unknown): Map<string, number> {
  const wanted = new Map<string, number>();
  const items = (body as { items?: unknown })?.items;
  if (!Array.isArray(items)) return wanted;
  for (const item of items.slice(0, 50)) {
    const { slug, quantity } = (item ?? {}) as { slug?: unknown; quantity?: unknown };
    if (typeof slug !== "string" || !/^[a-z0-9-]{1,96}$/.test(slug)) continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) continue;
    wanted.set(slug, Math.min(99, (wanted.get(slug) ?? 0) + quantity));
  }
  return wanted;
}

// Veröffentlichte Produkte und offene Entwürfe (sonst überschreibt Evis nächstes «Publish» den Bestand)
async function trackedDocs(slugs: string[], env: Env): Promise<StockDoc[]> {
  const query = `*[_type == "product" && slug.current in $slugs && defined(stock)]{_id, _rev, stock, "slug": slug.current}`;
  const params = new URLSearchParams({ query, $slugs: JSON.stringify(slugs), perspective: "raw" });
  const res = await fetch(`${API}/data/query/${DATASET}?${params}`, {
    headers: { Authorization: `Bearer ${env.SANITY_WRITE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  return ((await res.json()) as { result: StockDoc[] }).result;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
