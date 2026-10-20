#!/usr/bin/env bash
# DTB Technologies — Lead Management System
# Reproducible local database test runner.
#
# Prerequisites: a local PostgreSQL with a Supabase-compatible stub.
# The stub and the RLS suite live in supabase/test/.
#
# Usage:
#   PGPORT=5433 supabase/test/run-local-tests.sh
#
# What it does: resets the public schema, applies the stub + all migrations
# in order, then runs the RLS/authorisation suite. Synthetic records only.
set -euo pipefail

PORT="${PGPORT:-5433}"
PSQL="${PSQL:-psql}"
DB="${DB:-dtb_dev}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "== Resetting schema public in $DB =="
$PSQL -p "$PORT" -U postgres -d "$DB" -v ON_ERROR_STOP=1 -q \
    -c "drop schema if exists public cascade; create schema public;"

echo "== Applying Supabase stub =="
$PSQL -p "$PORT" -U postgres -d "$DB" -v ON_ERROR_STOP=1 -q \
    -f "$HERE/local-stub.sql"

echo "== Applying migrations =="
for f in "$HERE"/../migrations/*.sql; do
    echo "  - $(basename "$f")"
    $PSQL -p "$PORT" -U postgres -d "$DB" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo "== Running RLS/authorisation suite =="
$PSQL -p "$PORT" -U postgres -d "$DB" -v ON_ERROR_STOP=1 \
    -f "$HERE/rls-test.sql" | grep -E "TESTS (PASSED|FAILED)|name.*pass"
