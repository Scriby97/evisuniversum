# evi’s universum

Website für evi’s universum – statisch gebaut mit Next.js, Inhalte in Sanity, Bestellungen per Formular (Web3Forms).

- `web/` – die Website (Next.js, statischer Export nach `web/out`)
- `studio/` – Sanity Studio, in dem Evi Texte, Produkte und Events pflegt

## Lokal starten

```bash
cd web && npm install && npm run dev      # http://localhost:3000
cd studio && npm install && npm run dev   # http://localhost:3333
```

Ohne `.env.local` zeigt die Website Platzhalter-Inhalte.

## Einrichtung (einmalig)

Sanity-Projekt: `wg30antz`, Dataset `production` (Project ID steht in `studio/sanity.config.ts` und `web/.env.local`).

1. **Studio veröffentlichen:** `cd studio && npx sanity login && npm run deploy` → https://evisuniversum.sanity.studio.
2. **Evi einladen:** sanity.io/manage → Projekt → Members.
3. **Web3Forms:** auf https://web3forms.com mit evis.universum@gmx.ch einen Access Key erstellen → `NEXT_PUBLIC_WEB3FORMS_KEY`.
4. **Cloudflare Pages:** Repo verbinden, Root directory `web`, Build command `npm run build`,
   Output directory `out`, die drei `NEXT_PUBLIC_*` Variablen setzen.
5. **Automatisch neu bauen:** in Cloudflare Pages einen *Deploy Hook* erstellen und dessen URL in Sanity
   (API → Webhooks) als Webhook eintragen. Nach jedem «Publish» ist die Seite in 1–2 Minuten aktuell.

## Vor dem Livegang

- Strasse in der Adresse ergänzen (Studio → Website-Einstellungen → Kontakt & Rechtliches)
- AGB und Datenschutzerklärung (`web/src/app/datenschutz/page.tsx`) prüfen – das sind Vorlagen
- Versandkosten, FAQ-Antworten, Logo, Bilder
