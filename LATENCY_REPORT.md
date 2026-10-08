# Etch image-generation latency report

Date: 2026-10-08. Author: CODER 1 (SPEED). Branch: `etch-fast-gen`.

Every number below is labeled **measured** (observed in watcher logs / cron
config / code) or **estimated** (reasoned, not observed). There is no
successful end-to-end generation in the watcher logs from 2026-10-06 →
2026-10-08, so the media-generation and deliver stages cannot be measured
from production history — they are estimated and marked as such.

## Pipeline under test

`POST /api/free/generate` (or `/api/generation/start` for paid) →
`generations` row with `status='queued'` →
`vidish-free-queue` cron agent (every 1 min) fetches ADMIN_TOKEN from the
Vercel API, POSTs `/api/admin/fulfillment/generations/claim` →
for each claimed row: attachments fetch → stage → media-tool image
generation → `watermark.py` preview → POST
`/api/admin/fulfillment/deliver-generation` → watch page (`/watch/[id]`,
polls `/api/gen/[id]/status` every 3s) shows the preview.

## Breakdown

| # | Stage | Time | Source |
|---|-------|------|--------|
| 1 | Order creation: API route → Neon insert of the `generations` row (+ attachments on the multipart path) | **0.5–3s** | **estimated** — one DB round trip; no server-timing instrumentation exists |
| 2 | Claim wait: row sits `queued` until the next `vidish-free-queue` run | **0–60s, mean ~30s** | **measured** — cron `vidish-free-queue` is `interval@1m` (verified via cron.list); run logs 2026-10-06→08 show a claim attempt roughly every 1–3 min. Worst case is a full 60s idle wait |
| 3 | Run startup: cron agent spins up, fetches ADMIN_TOKEN (Vercel env-list + decrypt), then the claim POST | **3–10s** | **estimated** — two Vercel API calls + one site HTTPS POST per run; logs show this succeeds ("auth via Vercel decrypt ok", "claim 200") but never time it |
| 4 | Attachments fetch + stage update | **1–4s** | **estimated** — two small HTTPS round trips |
| 5 | Media generation: the cron agent generates the image with the media pipeline at the row's aspect ratio | **30–90s** | **estimated** — NO successful image generation appears in any watcher log 2026-10-06→08 (only fast failures: `missing_reference`, `content_refused`/`integrity_check_failed`). Range is a conservative estimate for a single AI image render; it is the dominant stage |
| 6 | Watermark: `watermark.py image /tmp/clean.jpg /tmp/preview.jpg` (tiled "Etch" diagonal, PIL, local) | **1–3s** | **estimated** — local CPU work on a ~1MP image |
| 7 | Deliver: POST `/api/admin/fulfillment/deliver-generation` with both files as base64 + DB bytea write + magic-byte validation | **2–10s** | **estimated** — one HTTPS POST with a ~1–2MB JSON body (the deliver endpoint 413s above ~7.8MB; the watcher keeps payloads ≤ ~2MB) plus a bytea UPDATE |
| 8 | Client notice: watch page polls status every 3s | **0–3s** | **measured** — `app/watch/[id]/page.tsx` polls `/api/gen/[id]/status` on a 3s interval |

## Totals (image, free tier)

- **Best case today:** ~35s (row created just before a cron run; fast
  generation). Stages 1+3+4+6+7+8 ≈ 8–23s + a fast ~20–30s render.
- **Typical today:** **~2–4 minutes.** Mean claim wait 30s + run startup
  ~7s + generation ~60s + watermark/deliver ~8s + notice ~2s ≈ 107s,
  plus the long tail: any queue ahead of the row (the claim takes the
  oldest 2 first), one transient 403/edge retry, or a slow render all
  push it past 3 minutes.
- **Worst case today:** 60s claim wait + a render at the slow end + queue
  ahead → **5+ minutes**.

This matches the reported experience ("takes minutes"): the two biggest
knobs are the **0–60s claim wait** (pure scheduling waste) and the fact
that generation cannot begin until the user has finished typing, clicked,
and waited through the poll — none of the typing time is overlapped with
rendering.

## What this branch changes (expected after/after-worker-deploy)

| Change | Effect on the table above |
|--------|---------------------------|
| (b) Instant trigger: order creation writes a `generation_triggers` row; a new 20s `etch-fast-trigger` cron wakes the fulfillment loop on a fresh trigger (1-min poll kept as fallback) | Stage 2 drops from 0–60s (mean 30s) to **0–20s (mean ~10s)**. Nothing else in the pipeline changes |
| (c) Speculative pre-generation: after ~3s of typing idle on `/create` (free images), the current prompt+options hash starts a non-charging speculative render; a matching Generate converts it to a real free row | For a hash hit, stages 2–6 are **already done or in flight** when the user clicks Generate: a `done` speculative row delivers in **~3–8s** (DB convert + status polls); an in-flight row finishes on its original timeline minus the typing overlap. Worst case (hash miss / edited prompt) falls back to the normal flow, i.e. no slower than today |
| Combined best case | **~5–10s** from Generate click to preview (speculative hit + instant trigger converting a done row) |
| Combined typical (no speculation, e.g. paid flow) | ~60–90s instead of ~2–4 min, almost entirely the render itself |

## Honesty notes / gaps

- No production timing exists for stages 1, 3, 4, 5, 6, 7. If the
  supervisor wants hard numbers, instrument the routes with
  `Server-Timing` headers (or log `created_at → claimed_at →
  delivered_at` deltas from the `generations` row timestamps — all three
  are already stored) before and after rollout.
- The media-generation estimate (30–90s) is the least certain number
  here. The first week of post-rollout `delivered_at - updated_at`
  deltas (claim time → deliver time) will replace it with a measured
  distribution.
- Speculative renders cost real media-pipeline spend on prompts the user
  may never submit. Mitigations in this branch: one speculative row per
  user+hash (dedupe), stale speculative rows are deleted by the claim
  endpoint once past TTL, and a new speculative request deletes the
  user's older queued speculative rows. Even so, expect some wasted
  renders — that is the price of the speedup, and it should be watched
  in the first week.
