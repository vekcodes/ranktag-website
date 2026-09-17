#!/usr/bin/env python3
"""Pre-optimise the signup screenshots into public/proof/.

Run locally whenever new screenshots are dropped into "Google and AI signups/":

    python scripts/optimize-signups.py

The originals are never modified. Output is WebP, capped at MAX_W and well
under the 200KB budget, so nothing is resized at request time and Vercel's
image optimisation quota is never touched.
"""
from pathlib import Path
import re
import sys

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Google and AI signups"
OUT = ROOT / "public" / "proof"

MAX_W = 1200          # well inside the 1600px cap; 2x for a ~600px rail card
QUALITY = 80
BUDGET = 200 * 1024


def index_of(path: Path) -> int:
    """'Google and AI signups (7).png' -> 7, so output names stay traceable."""
    m = re.search(r"\((\d+)\)", path.stem)
    return int(m.group(1)) if m else 0


def main() -> int:
    if not SRC.is_dir():
        print(f"missing source folder: {SRC}", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(SRC.glob("*.png"), key=index_of)
    if not files:
        print(f"no PNGs in {SRC}", file=sys.stderr)
        return 1

    total_in = total_out = 0
    worst = 0
    for src in files:
        im = Image.open(src)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)

        dst = OUT / f"signup-{index_of(src):02d}.webp"
        quality = QUALITY
        while True:
            im.save(dst, "WEBP", quality=quality, method=6)
            if dst.stat().st_size <= BUDGET or quality <= 45:
                break
            quality -= 10  # only ever trips on unusually noisy screenshots

        total_in += src.stat().st_size
        total_out += dst.stat().st_size
        worst = max(worst, dst.stat().st_size)
        print(f"{dst.name}  {im.width}x{im.height}  {dst.stat().st_size / 1024:6.1f} KB  q{quality}")

    print(
        f"\n{len(files)} images  {total_in / 1024:.0f} KB -> {total_out / 1024:.0f} KB "
        f"({100 - total_out / total_in * 100:.0f}% smaller)  largest {worst / 1024:.1f} KB"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
