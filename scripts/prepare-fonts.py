"""Copy the already licensed Jua WOFF2 files from the local reference project."""
from pathlib import Path
import hashlib
import json
import shutil
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = root.parent / "1udangtangtang/public/assets/fonts"
output = root / "assets/fonts"
output.mkdir(parents=True, exist_ok=True)
records = []
for name in ("jua-korean-400.woff2", "jua-latin-400.woff2"):
    destination = output / name
    shutil.copy2(source / name, destination)
    font = TTFont(destination)
    names = {entry.nameID: entry.toUnicode() for entry in font["name"].names
             if entry.platformID == 3 and entry.nameID in (0, 1, 2, 5, 6, 14)}
    assert names[1] == "Jua" and names[2] == "Regular"
    row = {"file": f"assets/fonts/{name}", "source": str(source / name),
           "bytes": destination.stat().st_size,
           "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
           "embeddedNames": names,
           "license": "SIL Open Font License 1.1",
           "licenseSource": "https://raw.githubusercontent.com/google/fonts/main/ofl/jua/OFL.txt",
           "metadataSource": "https://raw.githubusercontent.com/google/fonts/main/ofl/jua/METADATA.pb",
           "checked": "2026-10-21"}
    records.append(row)
    print(name, row["bytes"], row["sha256"])
(root / "docs/reference-review/jua-fonts.json").write_text(
    json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
