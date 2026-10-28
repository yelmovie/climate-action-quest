"""Prepare the supplied illustrations without altering their visual content.

Run from the project root: python scripts/prepare-assets.py
Pillow is the only authoring dependency; the deployed app has no dependency on it.
Originals remain in references/. No background removal, redrawing or upscaling.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)

SOURCES = {
    "home": "references/backgrounds/chatgpt_generated_13.png",
    "city": "references/backgrounds/chatgpt_generated_14.png",
    "coast": "references/backgrounds/chatgpt_generated_15.png",
    "bedroom": "references/backgrounds/chatgpt_generated_17.png",
    "design": "references/backgrounds/chatgpt_generated_19.png",
    "storm": "references/backgrounds/chatgpt_generated_20.png",
    "logo": "references/branding/chatgpt_generated_23.png",
}

manifest = []

def write(name, source, crop=None):
    source_path = ROOT / source
    with Image.open(source_path) as original:
        image = original.copy()
        if crop:
            image = image.crop(crop)
        image.thumbnail((1672, 1100), Image.Resampling.LANCZOS)
        destination = OUT / f"{name}.webp"
        image.save(destination, "WEBP", quality=86, method=6)
        manifest.append({
            "name": name, "source": source,
            "output": destination.relative_to(ROOT).as_posix(),
            "width": image.width, "height": image.height,
            "bytes": destination.stat().st_size,
            "sourceSha256": hashlib.sha256(source_path.read_bytes()).hexdigest(),
            "crop": list(crop) if crop else None,
            "processing": "WebP conversion; no background removal or redraw",
        })

for name, source in SOURCES.items():
    write(name, source)

# Visually inspected source-sheet cells, including the original cream background.
# Rectangular portraits, not sprites or transparent cutouts.
sheet = "references/characters/chatgpt_generated_22.png"
write("squirrel", sheet, (0, 320, 220, 579))
write("otter", sheet, (838, 805, 986, 938))

report = ROOT / "docs/reference-review/prepared-assets.json"
report.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
for item in manifest:
    print(f"{item['output']}: {item['width']}x{item['height']}, {item['bytes']:,} bytes")
print(f"Total: {sum(item['bytes'] for item in manifest):,} bytes")
