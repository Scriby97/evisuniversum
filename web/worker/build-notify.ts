// Push-Nachricht aufs Handy (ntfy), wenn ein Cloudflare-Build fehlschlägt – egal ob durch einen Push
// auf GitHub oder durch «Publish» im Studio ausgelöst. Cloudflare legt die Build-Ereignisse in die
// Queue «evisuniversum-builds» (Event Subscription im Dashboard), dieser Worker liest sie aus.
// Secret NTFY_TOPIC im Cloudflare-Dashboard setzen; in der ntfy-App dasselbe Topic abonnieren.

export type BuildEvent = {
  type: string;
  source?: { workerName?: string };
  payload?: {
    buildUuid?: string;
    buildTriggerMetadata?: {
      buildTriggerSource?: string;
      branch?: string;
      commitHash?: string;
      commitMessage?: string;
      author?: string;
    };
  };
  metadata?: { accountId?: string };
};

export type Notification = { title: string; message: string; tags: string[]; priority: number; click?: string };

/** null = keine Nachricht (nur fehlgeschlagene Builds melden) */
export function buildNotification(event: BuildEvent): Notification | null {
  if (!event.type.endsWith(".build.failed")) return null;
  const worker = event.source?.workerName ?? "evisuniversum";
  const trigger = event.payload?.buildTriggerMetadata;
  const commit = [trigger?.commitHash?.slice(0, 7), trigger?.commitMessage?.split("\n")[0]].filter(Boolean).join(" ");
  // Push auf GitHub oder Deploy-Hook (= Evi hat im Studio auf «Publish» geklickt)
  const cause = trigger?.buildTriggerSource === "push_event" ? `Push von ${trigger.author ?? "?"}` : "Änderung im Studio";
  const { accountId } = event.metadata ?? {};
  const buildId = event.payload?.buildUuid;
  return {
    title: `Build fehlgeschlagen: ${worker}`,
    message: [`Auslöser: ${cause}`, commit && `Commit: ${commit}`, "Die Website zeigt weiterhin den letzten funktionierenden Stand."]
      .filter(Boolean)
      .join("\n"),
    tags: ["rotating_light"],
    priority: 4,
    // Tippen auf die Nachricht öffnet das Build-Log im Cloudflare-Dashboard
    click:
      accountId && buildId
        ? `https://dash.cloudflare.com/${accountId}/workers/services/view/${worker}/production/builds/${buildId}`
        : undefined,
  };
}

export async function sendToNtfy(topic: string, n: Notification) {
  // JSON statt Header, damit Umlaute im Titel ankommen
  const res = await fetch("https://ntfy.sh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, ...n }),
  });
  if (!res.ok) throw new Error(`ntfy: ${res.status}`);
}
