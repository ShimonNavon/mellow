const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-mellow-key",
  "cache-control": "no-store"
};

async function store(env){
  const id = env.VOLUME_DO.idFromName("mac-volume");
  return env.VOLUME_DO.get(id);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/volume") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS });
      }

      if (request.method === "GET") {
        const res = await (await store(env)).fetch("https://volume.internal/get");
        const raw = await res.text();
        return new Response(raw || "null", {
          headers: { ...CORS, "content-type": "application/json" }
        });
      }

      if (request.method === "POST") {
        const key = request.headers.get("x-mellow-key") || "";
        if (!env.MELLOW_KEY || key !== env.MELLOW_KEY) {
          return new Response("unauthorized", { status: 401, headers: CORS });
        }
        let body;
        try {
          body = await request.json();
        } catch {
          return new Response("bad json", { status: 400, headers: CORS });
        }
        const volume = Math.max(0, Math.min(100, Math.round(Number(body.volume))));
        if (!Number.isFinite(volume)) {
          return new Response("bad volume", { status: 400, headers: CORS });
        }
        const payload = JSON.stringify({ volume, muted: !!body.muted, at: Date.now() });
        await (await store(env)).fetch("https://volume.internal/put", { method: "POST", body: payload });
        return new Response("ok", { headers: CORS });
      }

      return new Response("method not allowed", { status: 405, headers: CORS });
    }

    return env.ASSETS.fetch(request);
  }
};

export class VolumeStore {
  constructor(state){
    this.state = state;
  }

  async fetch(request){
    const url = new URL(request.url);
    if (url.pathname === "/get"){
      const latest = await this.state.storage.get("latest");
      return Response.json(latest || null);
    }
    if (url.pathname === "/put"){
      const body = await request.json();
      await this.state.storage.put("latest", body);
      return new Response("ok");
    }
    return new Response("not found", { status: 404 });
  }
}
