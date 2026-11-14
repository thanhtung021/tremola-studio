"""Summarize Lighthouse JSON reports: category scores, key metrics, failing audits.

Usage: python scripts/lh-summary.py <report.json> [...]
"""
import json
import sys

for path in sys.argv[1:]:
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    cats = {k: round((v["score"] or 0) * 100) for k, v in d["categories"].items()}
    a = d["audits"]
    print(f"== {d['finalDisplayedUrl']}")
    print(
        "  ",
        cats,
        "| LCP",
        a["largest-contentful-paint"]["displayValue"],
        "| CLS",
        a["cumulative-layout-shift"]["displayValue"],
        "| TBT",
        a["total-blocking-time"]["displayValue"],
        "| FCP",
        a["first-contentful-paint"]["displayValue"],
    )
    for k, v in a.items():
        if v.get("score") is None or v["scoreDisplayMode"] in ("informative", "manual", "notApplicable"):
            continue
        if v["score"] < 0.9:
            dv = v.get("displayValue", "")
            print(f"   - {k}: {v['title']} {dv}")
