#!/usr/bin/env bash
# Median Lighthouse mobile performance over N runs: scripts/lh-median.sh <url> [runs=3]
url="$1"; runs="${2:-3}"; out=$(mktemp -d)
curl -s -o /dev/null -H "Accept: text/html" "$url"
for i in $(seq 1 "$runs"); do
  npx -y lighthouse@12 "$url" --quiet --form-factor=mobile --chrome-flags="--headless=new" --output=json --output-path="$out/$i.json" >/dev/null 2>&1
done
python - "$out" "$url" <<'PY'
import json,glob,statistics,sys
rs=[json.load(open(f,encoding='utf-8')) for f in glob.glob(sys.argv[1]+'/*.json')]
p=[r['categories']['performance']['score']*100 for r in rs]
l=[r['audits']['metrics']['details']['items'][0]['largestContentfulPaint'] for r in rs]
print(f"{sys.argv[2]}  perf median {statistics.median(p):.0f} {sorted(round(x) for x in p)}  LCP median {statistics.median(l):.0f}ms")
PY
