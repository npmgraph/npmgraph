#!/bin/bash
# TEMP-DIAG: surface smoke output as a check annotation
npx vitest run --project smoke > /tmp/smoke.out 2>&1
code=$?
OUT=$(sed 's/\x1b\[[0-9;]*m//g' /tmp/smoke.out | grep -av "EBADDEV" | tail -c 14000 | sed 's/%/%25/g;s/\r//g' | awk '{printf "%s%%0A", $0}')
echo "::warning title=smoke-out::$OUT"
exit $code
