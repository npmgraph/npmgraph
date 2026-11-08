#!/bin/bash
# TEMP-DIAG: surface smoke output as a check annotation
npx vitest run --project smoke > /tmp/smoke.out 2>&1
code=$?
OUT=$(sed 's/\x1b\[[0-9;]*m//g' /tmp/smoke.out | grep -v "EBADDEV" | tail -c 14000 | sed 's/%/%25/g;s/\r//g' | awk '{printf "%s%%0A", $0}')
echo "::warning title=smoke-out::$OUT"
head -c 3000 /tmp/smoke.out | sed 's/\x1b\[[0-9;]*m//g' | sed 's/%/%25/g' | awk '{printf "%s%%0A", $0}' | sed 's/^/::notice title=smoke-head::/'
echo
exit $code
