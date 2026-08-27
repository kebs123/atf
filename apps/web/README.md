# apps/web

Vite + React frontend for Kebs. Talks to the live Express API. SQLite is not opened from the browser.

**Docs:** [../../FRONTEND.md](../../FRONTEND.md)

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://127.0.0.1:5173 — `/verify` posts `{ "code" }` to `/api/verify`.

```bash
npm run build
npx wrangler deploy
```

Git Worker: branch `frontend`, root directory `apps/web`. Set secrets `API_ORIGIN`, `MAPBOX_ACCESS_TOKEN`, and `MAPBOX_STYLE`.
