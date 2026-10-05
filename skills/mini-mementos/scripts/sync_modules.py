#!/usr/bin/env python3
"""Synchronize the reference's editable modules with its standalone HTML."""
from __future__ import annotations

import argparse
import re
from pathlib import Path


MODULES = (
    ("audio-engine.js", "AUDIO_ENGINE"),
    ("inspector-geometry.js", "INSPECTOR_GEOMETRY"),
)


def synchronize(project: Path, check: bool = False) -> bool:
    page = project / "index.html"
    original = page.read_text(encoding="utf-8")
    updated = original
    stale = []
    for filename, marker in MODULES:
        start, end = f"/* {marker}_START */", f"/* {marker}_END */"
        if updated.count(start) != 1 or updated.count(end) != 1:
            raise ValueError(f"Expected one {marker} start/end pair in {page}")
        pattern = re.compile(re.escape(start) + r"([\s\S]*?)" + re.escape(end))
        match = pattern.search(updated)
        if match is None:
            raise ValueError(f"Misordered {marker} markers in {page}")
        source = (project / filename).read_text(encoding="utf-8").strip()
        if match.group(1).strip() != source:
            stale.append(filename)
            updated = updated[:match.start(1)] + "\n" + source + "\n" + updated[match.end(1):]
    if stale and not check:
        page.write_text(updated, encoding="utf-8")
    if stale:
        print(("Out of sync: " if check else "Synchronized: ") + ", ".join(stale))
    else:
        print("Embedded audio and geometry match their source modules.")
    return not stale or not check


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", type=Path, help="Directory containing index.html and both modules")
    parser.add_argument("--check", action="store_true", help="Report drift without changing files")
    args = parser.parse_args()
    try:
        return 0 if synchronize(args.project.resolve(), args.check) else 1
    except (OSError, ValueError) as error:
        parser.exit(2, f"Error: {error}\n")


if __name__ == "__main__":
    raise SystemExit(main())
