#!/usr/bin/env python3
"""Etch fast-trigger check (zero-LLM helper for the fast trigger watcher).

Polls GET /api/admin/fulfillment/generations/trigger (x-admin-token) once
and reports whether a fresh, unconsumed trigger exists.

Usage:
    python3 trigger-check.py
    -> prints JSON: {"trigger": {"id","generation_id","created_at"} | null}
    -> exit 0 when a trigger is present, exit 1 when none, exit 2 on error

Auth: ADMIN_TOKEN is fetched fresh from the Vercel API per invocation via
the stored custom.vercel surrogate credential (same pattern as fq.py).
The token lives in-process only: never printed, never persisted, sent only
as the x-admin-token header.

Deploy: copy into ~/workspace/vidish-free-watcher/ (do NOT modify any
existing live file). See DEPLOY.md.
"""
import sys
import json
import time

sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from dynamic_credentials import add_surrogate_to_request

import urllib.request as u
import requests

PROJECT = "prj_IGR9fyUgAmZcJS7K0a55DvmkViN6"
SITE = "https://www.vidish.me"


def vercel_get(path):
    """Vercel API via requests; auth headers copied from the surrogate-signed
    dummy urllib Request (urllib itself dies behind the egress proxy)."""
    req = u.Request("https://api.vercel.com" + path)
    add_surrogate_to_request(req, "custom.vercel", allowed_hosts=("api.vercel.com",))
    headers = dict(req.header_items())
    headers.update(getattr(req, "unredirected_hdrs", {}))
    last = None
    for _ in range(4):
        try:
            r = requests.get("https://api.vercel.com" + path, headers=headers, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            last = e
            time.sleep(3)
    raise last


_token = None


def token():
    global _token
    if _token is None:
        envs = vercel_get(f"/v9/projects/{PROJECT}/env").get("envs", [])
        env_id = next(e["id"] for e in envs if e.get("key") == "ADMIN_TOKEN")
        for qp in ("?decrypt=true", "?decrypted=true"):
            data = vercel_get(f"/v9/projects/{PROJECT}/env/{env_id}{qp}")
            if data.get("value"):
                _token = data["value"]
                break
        if _token is None:
            raise RuntimeError("ADMIN_TOKEN decrypt returned no value")
    return _token


def main():
    try:
        h = {"x-admin-token": token()}
        r = requests.get(
            SITE + "/api/admin/fulfillment/generations/trigger",
            headers=h,
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(json.dumps({"error": f"{type(e).__name__}: {e}"}))
        return 2
    print(json.dumps({"trigger": data.get("trigger")}))
    return 0 if data.get("trigger") else 1


if __name__ == "__main__":
    sys.exit(main())
