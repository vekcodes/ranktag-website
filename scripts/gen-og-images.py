#!/usr/bin/env python3
# One-off generator for the two remaining 1200x630 OG images (default + case
# study). Requires Pillow + system fonts; run locally, commit the PNGs. Replace
# the outputs with custom-designed cards anytime — same paths, no code change.
from PIL import Image, ImageDraw, ImageFont

PAPER = (244, 239, 231)
INK = (14, 14, 16)
RED = (255, 59, 20)
MUTED = (110, 110, 118)
W, H = 1200, 630


def font(name, size):
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


def center_text(d, y, text, fnt, fill):
    bb = d.textbbox((0, 0), text, font=fnt)
    d.text(((W - (bb[2] - bb[0])) / 2, y), text, font=fnt, fill=fill)
    return bb[3] - bb[1]


# ---- default.png : logo mark + wordmark + tagline on paper ----
def default_card():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    mark = Image.open("public/rankedtag-logo.png").convert("RGBA")
    s = 200
    mark = mark.resize((s, s), Image.LANCZOS)
    img.paste(mark, ((W - s) // 2, 96), mark)
    center_text(d, 320, "RankedTag", font("georgiab.ttf", 78), INK)
    center_text(d, 430, "SEO · AI SEO · AEO · GEO for B2B SaaS", font("segoeui.ttf", 33), MUTED)
    # red accent rule
    d.rectangle([(W / 2 - 70, 412), (W / 2 + 70, 416)], fill=RED)
    img.save("public/og/default.png")
    print("wrote public/og/default.png", img.size)


# ---- case-study-sendr.png : headline + the real GSC proof screenshot ----
def case_study_card():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    center_text(d, 46, "sendr.ai — 1.05M impressions in 6 months", font("georgiab.ttf", 44), INK)
    shot = Image.open("public/result-sendr.jpeg").convert("RGB")
    tw = 1060
    th = round(shot.height * tw / shot.width)
    shot = shot.resize((tw, th), Image.LANCZOS)
    x = (W - tw) // 2
    y = 150
    # subtle frame
    d.rectangle([(x - 2, y - 2), (x + tw + 1, y + th + 1)], outline=(228, 220, 204), width=2)
    img.paste(shot, (x, y))
    img.save("public/og/case-study-sendr.png")
    print("wrote public/og/case-study-sendr.png", img.size)


default_card()
case_study_card()
