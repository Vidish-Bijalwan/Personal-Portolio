#!/usr/bin/env python3
"""Regenerate src/lib/db/migrations-data.ts from drizzle/*.sql.

The SQL is bundled into the serverless function at build time so
migrations run without runtime filesystem access (Vercel functions
do not reliably include the drizzle/ directory, and process.cwd()
is not the project root at runtime).

Regenerate with: python3 -c "exec(open('tools/gen_migrations.py').read())"
(run from the repo root).

Idempotency: entries for migration files already listed in the current
migrations-data.ts are carried over VERBATIM (raw TS-escaped form), so
re-running never drifts old entries. Only genuinely new drizzle/*.sql
files get a freshly escaped entry.
"""
import glob
import os
import re

OUT = "src/lib/db/migrations-data.ts"

HEADER = """/**
 * Embedded DB migrations — generated from drizzle/*.sql.
 *
 * The SQL is bundled into the serverless function at build time so
 * migrations run without runtime filesystem access (Vercel functions
 * do not reliably include the drizzle/ directory, and process.cwd()
 * is not the project root at runtime).
 *
 * Regenerate with: python3 -c "exec(open('tools/gen_migrations.py').read())"
 * (or re-run the generator snippet from the merge agent notes).
 */
"""

TS_STRING = r'"((?:[^"\\]|\\.)*)"'


def ts_escape(s: str) -> str:
    # Order matters: backslashes first, then quotes, tabs, newlines.
    return (
        s.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\r\n", "\n")
        .replace("\t", "\\t")
        .replace("\n", "\\n")
    )


def load_existing(path: str) -> dict:
    """filename -> raw TS string body (still escaped), in file order."""
    if not os.path.isfile(path):
        return {}
    content = open(path, encoding="utf-8").read()
    m_files = re.search(
        r"MIGRATION_FILES:\s*string\[\]\s*=\s*\[(.*?)\];", content, re.S
    )
    m_sql = re.search(
        r"MIGRATION_SQL:\s*string\[\]\s*=\s*\[(.*)\];\s*$", content, re.S
    )
    if not m_files or not m_sql:
        return {}
    files = re.findall(TS_STRING, m_files.group(1))
    sqls = re.findall(TS_STRING, m_sql.group(1), re.S)
    if len(files) != len(sqls):
        raise SystemExit(
            f"refusing to regenerate: {len(files)} file names vs "
            f"{len(sqls)} SQL entries in {path}"
        )
    return dict(zip(files, sqls))


def main() -> None:
    files = sorted(
        f
        for f in (os.path.basename(p) for p in glob.glob("drizzle/*.sql"))
        if os.path.isfile(os.path.join("drizzle", f))
    )
    existing = load_existing(OUT)
    entries = []
    for f in files:
        if f in existing:
            entries.append(existing[f])  # verbatim — never re-escape old SQL
        else:
            raw = open(os.path.join("drizzle", f), encoding="utf-8").read()
            entries.append(ts_escape(raw.rstrip("\n")))
    file_list = ", ".join(f'"{f}"' for f in files)
    out = (
        HEADER
        + f"export const MIGRATION_FILES: string[] = [{file_list}];\n\n"
        + "export const MIGRATION_SQL: string[] = [\n"
        + "".join(f'  "{sql}",\n' for sql in entries)
        + "];\n"
    )
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(out)
    print(f"wrote {OUT} ({len(files)} migrations)")


if __name__ == "__main__":
    main()
