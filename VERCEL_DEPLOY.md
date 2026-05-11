# Deploying to Vercel

Single project. Frontend (Vite) + serverless Python function (FastAPI). No external backend, no API keys.

## TL;DR

```bash
git init
git add .
git commit -m "init"
# Push to GitHub, then:
# Vercel → New Project → Import the repo → Deploy
```

Vercel auto-detects:
- **Framework:** Vite (frontend at root)
- **Build:** `npm run build` → outputs `dist/`
- **API:** `/api/index.py` becomes a Python serverless function (Python 3.12 runtime)

The `vercel.json` at the root rewrites every `/api/*` request to that single function, which routes internally via FastAPI.

## What's where

```
/api/index.py          ← FastAPI app (page-speed, keyword-density, authority)
/api/requirements.txt  ← Python deps (httpx, fastapi, pydantic)
/vercel.json           ← rewrites + per-function memory/timeout
/src                   ← React frontend (Vite)
/public                ← static assets (logo)
/index.html
```

## No environment variables required

Production deployments need **zero** env vars. The frontend hits the same-origin `/api/*` endpoints automatically. No PSI key. No Ahrefs key. No anything.

Optional only:

| Var             | When to set                                   |
| --------------- | --------------------------------------------- |
| `VITE_API_URL`  | Local dev when backend runs on a different port. Leave empty in prod. |

## Function limits we're inside of

- **Memory:** 512 MB (set in `vercel.json`). Default is 1024 MB; we use less because cold starts are faster.
- **Duration:** 30 s (set in `vercel.json`). Hobby tier max is 60 s, default 10 s. 30 s is comfortable for our analyzers (5 to 10 s typical).
- **Bundle size:** Our function is ~25 MB unzipped. Limit is 250 MB. Lots of headroom.

## How the tools work without paid APIs

| Tool                       | Engine                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page Speed**             | We fetch the URL server-side via httpx, time the request, parse the HTML, score on 5 real signals (speed, size, render-blocking, image hygiene, transport). No Google PSI key. Runs under 5 s. |
| **Domain Authority**       | Composite from Tranco rank API (free, no key) + Wayback Machine CDX API (free, no key) + a server-side fetch of the homepage. Returns a 0-100 score with each component visible.                  |
| **Keyword Density**        | Pure client-side. Text never leaves the browser. Same algorithm also exposed at `/api/keyword-density` for API users.                                           |
| **Tech + Non-tech Audit**  | Founder-DM flow. URL form → "founder DMs the report on LinkedIn within 48h". Wire the form to Formspree, HubSpot Forms, or a Google Sheets webhook.                                                |

## Local dev

Two terminals:

```bash
# Terminal 1 — frontend
npm install
npm run dev    # http://localhost:5173

# Terminal 2 — backend
cd api
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
python index.py    # http://localhost:8000

# Frontend .env (root, not /api):
echo "VITE_API_URL=http://localhost:8000" > .env
```

## One-command Vercel local dev (recommended)

```bash
npm i -g vercel
vercel dev
```

That spins up the frontend AND the Python function on a single port (default 3000), exactly like prod. No `VITE_API_URL` needed.

## After your first deploy

1. Add your custom domain in Vercel → Project → Domains.
2. Update `index.html` `og:url` and `<link rel="canonical">` to the prod URL.
3. (Optional) Wire the founder-DM forms to Formspree:
   - Sign up at https://formspree.io
   - Get a form endpoint
   - Update the `onSubmit` in `src/pages/Audit.jsx`, `src/pages/TechnicalAudit.jsx`, and the apply form in `src/pages/Home.jsx` to POST to it.

## Rate limiting (do this before going viral)

The Python function has no rate limit baked in. Before announcing the tools publicly, add one of:

- Vercel WAF rate limit rule (web UI): 60 req/min per IP for `/api/*`.
- Front the function with Cloudflare (free tier) and use their rate-limit rules.

## Verifying the data in production

Every tool exposes the source URLs it pulls from in `_meta` on the JSON response. Open DevTools → Network → click any tool → check the response. Hit the same source URLs yourself to verify the data:

- Tranco: `https://tranco-list.eu/api/ranks/domain/{domain}`
- Wayback: `https://web.archive.org/web/*/{domain}`
- Page source: `view-source:https://{your-url}`
