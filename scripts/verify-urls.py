import json, os, re, sys
ROOT = "/Users/bhushan/Downloads/RankedTag Webiste/ranktag-website"
DIST = os.path.join(ROOT, "dist")
cfg = json.load(open(os.path.join(ROOT, "vercel.json")))
inv = json.load(open(os.path.join(ROOT, "url-inventory.json")))

redirects = {r["source"]: r for r in cfg["redirects"] if not r.get("has")}
rewrites  = [r["source"] for r in cfg["rewrites"]]

def built(path):
    p = path.strip("/")
    for cand in ([os.path.join(DIST, "index.html")] if p == "" else
                 [os.path.join(DIST, p, "index.html"), os.path.join(DIST, p)]):
        if os.path.isfile(cand): return cand
    return None

def server_route(path):
    for r in rewrites:
        rx = "^" + re.escape(r).replace("\\:path\\*", ".*").replace(":path\\*", ".*").replace(":slug", "[^/]+").replace(":path", ".*") + "$"
        if re.match(rx, path): return True
    return False

fails, warns = [], []

# 1 + 4: every inventory URL still resolves, and redirects are one hop
for u in inv["urls"]:
    p = u["url"]
    if u["kind"] == "legacy-redirect":
        r = redirects.get(p)
        if not r: fails.append(f"[1] inventory redirect {p} missing from vercel.json"); continue
        dest = r["destination"]
        if dest in redirects: fails.append(f"[4] CHAIN: {p} -> {dest} -> {redirects[dest]['destination']}")
        if not (built(dest) or server_route(dest)): fails.append(f"[1] {p} redirects to dead {dest}")
    elif u["kind"] in ("endpoint", "app-noindex"):
        if not (server_route(p) or built(p) or os.path.isfile(os.path.join(DIST, p.lstrip('/')))):
            fails.append(f"[1] endpoint {p} unresolvable")
    elif u["kind"] == "blog-post":
        if not server_route(p): fails.append(f"[1] blog {p} unresolvable")
    else:  # marketing + capability pages from the OLD inventory
        if built(p) or server_route(p): continue
        r = redirects.get(p)
        if not r: fails.append(f"[1] 404 RISK: {p} has no page and no redirect"); continue
        if not (built(r["destination"]) or server_route(r["destination"])):
            fails.append(f"[1] {p} redirects to dead {r['destination']}")

# 2 + 3 + 6: crawl built pages
pages = []
for dirpath, _, names in os.walk(DIST):
    for n in names:
        if n.endswith(".html"): pages.append(os.path.join(dirpath, n))

LINK = re.compile(r'href="(/[^"#?]*)"')
linkcount = 0
for f in pages:
    html = open(f, encoding="utf-8", errors="ignore").read()
    rel = "/" + os.path.relpath(f, DIST).replace("/index.html", "").replace("index.html", "")
    rel = re.sub(r"/+$", "", rel) or "/"
    # 6: no empty 200
    text = re.sub(r"<script.*?</script>|<style.*?</style>|<[^>]+>", " ", html, flags=re.S)
    if len(" ".join(text.split())) < 400 and "404" not in f:
        fails.append(f"[6] thin page: {rel} ({len(text)} chars of text)")
    for href in set(LINK.findall(html)):
        if re.search(r"\.(png|jpg|jpeg|svg|webp|ico|woff2?|xml|txt|webmanifest|json|css|js)$", href): continue
        linkcount += 1
        if href in redirects:
            fails.append(f"[3] {rel} links to REDIRECTING url {href}")
        elif not (built(href) or server_route(href)):
            fails.append(f"[2] {rel} links to DEAD url {href}")

# canonical / og integrity
for f in pages:
    html = open(f, encoding="utf-8", errors="ignore").read()
    for m in re.findall(r'(?:canonical"? href|og:url"? content|twitter:url"? content|"mainEntityOfPage":\s*"|"url":\s*")[^"]*"(https://rankedtag\.com[^"]*)"', html):
        pass
    for m in re.findall(r'https://rankedtag\.com(/services[^"\'\s<]*)', html):
        fails.append(f"[canonical] {os.path.relpath(f, DIST)} still references {m}")

# click depth: every indexable page must be reachable from the homepage in
# two clicks or fewer. This is the check that would have caught ten orphaned
# pages shipped across phases 3, 4 and 7 — they built, verified and linked
# nowhere, because nothing was looking.
page_links = {}
page_file = {}
for f in pages:
    rel = "/" + os.path.relpath(f, DIST).replace("/index.html", "").replace("index.html", "")
    rel = re.sub(r"/+$", "", rel) or "/"
    page_file[rel] = f
    html_src = open(f, encoding="utf-8", errors="ignore").read()
    hrefs = set()
    for h in re.findall(r'href="(/[^"#?]*)"', html_src):
        if re.search(r"\.\w{2,5}$", h):
            continue
        hrefs.add(re.sub(r"/+$", "", h) or "/")
    page_links[rel] = hrefs

depth = {"/": 0}
frontier = {"/"}
for level in range(1, 4):
    nxt = set()
    for r in frontier:
        for l in page_links.get(r, ()):
            if l not in depth:
                depth[l] = level
                nxt.add(l)
    frontier = nxt

for rel in sorted(page_links):
    if rel in ("/404", "/404.html"):
        continue
    html_src = open(page_file[rel], encoding="utf-8", errors="ignore").read()
    if "noindex" in html_src:
        continue
    # a page that canonicalises elsewhere is represented by its canonical
    # (e.g. /llm-info.html -> /llm-info), so it is not an orphan
    can = re.search(r'canonical" href="https://rankedtag\.com([^"]*)"', html_src)
    if can and can.group(1).rstrip("/") != rel.rstrip("/"):
        continue
    d = depth.get(rel)
    if d is None:
        fails.append(f"[depth] {rel} is ORPHANED \u2014 not reachable from the homepage")
    elif d > 2:
        fails.append(f"[depth] {rel} is {d} clicks from the homepage (limit 2)")

# heading order: exactly one h1 per page, no skipped levels (WCAG 1.3.1)
for f in pages:
    h = open(f, encoding="utf-8", errors="ignore").read()
    mm = re.search(r"<main.*?</main>", h, re.S)
    if not mm: continue
    body = re.sub(r"<script.*?</script>|<style.*?</style>", "", mm.group(0), flags=re.S)
    hs = [int(x) for x in re.findall(r"<h([1-6])[ >]", body)]
    rel = os.path.relpath(f, DIST)
    if hs.count(1) != 1:
        fails.append(f"[a11y] {rel}: {hs.count(1)} h1 elements")
    prev = hs[0] if hs else 1
    for lv in hs[1:]:
        if lv > prev + 1:
            fails.append(f"[a11y] {rel}: heading jumps h{prev} -> h{lv}")
            break
        prev = lv

# FAQ schema must be backed by visible copy on the page
import html as _html
for f in pages:
    h = open(f, encoding="utf-8", errors="ignore").read()
    qs = []
    for blk in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        try:
            data = json.loads(blk)
        except Exception:
            fails.append(f"[schema] {os.path.relpath(f, DIST)}: JSON-LD block does not parse")
            continue
        for node in (data if isinstance(data, list) else [data]):
            if isinstance(node, dict) and node.get("@type") == "FAQPage":
                for q in node.get("mainEntity", []):
                    if isinstance(q, dict) and q.get("name"):
                        qs.append(_html.unescape(q["name"]))
    if not qs: continue
    body = re.sub(r"<script.*?</script>|<style.*?</style>", "", h, flags=re.S)
    txt = _html.unescape(" ".join(re.sub(r"<[^>]+>", " ", body).split()))
    for q in qs:
        if q not in txt:
            fails.append(f"[faq] {os.path.relpath(f, DIST)}: schema question not visible: {q[:60]}")

# fabricated rating markup must never appear in JSON-LD
for f in pages:
    h = open(f, encoding="utf-8", errors="ignore").read()
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        if "aggregateRating" in block or "ratingValue" in block:
            fails.append(f"[rating] {os.path.relpath(f, DIST)}: rating markup in JSON-LD")

# 5: sitemap vs routes
src = open(os.path.join(ROOT, "api/sitemap.js")).read()
sm_urls = set()
for arr in ("CAPABILITIES", "PAGES"):
    m = re.search(arr + r" = \[(.*?)\];", src, re.S)
    sm_urls |= set(re.findall(r"'(/[^']*)'", m.group(1)))
for u in sorted(sm_urls):
    if not (built(u) or server_route(u)): fails.append(f"[5] sitemap lists unbuildable {u}")
# every indexable built page must be IN the sitemap
for f in pages:
    rel = "/" + os.path.relpath(f, DIST).replace("/index.html", "").replace("index.html", "")
    rel = re.sub(r"/+$", "", rel) or "/"
    if rel in ("/404",): continue
    html = open(f, encoding="utf-8", errors="ignore").read()
    if "noindex" in html: continue
    # a page that canonicalises elsewhere is represented in the sitemap by its
    # canonical, not by itself (e.g. /llm-info.html -> /llm-info)
    can = re.search(r'canonical" href="https://rankedtag\.com([^"]*)"', html)
    if can and can.group(1).rstrip("/") != rel.rstrip("/"): continue
    if rel not in sm_urls: fails.append(f"[5] indexable page missing from sitemap: {rel}")
print("sitemap urls:", len(sm_urls))

print(f"built pages: {len(pages)}   internal links checked: {linkcount}")
print(f"FAILURES: {len(fails)}")
for x in fails: print("  ✗", x)
print(f"warnings: {len(warns)}")
for x in warns: print("  !", x)
sys.exit(1 if fails else 0)
