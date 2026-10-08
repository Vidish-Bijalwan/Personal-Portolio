# Deploying the fast-gen worker side (for the supervisor)

The site-side half (trigger writes on order creation, the
`/api/admin/fulfillment/generations/trigger` endpoint, speculative rows)
ships with the site deploy. The worker side below is what wakes the
fulfillment loop within ~20s of an order instead of waiting for the next
1-minute `vidish-free-queue` poll.

## What to deploy

Three files, all in this `worker/` directory of the `etch-fast-gen` branch:

| File | Purpose | Destination |
|------|---------|-------------|
| `trigger-check.py` | Zero-LLM trigger poll: fetches ADMIN_TOKEN via the Vercel surrogate flow, GETs the trigger endpoint, prints `{"trigger": … \| null}`; exit 0 = trigger, 1 = none, 2 = error | `~/workspace/vidish-free-watcher/trigger-check.py` |
| `trigger-cron-body.md` | Verbatim body for the new cron (below) | used once at cron creation, not copied anywhere |
| `DEPLOY.md` | this file | keep with the branch for reference |

**Do NOT modify, restart, or interfere with the live `vidish-free-queue`
cron or any existing file in `~/workspace/vidish-free-watcher/`.** The
existing cron stays enabled unchanged as the fallback.

## Steps

1. **Deploy the site first** (merge the PR, let Vercel deploy). The trigger
   endpoint and the `generation_triggers` table (migration
   `0014_fast_gen.sql`, embedded in `src/lib/db/migrations-data.ts`) must
   be live before the watcher starts polling — otherwise `trigger-check.py`
   exits 2 (404) and the fast cron just reports the blocker each run.
2. Copy the script (new file only — nothing existing is touched):
   ```
   cp worker/trigger-check.py ~/workspace/vidish-free-watcher/trigger-check.py
   chmod +x ~/workspace/vidish-free-watcher/trigger-check.py
   ```
3. Smoke-test the script once by hand (it prints no secrets):
   ```
   python3 ~/workspace/vidish-free-watcher/trigger-check.py; echo "exit=$?"
   ```
   Expect `{"trigger": null}` / exit 1 on an idle queue (or exit 2 with an
   error object if the site deploy isn't live yet — fix the deploy, not
   the script).
4. Create the cron (do not edit `vidish-free-queue`):
   - id: `etch-fast-trigger`
   - mode: `task`, enabled: `true`
   - schedule: `interval@20s`
   - owner: the same goal that owns the existing `vidish-free-queue` cron (copy its owner field)
   - title: `Etch fast generation trigger watcher`
   - body: paste `worker/trigger-cron-body.md` verbatim
   - predicted_connector_permissions: `[]` (no connectors; it uses the
     stored custom.vercel surrogate + the site's x-admin-token header)
5. Verify end-to-end: queue a free generation on the live site, then check
   the new cron's run history — the claim should happen within ~20–40s of
   order creation instead of up to 60s+. The watch page still polls status
   every 3s, unchanged.

## How it behaves

- The 20s cron's first step is the trigger check. **No trigger → the run
  ends immediately** ("no trigger — sleeping") without touching the claim
  endpoint, so idle runs are cheap (one Vercel token fetch + one site GET).
- Trigger present → the run performs the standard claim (limit 2) and the
  full generate → watermark → deliver pipeline, identical to
  `vidish-free-queue`. The claim endpoint atomically consumes the trigger,
  so a racing 1-minute run can never double-process a row
  (`FOR UPDATE SKIP LOCKED` + consumed_at).
- Trigger TTL is 15 minutes (`TRIGGER_TTL_MINUTES`): a stale trigger is
  ignored by the fast path and its row is picked up by the 1-minute poll.
  If the fast cron is ever disabled, behavior degrades gracefully to
  today's 1-minute cadence — nothing breaks.

## Cost note (read before enabling)

This adds ~3 cron-agent runs per minute on top of the existing 1-minute
watcher. Idle runs are small (trigger check only), but it is still ~3x the
agent invocations. If token spend becomes a concern: raise the interval to
`30s` (still 2x faster wakeups than today) or disable the cron — the
1-minute poll remains a complete fallback.

## Rollback

Disable or remove the `etch-fast-trigger` cron. Optionally delete
`~/workspace/vidish-free-watcher/trigger-check.py`. The site keeps writing
trigger rows harmlessly (a tiny table; the claim endpoint consumes them),
and the 1-minute poll continues to fulfill everything as today.

## What this does NOT change

- No change to watermarking, pricing, caps, unlock, or the payment flow.
- Speculative rows (`tier='speculative'`) are claimed and fulfilled by the
  same pipeline; they never consume the free daily cap and can never be
  unlocked (the unlock route only accepts `free` images / `paid` videos).
