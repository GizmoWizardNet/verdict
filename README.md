# Verdict — search the change

A community-voted search engine. SearXNG supplies relevance-ranked results;
Verdict blends that with upvotes/downvotes from signed-in users to produce a
combined score, promotes results the community has vetted, and lets anyone
manually index a site that search missed.

## Stack

- **Frontend/backend**: SvelteKit + TypeScript (single Node app, SSR + API routes)
- **Search backend**: self-hosted SearXNG (JSON API, internal-only)
- **Database/auth**: Supabase (hosted, not self-hosted) — Postgres + RLS + OAuth
- **Icons**: lucide-svelte, plus 4 custom SVGs (see `src/lib/icons/`)
- **Containers**: Docker Compose (app + SearXNG + Cloudflared, one bridge network)
- **Public exposure**: Cloudflare Tunnel — **no ports are opened on the VPS at all**
- **Hardware target**: Oracle Cloud "Always Free" Ampere A1 VPS (ARM, 4 OCPU / 24GB is the free-tier ceiling — 2 OCPU / 12GB is plenty for this)

## Project layout

```
verdict/
├── src/
│   ├── routes/                 # pages + /api/* endpoints
│   ├── lib/
│   │   ├── components/         # SearchBar, ResultCard, VoteButtons, Navbar, AuthPanel
│   │   ├── icons/               # 4 custom SVG icons (see below)
│   │   ├── server/              # searxng.ts, ranking.ts, opengraph.ts, supabaseAdmin.ts
│   │   ├── stores/auth.ts
│   │   └── styles/global.css    # Aero-glass design system
│   └── hooks.server.ts          # Supabase session on every request
├── supabase/schema.sql          # run this once in the Supabase SQL editor
├── searxng/settings.yml         # enables SearXNG's JSON API, internal-only
├── docker/Dockerfile
├── docker-compose.yml
└── .env.example
```

## Custom icons — what to actually design

Everything else uses `lucide-svelte`. These four are brand-specific and are
already implemented as inline SVGs in `src/lib/icons/`, but if you want a
designer to redo them as polished assets, here's what each is for:

1. **VerdictMark** — the logo. A checkmark rendered as a gavel strike inside a
   glass roundel ("verdict reached"). Used in the navbar and favicon.
2. **CommunityRankedBadge** — a small faceted gem/ribbon shown on result cards
   once a site has enough votes to be promoted (avoid a generic star/trophy —
   it should read as a Verdict-specific signal, not a rating average).
3. **UnratedSpark** — a four-point twinkle shown on brand-new, unvoted results,
   framed as an invitation ("be first to rate this") rather than a warning icon.
4. **GlassOrbLoader** — the loading spinner: an Aero glass orb with an orbiting
   highlight, matching the drifting background orbs instead of a generic ring.

## Ranking algorithm (already implemented, `src/lib/server/ranking.ts`)

```
finalScore = (searxngScoreNormalized * 0.4 + communityScore * 0.6) * unratedBoost
```

- `communityScore` is a Wilson-lower-bound of upvotes/downvotes (95% CI) — this
  is the standard fix for "10 upvotes/0 downvotes" incorrectly beating
  "400 upvotes/20 downvotes" under naive averaging.
- `unratedBoost` starts at 1.35x for a 0-vote site and decays smoothly to 1.0x
  by ~12 total votes — enough visibility to get discovered and rated, without
  permanently distorting rankings.
- Results flagged `isCommunityRanked` (≥5 votes, Wilson score ≥0.65) are always
  sorted above non-ranked results, per the brief.

Tune the two weight constants and thresholds at the top of that file if you
want the community to matter more/less relative to raw SearXNG relevance.

---

## 1. Set up Supabase (hosted)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, run it.
3. Go to **Authentication → Providers**:
   - Enable **Google**: create an OAuth client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), authorized redirect URI is the one Supabase shows you on that provider's config page (`https://YOUR-PROJECT.supabase.co/auth/v1/callback`). Paste the client ID/secret back into Supabase.
   - Enable **Discord**: create an app at the [Discord Developer Portal](https://discord.com/developers/applications) → OAuth2, add the same Supabase callback URL as a redirect, paste client ID/secret into Supabase.
4. In **Authentication → URL Configuration**, set your production URL (e.g. `https://verdict.yourdomain.com`) as the Site URL, and add `https://verdict.yourdomain.com/auth/callback` as an additional redirect URL.
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server only)

## 2. Provision the Oracle Ampere A1 VPS

1. In OCI Console: **Compute → Instances → Create Instance**. Choose the
   **Ampere (ARM) A1.Flex** shape, 2 OCPU / 12GB RAM is enough (well inside the
   Always Free 4 OCPU / 24GB total). Ubuntu 22.04 or 24.04 image.
2. You do **not** need to open any ingress ports in the VPS's security list /
   Network Security Group for the app itself — Cloudflare Tunnel makes an
   outbound-only connection, so the default "deny all inbound" is fine. You
   only need outbound internet access, which is on by default.
3. SSH in and install Docker:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER
   newgrp docker
   sudo apt install -y docker-compose-plugin
   ```

## 3. Set up the Cloudflare Tunnel

1. In the [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/) (your domain must already be on Cloudflare): **Networks → Tunnels → Create a tunnel** → choose **Cloudflared**, name it `verdict`.
2. Copy the tunnel token shown (a long string) — this goes in your `.env` as `CLOUDFLARE_TUNNEL_TOKEN`.
3. Under **Public Hostname**, add a route: hostname `verdict.yourdomain.com` → Service `http://verdict-app:3000` (this matches the Docker Compose service name/port — Cloudflared reaches it over the internal `verdict-net` Docker network, nothing is exposed on the host).
4. Save. Cloudflare will handle TLS/HTTPS automatically.

## 4. Deploy

```bash
git clone <your-repo-url> verdict && cd verdict
cp .env.example .env
nano .env   # fill in PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY,
            # SUPABASE_SERVICE_ROLE_KEY, and add CLOUDFLARE_TUNNEL_TOKEN=...

# Generate a real SearXNG secret key and drop it into searxng/settings.yml:
openssl rand -hex 32
nano searxng/settings.yml   # paste it in as server.secret_key

docker compose up -d --build
docker compose logs -f      # watch startup; ctrl-C to stop tailing
```

Visit `https://verdict.yourdomain.com` — you should see the search page.
Sign in with Google or Discord to confirm OAuth works, run a search to confirm
SearXNG is reachable, and cast a vote to confirm Supabase writes are working.

## 5. Day-2 operations

- **Update the app**: `git pull && docker compose up -d --build verdict-app`
- **Update SearXNG**: `docker compose pull searxng && docker compose up -d searxng`
- **Logs**: `docker compose logs -f verdict-app` / `searxng` / `cloudflared`
- **Backups**: Supabase is hosted, so your data (sites/votes) is already backed
  up by Supabase; the only local state worth snapshotting is `searxng/settings.yml`
  and your `.env` (store the latter somewhere safe, never in git).
- **Scaling search engines**: SearXNG's own `settings.yml` controls which
  underlying engines (Google, Bing, DuckDuckGo, etc.) it federates — add/remove
  under a top-level `engines:` block per [SearXNG's docs](https://docs.searxng.org/admin/settings/settings_engines.html) if you want to tune source coverage.

## Local development

```bash
npm install
cp .env.example .env   # point SEARXNG_BASE_URL at a local SearXNG, or run
                        # `docker compose up searxng` and use http://localhost:8080
npm run dev
```

Note: for local dev, either run SearXNG via `docker compose up searxng -d`
(and publish its port in a local override file) or point `SEARXNG_BASE_URL`
at any SearXNG instance with `formats: [html, json]` enabled.
