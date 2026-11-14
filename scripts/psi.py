"""PageSpeed Insights (Google lab, mobile) for a list of URLs.
Usage: python scripts/psi.py <url> [<url> ...]"""
import json, sys, urllib.parse, urllib.request
for url in sys.argv[1:]:
    q = urllib.parse.urlencode({"url": url, "strategy": "mobile", "category": ["performance", "accessibility", "best-practices", "seo"]}, doseq=True)
    try:
        with urllib.request.urlopen(f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?{q}", timeout=120) as r:
            d = json.load(r)
    except Exception as e:
        print(url, "ERROR", e); continue
    lh = d["lighthouseResult"]; c = lh["categories"]; a = lh["audits"]
    print(url, {k: round((v["score"] or 0) * 100) for k, v in c.items()},
          "LCP", a["largest-contentful-paint"]["displayValue"], "FCP", a["first-contentful-paint"]["displayValue"],
          "CLS", a["cumulative-layout-shift"]["displayValue"], "TBT", a["total-blocking-time"]["displayValue"])
