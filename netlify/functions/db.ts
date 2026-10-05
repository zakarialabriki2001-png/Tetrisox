import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

// Shared app state, previously kept in db-store.json by the Express server.
// Stored as a single JSON document in Netlify Blobs. Until the first save, the
// bundled snapshot in public/seed/db-store.json is served instead.
const STATE_KEY = "state";
const SEED_PATH = "/seed/db-store.json";

const store = () => getStore({ name: "app-db", consistency: "strong" });

const loadState = async (req: Request): Promise<any> => {
  const saved = await store().get(STATE_KEY, { type: "json" });
  if (saved) return saved;
  const res = await fetch(new URL(SEED_PATH, req.url));
  return res.ok ? res.json() : {};
};

// Smart merge carried over from the original server so concurrent clients don't drop finished results.
const mergeState = (serverData: any, clientData: any) => {
  const clientMatches = clientData.matches || {};
  const serverMatches = serverData.matches || {};
  const mergedMatches = { ...serverMatches };

  Object.entries(clientMatches).forEach(([id, clientM]: [string, any]) => {
    if (!clientM) return;
    const existingM = serverMatches[id];
    if (!existingM) {
      mergedMatches[id] = clientM;
      return;
    }
    const clientIsFinished =
      clientM.status === "FINISHED" || (clientM.ft_home !== null && clientM.ft_home !== undefined);
    const serverIsFinished =
      existingM.status === "FINISHED" || (existingM.ft_home !== null && existingM.ft_home !== undefined);

    mergedMatches[id] =
      !clientIsFinished && serverIsFinished ? { ...clientM, ...existingM } : { ...existingM, ...clientM };
  });

  const mergedSignals = { ...(serverData.signals || {}), ...(clientData.signals || {}) };
  const mergedSignalsV2 = { ...(serverData.signals_v2 || {}), ...(clientData.signals_v2 || {}) };

  const clientStats = clientData.global_stats || {};
  const serverStats = serverData.global_stats || {};

  const slipsMap = new Map<string, any>();
  [...(serverData.archived_slips || []), ...(clientData.archived_slips || [])].forEach((s: any) => {
    if (s && s.id) slipsMap.set(s.id, s);
  });
  const mergedSlips = Array.from(slipsMap.values());

  const mergedData: any = {
    matches: mergedMatches,
    signals: mergedSignals,
    signals_v2: mergedSignalsV2,
    global_stats: {
      total_picks: Math.max(serverStats.total_picks || 0, clientStats.total_picks || 0),
      correct_picks: Math.max(serverStats.correct_picks || 0, clientStats.correct_picks || 0),
      win_rate: clientStats.win_rate !== undefined ? clientStats.win_rate : serverStats.win_rate || 0,
      daily_history: { ...(serverStats.daily_history || {}), ...(clientStats.daily_history || {}) },
    },
    archived_slips: mergedSlips,
    active_strategy: clientData.active_strategy || serverData.active_strategy || "BALANCED",
    calibration_modifiers: {
      ...(serverData.calibration_modifiers || {}),
      ...(clientData.calibration_modifiers || {}),
    },
    strategy_history: {
      ...(serverData.strategy_history || {}),
      ...(clientData.strategy_history || {}),
    },
  };

  mergedData.system_telemetry = {
    last_sync: new Date().toISOString(),
    payload_size_bytes: new TextEncoder().encode(JSON.stringify(mergedData)).length,
    total_matches: Object.keys(mergedMatches).length,
    total_signals: Object.keys(mergedSignals).length,
    total_slips: mergedSlips.length,
    sync_type: "LOCAL_STORE",
    healed_records_detected:
      clientData.system_telemetry?.healed_records_detected ||
      serverData.system_telemetry?.healed_records_detected ||
      false,
    active_strategy: mergedData.active_strategy,
    operations_count: (serverData.system_telemetry?.operations_count || 0) + 1,
  };

  return mergedData;
};

export default async (req: Request) => {
  if (new URL(req.url).pathname === "/api/health") {
    return Response.json({ status: "ok" });
  }

  if (req.method === "GET") {
    try {
      // Stream the stored document: the state can exceed the buffered response size limit.
      const saved = await store().get(STATE_KEY, { type: "stream" });
      if (saved) {
        return new Response(saved, { headers: { "Content-Type": "application/json" } });
      }
      return Response.redirect(new URL(SEED_PATH, req.url), 302);
    } catch (e) {
      console.error("Failed to read database state:", e);
      return Response.json({ error: "Failed to read database state" }, { status: 500 });
    }
  }

  if (req.method === "POST") {
    let clientData: any;
    try {
      clientData = await req.json();
    } catch {
      clientData = null;
    }
    if (!clientData || typeof clientData !== "object") {
      return Response.json({ error: "Payload must be a valid JSON object" }, { status: 400 });
    }
    try {
      const mergedData = mergeState(await loadState(req), clientData);
      await store().setJSON(STATE_KEY, mergedData);
      return Response.json({ success: true, count: Object.keys(mergedData.matches).length });
    } catch (e) {
      console.error("Error updating centralized matches db store:", e);
      return Response.json({ error: "Failed to save database state" }, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/db", "/api/health"],
};
