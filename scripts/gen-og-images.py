#!/usr/bin/env python3
"""Generate the 1200x630 OG cards in public/og/.

Requires Pillow. It is deliberately NOT in package.json: this is a one-off
local tool, you run it when pages are added and commit the PNGs.

    python3 -m pip install --user Pillow
    python3 scripts/gen-og-images.py

Every page without its own card falls back to /og/default.png, which is valid
but identical across pages, so a shared card costs nothing technically and
costs a little attention in a social or chat preview.

Fonts: resolved from a cross-platform candidate list. The original version of
this script hardcoded C:/Windows/Fonts paths and could only ever run on one
machine; if none of the candidates exist it falls back to Pillow's built-in
font rather than crashing, and says so.
"""
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow is not installed. Run: python3 -m pip install --user Pillow")

PAPER = (244, 239, 231)
INK = (14, 14, 16)
RED = (255, 59, 20)
MUTED = (110, 110, 118)
W, H = 1200, 630
OUT = "public/og"

SERIF = ["/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
         "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
         "C:/Windows/Fonts/georgiab.ttf"]
SANS = ["/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "C:/Windows/Fonts/segoeui.ttf"]

_warned = False


def font(candidates, size):
    global _warned
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    if not _warned:
        print("WARNING: no system font found; falling back to the bitmap default.")
        _warned = True
    return ImageFont.load_default()


def center(d, y, text, fnt, fill):
    bb = d.textbbox((0, 0), text, font=fnt)
    d.text(((W - (bb[2] - bb[0])) / 2, y), text, font=fnt, fill=fill)


def wrap(d, text, fnt, max_w):
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = f"{line} {w}".strip()
        if d.textbbox((0, 0), trial, font=fnt)[2] <= max_w:
            line = trial
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def card(filename, eyebrow, headline):
    """The shared layout: eyebrow, wrapped headline, red rule, wordmark."""
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    center(d, 84, eyebrow.upper(), font(SANS, 26), MUTED)

    fnt = font(SERIF, 62)
    lines = wrap(d, headline, fnt, 980)
    if len(lines) > 3:
        fnt = font(SERIF, 50)
        lines = wrap(d, headline, fnt, 1000)
    y = 200 if len(lines) > 2 else 240
    for ln in lines:
        center(d, y, ln, fnt, INK)
        y += fnt.size + 16

    d.rectangle([(W / 2 - 70, y + 24), (W / 2 + 70, y + 28)], fill=RED)
    center(d, y + 62, "rankedtag.com", font(SANS, 28), MUTED)
    img.save(f"{OUT}/{filename}")
    print(f"wrote {OUT}/{filename}")


# One entry per page that should have its own card. Keep in step with the
# routes in src/App.jsx when pages are added.
CARDS = [
    ("saas-seo-agency.png", "Who we help \u00b7 B2B SaaS", "SaaS SEO that fills pipeline, not sessions"),
    ("ecommerce-seo-agency.png", "Who we help \u00b7 Ecommerce", "Ecommerce SEO that treats the catalogue as the product"),
    ("local-seo-agency.png", "Who we help \u00b7 Local", "Local SEO that works the Map Pack, not just the website"),
    ("who-we-help.png", "Who we help", "Three verticals, three playbooks"),
    ("best.png", "Shortlists \u00b7 updated quarterly", "Agency shortlists we publish, bias included"),
    ("best-seo-agencies-for-saas.png", "Shortlist \u00b7 2026", "The best SaaS SEO agencies, honestly compared"),
    ("best-seo-agencies-for-ecommerce.png", "Shortlist \u00b7 2026", "The best ecommerce SEO agencies, honestly compared"),
    ("best-seo-agencies-for-local-business.png", "Shortlist \u00b7 2026", "The best local SEO agencies, honestly compared"),
    ("what-we-do.png", "What we do", "SEO, AI SEO, GEO and AEO, under one roof"),
    ("apply.png", "Four slots a month", "A free founder review of your domain"),
]


def default_card():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    mark_path = "public/rankedtag-logo.png"
    if os.path.exists(mark_path):
        mark = Image.open(mark_path).convert("RGBA")
        s = 200
        mark = mark.resize((s, s), Image.LANCZOS)
        img.paste(mark, ((W - s) // 2, 96), mark)
    center(d, 320, "RankedTag", font(SERIF, 78), INK)
    center(d, 430, "SEO \u00b7 AI SEO \u00b7 AEO \u00b7 GEO", font(SANS, 33), MUTED)
    d.rectangle([(W / 2 - 70, 412), (W / 2 + 70, 416)], fill=RED)
    img.save(f"{OUT}/default.png")
    print(f"wrote {OUT}/default.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    default_card()
    for args in CARDS:
        card(*args)
    print(f"\n{len(CARDS) + 1} cards written. Commit public/og/ and add the paths to routeMeta.js.")
