#!/usr/bin/env python3
"""Primal access layer from existing station 15-minute isochrones.

Cui & Levinson (2020): primal access counts opportunities inside a cost
threshold. Dual access is the cost to reach a given number of opportunities.
The public map's 5/10/15-minute classes are dual access to one station
(time to the nearest). This script counts how many stations fall inside a
15-minute walk (primal, O_j = 1 per urban-rail station).

Does not recompute the OSM walk graph. Run from the repo root:

    python3 scripts/access/primal.py
"""

from __future__ import annotations

import json
import logging
import sys
from collections import Counter
from pathlib import Path

import geopandas as gpd
import numpy as np
from shapely import contains_xy, make_valid, prepare
from shapely.geometry import box
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "access-data"
CELL_M = 100
CRS = "EPSG:32647"
# 0, 1, 2, 3, 4+ stations within 15 minutes
BINS = (0, 1, 2, 3, 4)
LABELS = ("0", "1", "2", "3", "4+")

LOG = logging.getLogger("primal")


def minify_geojson(path: Path, ndigits=5):
    def rnd(obj):
        if isinstance(obj, float):
            return round(obj, ndigits)
        if isinstance(obj, list):
            if obj and isinstance(obj[0], (int, float)):
                return [round(float(x), ndigits) for x in obj]
            return [rnd(x) for x in obj]
        if isinstance(obj, dict):
            return {k: rnd(v) for k, v in obj.items()}
        return obj

    data = json.loads(path.read_text())
    path.write_text(json.dumps(rnd(data), separators=(",", ":")))


def count_grid(station_iso: gpd.GeoDataFrame, study: gpd.GeoDataFrame) -> tuple:
    study_m = make_valid(study.to_crs(CRS).union_all())
    minx, miny, maxx, maxy = study_m.bounds
    xs = np.arange(minx + CELL_M / 2, maxx, CELL_M)
    ys = np.arange(miny + CELL_M / 2, maxy, CELL_M)
    xx, yy = np.meshgrid(xs, ys)
    counts = np.zeros(xx.shape, dtype=np.int16)

    band = station_iso[station_iso["band"].astype(str) == "15"].to_crs(CRS)
    LOG.info("stations with a 15-min isochrone: %s", len(band))
    for geom in band.geometry:
        geom = make_valid(geom)
        if geom.is_empty:
            continue
        prepare(geom)
        gx0, gy0, gx1, gy1 = geom.bounds
        ix0 = max(0, int((gx0 - xs[0]) / CELL_M))
        ix1 = min(len(xs), int((gx1 - xs[0]) / CELL_M) + 2)
        iy0 = max(0, int((gy0 - ys[0]) / CELL_M))
        iy1 = min(len(ys), int((gy1 - ys[0]) / CELL_M) + 2)
        subx = xx[iy0:iy1, ix0:ix1]
        suby = yy[iy0:iy1, ix0:ix1]
        hit = contains_xy(geom, subx, suby)
        counts[iy0:iy1, ix0:ix1][hit] += 1

    prepare(study_m)
    in_study = contains_xy(study_m, xx, yy)
    counts = np.where(in_study, counts, -1)
    return xs, ys, counts, study_m


def dissolve_classes(xs, ys, counts, study_m) -> gpd.GeoDataFrame:
    rows = []
    half = CELL_M / 2
    for n, label in zip(BINS, LABELS):
        if n == 4:
            mask = counts >= 4
        else:
            mask = counts == n
        if not mask.any():
            continue
        iy, ix = np.where(mask)
        cells = [
            box(xs[j] - half, ys[i] - half, xs[j] + half, ys[i] + half)
            for i, j in zip(iy, ix)
        ]
        LOG.info("class %s: %s cells", label, len(cells))
        geom = unary_union(cells).intersection(study_m)
        geom = make_valid(geom).simplify(30, preserve_topology=True)
        if geom.is_empty:
            continue
        rows.append(
            {
                "class": label,
                "n": int(n),
                "threshold_min": 15,
                "speed_kmh": 4.0,
                "geometry": geom,
            }
        )
    return gpd.GeoDataFrame(rows, crs=CRS).to_crs(4326)


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    iso_path = OUT / "station_iso.geojson"
    study_path = OUT / "study.geojson"
    if not iso_path.exists() or not study_path.exists():
        LOG.error("need %s and %s", iso_path, study_path)
        return 1
    iso = gpd.read_file(iso_path)
    study = gpd.read_file(study_path)
    xs, ys, counts, study_m = count_grid(iso, study)
    inside = counts[counts >= 0]
    hist = Counter(inside.tolist())
    LOG.info(
        "cell histogram (n stations): %s",
        {k: hist[k] for k in sorted(hist)[:12]},
    )
    LOG.info(
        "max stations in a cell: %s; share with 0: %.3f; 4+: %.3f",
        int(inside.max()),
        (inside == 0).mean(),
        (inside >= 4).mean(),
    )
    gdf = dissolve_classes(xs, ys, counts, study_m)
    dest = OUT / "primal_15.geojson"
    gdf.to_file(dest, driver="GeoJSON")
    minify_geojson(dest)
    LOG.info("wrote %s (%.1f KB)", dest, dest.stat().st_size / 1024)
    return 0


if __name__ == "__main__":
    sys.exit(main())
