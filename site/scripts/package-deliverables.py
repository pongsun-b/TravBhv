#!/usr/bin/env python3
"""
Builds the curated deliverables archive.

Adds files straight from the project tree into a brief-mapped folder structure,
so no staging copy is needed and nothing is duplicated by accident.

    python3 scripts/package-deliverables.py [output.zip]
"""
import os
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "tbrg-deliverables.zip"

# (source path relative to project root, destination inside the archive)
SINGLE = [
    ("START-HERE.md", "START-HERE.md"),
    ("docs/brand-guidelines.md", "01-identity/brand-guidelines.md"),
    ("src/lib/tokens.css", "02-design-tokens/tokens.css"),
    ("design-tokens.json", "02-design-tokens/design-tokens.json"),
    ("reports/performance-accessibility.md", "05-reports/performance-accessibility.md"),
    ("reports/verification.json", "05-reports/verification.json"),
    ("reports/inquiry-ledger-sample.json", "05-reports/inquiry-ledger-sample.json"),
    ("HANDOFF.md", "06-handoff/HANDOFF.md"),
    ("README.md", "06-handoff/README.md"),
]

TREES = [
    ("brand/svg", "01-identity/svg"),
    ("brand/png", "01-identity/png"),
    ("brand/favicon", "01-identity/favicon"),
    ("brand/social", "01-identity/social"),
    ("build", "03-website/deploy-build"),
    ("src", "03-website/source/src"),
    ("static", "03-website/source/static"),
    ("server", "03-website/source/server"),
    ("scripts", "03-website/source/scripts"),
    ("brand", "03-website/source/brand"),
]

# Before/after evidence: the composed sheets only. The 24 raw captures live in the
# full project archive; keeping them out halves the size of this one.
BEFORE_AFTER = ("reports/before-after", "04-before-after")
BEFORE_AFTER_KEEP = ("overview", "compare-")

SOURCE_FILES = [
    "package.json",
    "package-lock.json",
    "svelte.config.js",
    "vite.config.js",
    "jsconfig.json",
    ".gitignore",
]

SKIP_SUFFIX = {".DS_Store"}
SKIP_DIR_PARTS = {"node_modules", ".svelte-kit", ".openclaw-tmp", "__pycache__"}


def keep(path: Path) -> bool:
    if path.name in SKIP_SUFFIX or path.suffix in SKIP_SUFFIX:
        return False
    return not any(part in SKIP_DIR_PARTS for part in path.parts)


def main() -> None:
    if OUT.exists():
        OUT.unlink()

    added = 0
    total = 0
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for src, dest in SINGLE:
            p = ROOT / src
            if p.exists():
                z.write(p, dest)
                added += 1
            else:
                print("  missing:", src)

        for src, dest in TREES:
            base = ROOT / src
            if not base.exists():
                print("  missing tree:", src)
                continue
            for dirpath, dirnames, filenames in os.walk(base):
                dirnames[:] = [d for d in dirnames if d not in SKIP_DIR_PARTS]
                for name in sorted(filenames):
                    fp = Path(dirpath) / name
                    if not keep(fp):
                        continue
                    rel = fp.relative_to(base)
                    z.write(fp, str(Path(dest) / rel))
                    added += 1

        ba_src, ba_dest = BEFORE_AFTER
        ba_base = ROOT / ba_src
        if ba_base.exists():
            for fp in sorted(ba_base.glob("*.jpg")):
                if fp.name.startswith(BEFORE_AFTER_KEEP):
                    z.write(fp, f"{ba_dest}/{fp.name}")
                    added += 1

        for name in SOURCE_FILES:
            p = ROOT / name
            if p.exists():
                z.write(p, f"03-website/source/{name}")
                added += 1

    total = OUT.stat().st_size
    print(f"\n{OUT.name}: {added} files, {total / 1024 / 1024:.1f} MB")
    with zipfile.ZipFile(OUT) as z:
        names = z.namelist()
        print("\nTop-level:")
        for top in sorted({n.split('/')[0] for n in names}):
            count = sum(1 for n in names if n.startswith(top))
            print(f"  {top:<22} {count} entries")


if __name__ == "__main__":
    main()
