#!/usr/bin/env python3
"""Build Bangkok walk-isochrones to urban-rail exits for TBRG /access/."""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import time
from datetime import date
from pathlib import Path

import geopandas as gpd
import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
import osmnx as ox
import pandas as pd
import requests
import yaml
from shapely.geometry import LineString, MultiLineString, MultiPolygon, Point, Polygon, mapping, shape
from shapely.ops import unary_union
from shapely.validation import make_valid

OVERPASS = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"

ROOT = Path(__file__).resolve().parents[2]
LOG = logging.getLogger("access")

CLASS_COLORS = {
    "<5": "#f7f4ef",
    "5-10": "#f3c07a",
    "10-15": "#e07a3d",
    ">15": "#d4564c",
}


def load_config(path: Path) -> dict:
    with path.open() as f:
        cfg = yaml.safe_load(f)
    cfg["_path"] = path
    return cfg


def cache_paths(cfg: dict) -> dict:
    cache = ROOT / cfg["cache_dir"]
    cache.mkdir(parents=True, exist_ok=True)
    out = ROOT / cfg["output_dir"]
    out.mkdir(parents=True, exist_ok=True)
    return {
        "cache": cache,
        "out": out,
        "khet": cache / "khet.geojson",
        "study": cache / "study.geojson",
        "stations": cache / "stations.geojson",
        "exits": cache / "exits.geojson",
        "rail": cache / "rail.geojson",
        "graph": cache / "walk.pkl",
        "classes": cache / "classes.geojson",
        "station_iso": cache / "station_iso.geojson",
        "feeders": cache / "feeders.geojson",
    }


def compile_patterns(cfg: dict):
    allow = [re.compile(re.escape(s), re.I) for s in cfg["lines"]["allow"]]
    deny = [re.compile(re.escape(s), re.I) for s in cfg["lines"]["deny"]]
    return allow, deny


def blob(row) -> str:
    parts = []
    for key in (
        "name",
        "name:en",
        "name:th",
        "network",
        "network:en",
        "operator",
        "ref",
        "route",
        "railway",
        "station",
        "line",
    ):
        val = row.get(key) if hasattr(row, "get") else row[key] if key in row else None
        if val is not None and not (isinstance(val, float) and np.isnan(val)):
            parts.append(str(val))
    return " ".join(parts)


def allowed(text: str, allow, deny) -> bool:
    if not text:
        return False
    if any(p.search(text) for p in deny):
        # Red Line is allowed even though "Line" is generic; deny takes
        # conventional SRT names. If both match, deny wins except explicit Red.
        if re.search(r"dark red|light red|srt red|bts|mrt|airport rail|\bARL\b", text, re.I):
            return any(p.search(text) for p in allow)
        return False
    return any(p.search(text) for p in allow)


def gdf_points(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    if gdf.empty:
        return gdf
    out = gdf.copy()
    pts = out.to_crs("EPSG:32647")
    out["geometry"] = pts.geometry.centroid.to_crs(out.crs)
    return out


def save_gdf(gdf: gpd.GeoDataFrame, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    keep = gdf.copy()
    keep = keep.loc[:, ~keep.columns.duplicated()]
    drop = []
    for col in list(keep.columns):
        if col == "geometry":
            continue
        s = keep[col]
        if not isinstance(s, pd.Series):
            drop.append(col)
            continue
        if s.dtype == object:
            keep[col] = s.map(
                lambda v: ";".join(map(str, v))
                if isinstance(v, (list, tuple))
                else v
            )
    if drop:
        keep = keep.drop(columns=drop)
    keep.to_file(path, driver="GeoJSON")


def read_gdf(path: Path) -> gpd.GeoDataFrame:
    return gpd.read_file(path)


def bbox_tuple(cfg) -> tuple:
    west, south, east, north = cfg["bbox"]
    return (west, south, east, north)


def overpass_elements(ql: str) -> list:
    LOG.info("overpass query (%s chars)", len(ql))
    last = None
    for attempt in range(4):
        try:
            r = requests.post(OVERPASS, data={"data": ql}, timeout=180)
            if r.status_code in (429, 502, 504):
                LOG.warning("overpass %s, retry %s", r.status_code, attempt + 1)
                time.sleep(8 * (attempt + 1))
                last = r
                continue
            r.raise_for_status()
            els = r.json().get("elements", [])
            LOG.info("overpass → %s elements", len(els))
            return els
        except requests.RequestException as exc:
            last = exc
            LOG.warning("overpass error %s, retry %s", exc, attempt + 1)
            time.sleep(8 * (attempt + 1))
    raise RuntimeError(f"overpass failed: {last}")


def elements_to_gdf(elements: list) -> gpd.GeoDataFrame:
    rows = []
    for el in elements:
        tags = el.get("tags") or {}
        geom = None
        if el.get("type") == "node" and "lat" in el:
            geom = Point(el["lon"], el["lat"])
        elif "center" in el:
            geom = Point(el["center"]["lon"], el["center"]["lat"])
        elif "geometry" in el:
            coords = [(p["lon"], p["lat"]) for p in el["geometry"]]
            if len(coords) >= 2:
                geom = LineString(coords)
        elif el.get("type") == "relation":
            lines = []
            for m in el.get("members") or []:
                if "geometry" in m:
                    coords = [(p["lon"], p["lat"]) for p in m["geometry"]]
                    if len(coords) >= 2:
                        lines.append(LineString(coords))
            if lines:
                geom = MultiLineString(lines)
        if geom is None:
            continue
        row = dict(tags)
        row["osm_id"] = el.get("id")
        row["osm_type"] = el.get("type")
        row["geometry"] = geom
        rows.append(row)
    if not rows:
        return gpd.GeoDataFrame(geometry=[], crs="EPSG:4326")
    return gpd.GeoDataFrame(rows, crs="EPSG:4326")


def _poly_gdf(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    if gdf.empty:
        return gdf
    gdf = gdf[gdf.geom_type.isin(["Polygon", "MultiPolygon"])].copy()
    gdf["geometry"] = gdf.geometry.map(lambda g: make_valid(g) if g is not None else g)
    return gdf


ADM1_URL = "https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/THA/ADM1/geoBoundaries-THA-ADM1_simplified.geojson"
ADM2_URL = "https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/THA/ADM2/geoBoundaries-THA-ADM2_simplified.geojson"


def _download(url: str, dest: Path):
    if dest.exists() and dest.stat().st_size > 1000:
        return
    import urllib.request

    LOG.info("download %s", url)
    dest.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, dest)


def fetch_boundaries(cfg, paths, fresh: bool) -> tuple[gpd.GeoDataFrame, gpd.GeoDataFrame]:
    if not fresh and paths["khet"].exists() and paths["study"].exists():
        LOG.info("boundaries: cache")
        return read_gdf(paths["khet"]), read_gdf(paths["study"])

    LOG.info("boundaries: geoBoundaries ADM1/ADM2")
    adm1_path = paths["cache"] / "tha_adm1.geojson"
    adm2_path = paths["cache"] / "tha_adm2.geojson"
    _download(ADM1_URL, adm1_path)
    _download(ADM2_URL, adm2_path)
    provinces = gpd.read_file(adm1_path)
    districts = gpd.read_file(adm2_path)
    provinces["name_en"] = provinces["shapeName"]
    districts["name_en"] = districts["shapeName"]

    wanted = [cfg["bma_province"], *cfg["adjacent_provinces"]]
    bkk_re = re.compile(r"^Bangkok$|^Krung Thep Maha Nakhon$|^กรุงเทพมหานคร$", re.I)

    def is_wanted_province(name) -> bool:
        n = str(name or "").strip()
        if bkk_re.match(n):
            return True
        for p in wanted:
            if re.fullmatch(rf"{re.escape(p)}( Province)?", n, re.I):
                return True
        return False

    prov_keep = provinces[
        provinces["name_en"].astype(str).map(is_wanted_province)
    ].copy()
    if prov_keep.empty:
        raise SystemExit("No province polygons for BMA / NBI / SPK / PTE")
    prov_keep = prov_keep.dissolve(by="name_en", as_index=False)

    dcent = districts.copy()
    dcent["geometry"] = dcent.geometry.representative_point()
    joined = gpd.sjoin(
        dcent[["geometry"]],
        prov_keep[["name_en", "geometry"]].rename(columns={"name_en": "province"}),
        predicate="within",
        how="left",
    )
    joined = joined[~joined.index.duplicated(keep="first")]
    districts = districts.copy()
    districts["province"] = joined.reindex(districts.index)["province"]
    districts = districts[districts["province"].notna()].copy()
    districts["in_bkk"] = districts["province"].astype(str).map(lambda s: bool(bkk_re.search(s)))
    districts["name"] = districts["name_en"]
    # OSM often returns both relation and way; keep the largest polygon per name+province
    districts["area"] = districts.to_crs(cfg["crs_metric"]).geometry.area
    districts = (
        districts.sort_values("area", ascending=False)
        .drop_duplicates(["name", "province"])
        .drop(columns=["area"])
    )
    khet = districts[["name", "province", "in_bkk", "geometry"]].to_crs(4326)
    save_gdf(khet, paths["khet"])
    study = gpd.GeoDataFrame(
        {"name": ["study"]},
        geometry=[khet.union_all()],
        crs=khet.crs,
    )
    save_gdf(study, paths["study"])
    LOG.info("boundaries: %s districts in %s", len(khet), sorted(khet["province"].astype(str).unique()))
    return read_gdf(paths["khet"]), read_gdf(paths["study"])


def fetch_rail(cfg, paths, allow, deny, fresh: bool):
    if (
        not fresh
        and paths["stations"].exists()
        and paths["exits"].exists()
        and paths["rail"].exists()
    ):
        LOG.info("rail: cache")
        return (
            read_gdf(paths["stations"]),
            read_gdf(paths["exits"]),
            read_gdf(paths["rail"]),
        )

    west, south, east, north = cfg["bbox"]
    # Overpass bbox is (south, west, north, east)
    bb = f"({south},{west},{north},{east})"
    LOG.info("rail: Overpass routes + stops + entrances")

    route_els = overpass_elements(
        f"[out:json][timeout:90];("
        f'way["railway"="subway"]{bb};'
        f'way["railway"="light_rail"]{bb};'
        f'way["railway"="monorail"]{bb};'
        f");out geom;"
    )
    routes = elements_to_gdf(route_els)
    rail_lines = gpd.GeoDataFrame(columns=["name", "geometry"], crs="EPSG:4326")
    if not routes.empty:
        line_geoms = routes[routes.geom_type.isin(["LineString", "MultiLineString"])].copy()
        if not line_geoms.empty:
            line_geoms["name"] = line_geoms.apply(
                lambda r: r.get("name:en")
                if pd.notna(r.get("name:en"))
                else r.get("name"),
                axis=1,
            )
            rail_lines = line_geoms[["name", "geometry"]].copy()

    stop_els = overpass_elements(
        f"[out:json][timeout:120];("
        f'node["railway"="station"]{bb};'
        f'node["railway"="halt"]{bb};'
        f'node["railway"="subway_entrance"]{bb};'
        f'node["station"="subway"]{bb};'
        f'node["public_transport"="station"]{bb};'
        f");out body;"
    )
    stops = elements_to_gdf(stop_els)
    if stops.empty:
        raise SystemExit("No railway features in bbox")

    stops = stops.copy()
    stops["blob"] = stops.apply(blob, axis=1)

    def keep_stop(row):
        text = row["blob"]
        railway = str(row.get("railway") or "")
        station = str(row.get("station") or "")
        if railway == "subway_entrance":
            return True
        if station in ("subway", "light_rail"):
            if any(p.search(text) for p in deny) and not allowed(text, allow, deny):
                return False
            return True
        return allowed(text, allow, deny)

    stops["keep"] = stops.apply(keep_stop, axis=1)
    # Entrances often lack network tags; keep subway_entrance near kept stations later.
    rail_all = (
        stops["railway"].astype(str)
        if "railway" in stops.columns
        else pd.Series("", index=stops.index)
    )
    has_entrance = (
        stops["entrance"].notna()
        if "entrance" in stops.columns
        else pd.Series(False, index=stops.index)
    )
    is_entrance = rail_all.eq("subway_entrance") | has_entrance
    tagged = stops[stops["keep"]].copy()
    LOG.info("rail: %s tagged stop features", len(tagged))

    tagged_pts = gdf_points(tagged)
    rail_col = (
        tagged_pts["railway"].astype(str)
        if "railway" in tagged_pts.columns
        else pd.Series("", index=tagged_pts.index)
    )
    tagged_pts["kind"] = np.where(rail_col.eq("subway_entrance"), "exit", "station")

    # Cluster station features into one point per station name (centroid of members).
    def station_name(row):
        for k in ("name:en", "name", "ref"):
            v = row.get(k)
            if v is not None and not (isinstance(v, float) and (pd.isna(v))):
                return str(v)
        return "unnamed"

    stations_src = tagged_pts[tagged_pts["kind"] != "exit"].copy()
    if stations_src.empty:
        stations_src = tagged_pts.copy()
    stations_src["station"] = stations_src.apply(station_name, axis=1)
    stations_src["line"] = stations_src["blob"].map(lambda t: _line_label(t, allow))

    # Dissolve near-duplicate names by snapping 120 m
    metric = stations_src.to_crs(cfg["crs_metric"])
    metric["x"] = metric.geometry.x
    metric["y"] = metric.geometry.y
    grouped = []
    used = set()
    coords = metric[["x", "y"]].to_numpy()
    names = metric["station"].to_numpy()
    lines = metric["line"].to_numpy()
    for i in range(len(metric)):
        if i in used:
            continue
        d = np.hypot(coords[:, 0] - coords[i, 0], coords[:, 1] - coords[i, 1])
        same = np.where((d < 250) & (names == names[i]))[0]
        used.update(same.tolist())
        geom = Point(coords[same, 0].mean(), coords[same, 1].mean())
        line = "; ".join(sorted({ln for ln in lines[same] if ln}))
        grouped.append(
            {"station": names[i], "line": line, "geometry": geom, "n_osm": int(len(same))}
        )
    stations = gpd.GeoDataFrame(grouped, crs=cfg["crs_metric"]).to_crs(4326)

    # Exits: subway_entrance within 250 m of a station, plus the station point itself.
    entrances = stops[is_entrance].copy()
    exit_rows = []
    sta_m = stations.to_crs(cfg["crs_metric"])
    if not entrances.empty:
        ent_m = gdf_points(entrances).to_crs(cfg["crs_metric"])
        for idx, erow in ent_m.iterrows():
            d = sta_m.distance(erow.geometry)
            if d.min() <= 250:
                j = int(d.idxmin())
                exit_rows.append(
                    {
                        "station": sta_m.loc[j, "station"],
                        "line": sta_m.loc[j, "line"],
                        "source": "entrance",
                        "geometry": erow.geometry,
                    }
                )
    for idx, srow in sta_m.iterrows():
        exit_rows.append(
            {
                "station": srow["station"],
                "line": srow["line"],
                "source": "station",
                "geometry": srow.geometry,
            }
        )
    exits = gpd.GeoDataFrame(exit_rows, crs=cfg["crs_metric"]).to_crs(4326)
    # Drop duplicate exits within 15 m of each other at the same station
    em = exits.to_crs(cfg["crs_metric"])
    keep_idx = []
    used = set()
    xy = np.c_[em.geometry.x, em.geometry.y]
    for i in range(len(em)):
        if i in used:
            continue
        d = np.hypot(xy[:, 0] - xy[i, 0], xy[:, 1] - xy[i, 1])
        same = np.where((d < 15) & (em["station"].to_numpy() == em.iloc[i]["station"]))[0]
        used.update(same.tolist())
        keep_idx.append(i)
    exits = exits.iloc[keep_idx].reset_index(drop=True)

    n_exit = exits.groupby("station").size().rename("exits")
    stations = stations.merge(n_exit, left_on="station", right_index=True, how="left")
    stations["exits"] = stations["exits"].fillna(1).astype(int)

    save_gdf(stations, paths["stations"])
    save_gdf(exits, paths["exits"])
    if rail_lines.empty:
        rail_lines = gpd.GeoDataFrame(
            {"name": pd.Series(dtype=str)}, geometry=[], crs="EPSG:4326"
        )
    save_gdf(rail_lines, paths["rail"])
    LOG.info("rail: %s stations, %s exits, %s line features", len(stations), len(exits), len(rail_lines))
    return stations, exits, rail_lines


def fetch_feeders(cfg, paths, fresh: bool) -> gpd.GeoDataFrame:
    """BRT stops and river/canal boat piers — extra first-mile access."""
    if not fresh and paths["feeders"].exists():
        LOG.info("feeders: cache")
        return read_gdf(paths["feeders"])

    west, south, east, north = cfg["bbox"]
    bb = f"({south},{west},{north},{east})"
    LOG.info("feeders: Overpass BRT + ferry piers")
    els = overpass_elements(
        f"[out:json][timeout:90];("
        f'node["amenity"="ferry_terminal"]{bb};'
        f'way["amenity"="ferry_terminal"]{bb};'
        f'node["ferry"="yes"]{bb};'
        f'node["highway"="bus_stop"]["name"~"BRT|บีอาร์ที",i]{bb};'
        f'node["public_transport"~"platform|station|stop_position"]["name"~"BRT|บีอาร์ที",i]{bb};'
        f'node["name"~"Bangkok BRT"]{bb};'
        f");out center;"
    )
    gdf = elements_to_gdf(els)
    if gdf.empty:
        LOG.warning("feeders: none found")
        empty = gpd.GeoDataFrame(
            {"name": pd.Series(dtype=str), "kind": pd.Series(dtype=str)},
            geometry=[],
            crs="EPSG:4326",
        )
        save_gdf(empty, paths["feeders"])
        return empty

    def kind(row):
        blob_t = blob(row).lower()
        amenity = str(row.get("amenity") or "")
        if "brt" in blob_t or "บีอาร์ที" in blob_t:
            return "brt"
        if amenity == "ferry_terminal" or "ferry" in blob_t or "pier" in blob_t or "ท่าเรือ" in blob_t:
            return "boat"
        if str(row.get("ferry") or "") == "yes":
            return "boat"
        return "boat" if "ท่า" in blob_t else "brt"

    gdf = gdf_points(gdf)
    gdf["kind"] = gdf.apply(kind, axis=1)
    gdf["name"] = gdf.apply(
        lambda r: r.get("name:en")
        if pd.notna(r.get("name:en"))
        else (r.get("name") if pd.notna(r.get("name")) else r["kind"]),
        axis=1,
    )
    # Dedup within 40 m
    m = gdf.to_crs(cfg["crs_metric"])
    xy = np.c_[m.geometry.x, m.geometry.y]
    keep, used = [], set()
    for i in range(len(m)):
        if i in used:
            continue
        d = np.hypot(xy[:, 0] - xy[i, 0], xy[:, 1] - xy[i, 1])
        used.update(np.where(d < 40)[0].tolist())
        keep.append(i)
    gdf = gdf.iloc[keep].reset_index(drop=True)
    keep_cols = [c for c in ("name", "kind", "geometry") if c in gdf.columns]
    gdf = gdf[keep_cols]
    save_gdf(gdf, paths["feeders"])
    LOG.info("feeders: %s (%s)", len(gdf), gdf["kind"].value_counts().to_dict() if len(gdf) else {})
    return gdf


def _line_label(text: str, allow) -> str:
    labels = [
        ("Gold", "BTS Gold"),
        ("Sukhumvit", "BTS Sukhumvit"),
        ("Silom", "BTS Silom"),
        ("Blue", "MRT Blue"),
        ("Purple", "MRT Purple"),
        ("Yellow", "MRT Yellow"),
        ("Pink", "MRT Pink"),
        ("Airport", "ARL"),
        ("Dark Red", "SRT Dark Red"),
        ("Light Red", "SRT Light Red"),
        ("BTS", "BTS"),
        ("MRT", "MRT"),
        ("ARL", "ARL"),
        ("Red Line", "SRT Red"),
    ]
    for needle, label in labels:
        if re.search(needle, text, re.I):
            return label
    return ""


def _haversine_m(a, b) -> float:
    lon1, lat1 = a
    lon2, lat2 = b
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlmb = np.radians(lon2 - lon1)
    h = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dlmb / 2) ** 2
    return float(2 * 6371000 * np.arcsin(np.sqrt(min(1.0, h))))


def _add_ways(G: nx.Graph, elements: list):
    for el in elements:
        geom = el.get("geometry") or []
        if len(geom) < 2:
            continue
        for a, b in zip(geom, geom[1:]):
            u = (round(a["lon"], 6), round(a["lat"], 6))
            v = (round(b["lon"], 6), round(b["lat"], 6))
            if u == v:
                continue
            G.add_node(u, x=u[0], y=u[1])
            G.add_node(v, x=v[0], y=v[1])
            G.add_edge(u, v, length=_haversine_m(u, v))


PBF_URL = "https://download.bbbike.org/osm/bbbike/Bangkok/Bangkok.osm.pbf"
SKIP_HW = {
    "motorway",
    "motorway_link",
    "trunk",
    "proposed",
    "construction",
    "abandoned",
    "raceway",
    "corridor",
}


def _graph_from_pbf(pbf: Path) -> nx.Graph:
    import osmium as osmium_mod

    G = nx.Graph()
    skip = SKIP_HW

    class WalkHandler(osmium_mod.SimpleHandler):
        def way(self, w):
            hw = w.tags.get("highway")
            if not hw or hw in skip:
                return
            if w.tags.get("foot") == "no":
                return
            coords = []
            try:
                for n in w.nodes:
                    if not n.location.valid():
                        return
                    coords.append((n.lon, n.lat))
            except osmium_mod.InvalidLocationError:
                return
            if len(coords) < 2:
                return
            for a, b in zip(coords, coords[1:]):
                u = (round(a[0], 6), round(a[1], 6))
                v = (round(b[0], 6), round(b[1], 6))
                if u == v:
                    continue
                G.add_node(u, x=u[0], y=u[1])
                G.add_node(v, x=v[0], y=v[1])
                G.add_edge(u, v, length=_haversine_m(u, v))

    LOG.info("graph: reading %s", pbf)
    WalkHandler().apply_file(str(pbf), locations=True, idx="flex_mem")
    return G


def fetch_graph(cfg, paths, exits: gpd.GeoDataFrame, fresh: bool):
    import pickle

    if not fresh and paths["graph"].exists():
        LOG.info("graph: cache")
        with paths["graph"].open("rb") as f:
            return pickle.load(f)

    pbf = paths["cache"] / "Bangkok.osm.pbf"
    _download(PBF_URL, pbf)
    G = _graph_from_pbf(pbf)
    LOG.info("graph: full extract %s nodes; clipping to exits", G.number_of_nodes())
    nodes = np.array(list(G.nodes()), dtype=float)
    if len(nodes):
        k = np.cos(np.radians(13.75))
        nxy = np.c_[nodes[:, 0] * 111000 * k, nodes[:, 1] * 111000]
        exy = np.c_[
            exits.geometry.x.to_numpy() * 111000 * k,
            exits.geometry.y.to_numpy() * 111000,
        ]
        try:
            from scipy.spatial import cKDTree

            tree = cKDTree(nxy)
            keep_idx = set()
            radius = float(cfg["graph_buffer_m"]) + 80
            for p in exy:
                keep_idx.update(tree.query_ball_point(p, radius))
            keep_nodes = [tuple(nodes[i]) for i in keep_idx]
            G = G.subgraph(keep_nodes).copy()
        except Exception as exc:
            LOG.warning("clip skipped: %s", exc)
    with paths["graph"].open("wb") as f:
        pickle.dump(G, f, protocol=4)
    LOG.info("graph: %s nodes, %s edges", G.number_of_nodes(), G.number_of_edges())
    return G


def _nearest_nodes(G, xs, ys):
    nodes = np.array(list(G.nodes()), dtype=float)
    if len(nodes) == 0:
        raise SystemExit("empty walk graph")
    # Equirectangular metres around Bangkok
    k = np.cos(np.radians(13.75))
    nxy = np.c_[nodes[:, 0] * 111000 * k, nodes[:, 1] * 111000]
    qxy = np.c_[np.asarray(xs) * 111000 * k, np.asarray(ys) * 111000]
    try:
        from scipy.spatial import cKDTree

        _, idx = cKDTree(nxy).query(qxy, k=1)
    except Exception:
        idx = [int(np.argmin(np.hypot(nxy[:, 0] - q[0], nxy[:, 1] - q[1]))) for q in qxy]
    out = []
    node_list = list(G.nodes())
    for i in np.atleast_1d(idx):
        out.append(node_list[int(i)])
    return out


def _edge_polygon(G, node_ids, buffer_m, crs_metric) -> object:
    node_ids = set(node_ids)
    if not node_ids:
        return Polygon()
    lines = []
    for u, v in G.edges():
        if u in node_ids and v in node_ids:
            lines.append(LineString([(u[0], u[1]), (v[0], v[1])]))
    if not lines:
        pts = gpd.GeoSeries(
            [Point(n[0], n[1]) for n in node_ids], crs="EPSG:4326"
        ).to_crs(crs_metric)
        return pts.buffer(buffer_m).union_all()
    geom = (
        gpd.GeoSeries(lines, crs="EPSG:4326")
        .to_crs(crs_metric)
        .buffer(buffer_m)
        .union_all()
    )
    return make_valid(geom)


def _feat_poly(geom, simplify_m):
    geom = make_valid(geom).simplify(simplify_m)
    if geom.is_empty:
        return None
    if geom.geom_type == "GeometryCollection":
        bits = [g for g in geom.geoms if g.geom_type in ("Polygon", "MultiPolygon")]
        geom = unary_union(bits) if bits else Polygon()
    return None if geom.is_empty else geom


def classes_from_origins(cfg, G, origins, study, speed_kmh: float) -> gpd.GeoDataFrame:
    """4-class walk isochrones: <5, 5–10, 10–15, >15 minutes."""
    m_per_min = float(speed_kmh) * 1000 / 60.0
    d5, d10, d15 = m_per_min * 5, m_per_min * 10, m_per_min * 15
    xs = origins.geometry.x.to_numpy()
    ys = origins.geometry.y.to_numpy()
    nn = _nearest_nodes(G, xs, ys)
    dist = nx.multi_source_dijkstra_path_length(G, set(nn), cutoff=d15, weight="length")
    n5 = [n for n, d in dist.items() if d <= d5]
    n10 = [n for n, d in dist.items() if d <= d10]
    n15 = list(dist.keys())
    LOG.info(
        "isochrones %.1f km/h: %s / %s / %s nodes at 5 / 10 / 15 min",
        speed_kmh, len(n5), len(n10), len(n15),
    )
    buf = cfg["edge_buffer_m"]
    crs = cfg["crs_metric"]
    p5 = _edge_polygon(G, n5, buf, crs)
    p10 = _edge_polygon(G, n10, buf, crs)
    p15 = _edge_polygon(G, n15, buf, crs)
    study_m = make_valid(study.to_crs(crs).union_all())
    p5 = make_valid(p5).intersection(study_m)
    p10 = make_valid(p10).intersection(study_m)
    p15 = make_valid(p15).intersection(study_m)
    bands = (
        ("<5", p5),
        ("5-10", make_valid(p10.difference(p5))),
        ("10-15", make_valid(p15.difference(p10))),
        (">15", make_valid(study_m.difference(p15))),
    )
    rows = []
    for klass, geom in bands:
        g = _feat_poly(geom, cfg["simplify_m"])
        if g is not None:
            rows.append({"class": klass, "speed_kmh": speed_kmh, "geometry": g})
    return gpd.GeoDataFrame(rows, crs=crs).to_crs(4326)


def compute_isochrones(cfg, paths, G, exits, stations, study, fresh: bool):
    if not fresh and paths["classes"].exists():
        LOG.info("isochrones: cache")
        return read_gdf(paths["classes"]), (
            read_gdf(paths["station_iso"]) if paths["station_iso"].exists() else None
        )

    speed = float(cfg["walk_speed_kmh"])
    classes = classes_from_origins(cfg, G, exits, study, speed)
    save_gdf(classes, paths["classes"])

    if paths["station_iso"].exists():
        LOG.info("station iso: keep existing")
        return classes, read_gdf(paths["station_iso"])

    # Per-station 15-min polygons at the default speed, for click inspect
    m_per_min = speed * 1000 / 60.0
    d10, d15 = m_per_min * 10, m_per_min * 15
    xs = exits.geometry.x.to_numpy()
    ys = exits.geometry.y.to_numpy()
    nn = _nearest_nodes(G, xs, ys)
    exits = exits.copy()
    exits["node"] = nn
    iso_rows = []
    by_sta = exits.groupby("station")
    for name, grp in by_sta:
        sources = set(grp["node"].tolist())
        d = nx.multi_source_dijkstra_path_length(G, sources, cutoff=d15, weight="length")
        n10 = [n for n, dd in d.items() if dd <= d10]
        n15 = list(d.keys())
        p10 = _feat_poly(_edge_polygon(G, n10, cfg["edge_buffer_m"], cfg["crs_metric"]), cfg["simplify_m"])
        p15 = _feat_poly(_edge_polygon(G, n15, cfg["edge_buffer_m"], cfg["crs_metric"]), cfg["simplify_m"])
        line = grp["line"].iloc[0] if "line" in grp.columns else ""
        if p15 is not None:
            iso_rows.append({"station": name, "line": line, "band": "15", "geometry": p15})
        if p10 is not None:
            iso_rows.append({"station": name, "line": line, "band": "10", "geometry": p10})
    station_iso = gpd.GeoDataFrame(iso_rows, crs=cfg["crs_metric"]).to_crs(4326)
    save_gdf(station_iso, paths["station_iso"])
    LOG.info("isochrones: default %.1f km/h + %s station bands", speed, len(station_iso))
    return classes, station_iso


def _to_wgs_simple(gdf: gpd.GeoDataFrame, simplify_deg=0.00015) -> gpd.GeoDataFrame:
    out = gdf.copy()
    out["geometry"] = out.geometry.simplify(simplify_deg, preserve_topology=True)
    return out


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


def export_site(cfg, paths, classes, stations, rail, khet, study, station_iso, extra=None):
    extra = extra or {}
    out = paths["out"]
    LOG.info("export: %s", out)

    cls = _to_wgs_simple(classes)
    save_gdf(cls, out / "classes.geojson")

    sta = stations.copy()
    if "geometry" in sta:
        save_gdf(sta, out / "stations.geojson")

    if rail is not None and not rail.empty:
        save_gdf(_to_wgs_simple(rail, 0.0002), out / "rail.geojson")
    else:
        save_gdf(
            gpd.GeoDataFrame({"name": [], "geometry": []}, crs="EPSG:4326"),
            out / "rail.geojson",
        )

    khet_out = khet.copy()
    if "name" not in khet_out.columns:
        khet_out["name"] = khet_out.get("name_en", "")
    save_gdf(_to_wgs_simple(khet_out[["name", "geometry"]], 0.0002), out / "khet.geojson")

    study_out = study.copy()
    study_out["name"] = "study"
    save_gdf(_to_wgs_simple(study_out, 0.0002), out / "study.geojson")

    if station_iso is not None and not station_iso.empty:
        save_gdf(_to_wgs_simple(station_iso, 0.00025), out / "station_iso.geojson")

    feeders = extra.get("feeders")
    if feeders is not None and not feeders.empty:
        save_gdf(feeders, out / "feeders.geojson")

    for key, gdf in extra.get("classes", {}).items():
        dest = out / f"classes_{key}.geojson"
        save_gdf(_to_wgs_simple(gdf), dest)

    n_feed = int(len(feeders)) if feeders is not None else 0
    meta = {
        "walk_speed_kmh": cfg["walk_speed_kmh"],
        "walk_speeds_kmh": cfg.get("walk_speeds_kmh", [cfg["walk_speed_kmh"]]),
        "cutoffs_min": cfg["cutoffs_min"],
        "edge_buffer_m": cfg["edge_buffer_m"],
        "n_stations": int(len(stations)),
        "n_exits": int(stations["exits"].sum()) if "exits" in stations.columns else int(len(stations)),
        "n_feeders": n_feed,
        "osm_pulled": date.today().isoformat(),
        "crs": "EPSG:4326",
        "study": "BMA 50 districts plus adjacent station districts in Nonthaburi, Samut Prakan, Pathum Thani",
        "lines": "BTS Sukhumvit/Silom/Gold, MRT Blue/Purple/Yellow/Pink, ARL, SRT Dark Red/Light Red",
        "also": "Chao Phraya and canal boat piers as optional origins",
        "speed_note": "4.0 km/h is a typical urban walk in heat; 3.6 slower, 4.5 brisk. Not realtor 5 km/h.",
    }
    (out / "meta.json").write_text(json.dumps(meta, indent=2))
    render_png(cfg, out, classes, khet, rail, stations, study, None)
    for p in out.glob("*.geojson"):
        minify_geojson(p)
    jpg = out / "access-16x9.jpg"
    png = out / "access-16x9.png"
    if png.exists():
        try:
            from PIL import Image

            im = Image.open(png).convert("RGB")
            im.save(jpg, format="JPEG", quality=82, optimize=True, progressive=True)
        except Exception as exc:
            LOG.warning("jpeg skipped: %s", exc)


def render_png(cfg, out: Path, classes, khet, rail, stations, study, feeders=None):
    LOG.info("export: 16:9 PNG")
    metric = cfg["crs_metric"]
    fig, ax = plt.subplots(figsize=(16, 9), dpi=120, facecolor="#f4efe6")
    ax.set_facecolor("#e8e4dc")

    study_m = study.to_crs(metric)
    khet_m = khet.to_crs(metric)
    cls_m = classes.to_crs(metric)
    minx, miny, maxx, maxy = study_m.total_bounds
    pad = 0.02 * max(maxx - minx, maxy - miny)
    minx, miny, maxx, maxy = minx - pad, miny - pad, maxx + pad, maxy + pad
    w, h = maxx - minx, maxy - miny
    if w / h < 16 / 9:
        extra = ((16 / 9) * h - w) / 2
        minx -= extra
        maxx += extra
    else:
        extra = (w / (16 / 9) - h) / 2
        miny -= extra
        maxy += extra
    ax.set_xlim(minx, maxx)
    ax.set_ylim(miny, maxy)
    ax.set_aspect("equal")

    try:
        import contextily as cx

        cx.add_basemap(
            ax,
            crs=metric,
            source=cx.providers.Esri.WorldStreetMap,
            attribution=False,
            zoom=11,
        )
    except Exception as exc:
        LOG.warning("basemap skipped: %s", exc)

    order = {">15": 0, "10-15": 1, "5-10": 2, "<5": 3, "<10": 3}
    alpha_for = {"<5": 0.08, "5-10": 0.42, "10-15": 0.50, ">15": 0.48, "<10": 0.08}
    cls_m = cls_m.copy()
    cls_m["_o"] = cls_m["class"].map(order).fillna(1)
    for _, row in cls_m.sort_values("_o").iterrows():
        color = CLASS_COLORS.get(row["class"], "#e8923a")
        alpha = alpha_for.get(row["class"], 0.45)
        gpd.GeoSeries([row.geometry], crs=metric).plot(
            ax=ax, facecolor=color, edgecolor="none", alpha=alpha, zorder=2
        )

    khet_m.boundary.plot(ax=ax, color="#2f6f6a", linewidth=0.45, zorder=3)
    study_m.boundary.plot(ax=ax, color="#5b2d8e", linewidth=1.1, zorder=4)
    if rail is not None and not rail.empty:
        rail.to_crs(metric).plot(ax=ax, color="#3a3a3a", linewidth=0.9, zorder=5)
    stations.to_crs(metric).plot(
        ax=ax, color="#1a1a1a", markersize=6, zorder=6, marker="o"
    )
    if feeders is not None and not feeders.empty:
        fm = feeders.to_crs(metric)
        brt = fm[fm["kind"] == "brt"] if "kind" in fm.columns else fm.iloc[0:0]
        boat = fm[fm["kind"] == "boat"] if "kind" in fm.columns else fm.iloc[0:0]
        if len(brt):
            brt.plot(ax=ax, color="#2c6e49", markersize=10, zorder=7, marker="s")
        if len(boat):
            boat.plot(ax=ax, color="#1d4e89", markersize=10, zorder=7, marker="D")

    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

    ax.text(
        0.01,
        0.97,
        "Walk access to urban rail",
        transform=ax.transAxes,
        fontsize=16,
        fontweight="medium",
        color="#1a1a1a",
        va="top",
        fontfamily="serif",
    )
    ax.text(
        0.01,
        0.925,
        "Bangkok  ·  minutes to nearest station exit  ·  typical walk 4.0 km/h (OSM)",
        transform=ax.transAxes,
        fontsize=8,
        color="#444",
        va="top",
    )
    legend_y = 0.14
    for i, (label, color) in enumerate(
        [
            ("< 5 min", CLASS_COLORS["<5"]),
            ("5–10 min", CLASS_COLORS["5-10"]),
            ("10–15 min", CLASS_COLORS["10-15"]),
            ("> 15 min", CLASS_COLORS[">15"]),
        ]
    ):
        ax.add_patch(
            plt.Rectangle(
                (0.01, legend_y - i * 0.035),
                0.018,
                0.022,
                transform=ax.transAxes,
                facecolor=color,
                edgecolor="#333",
                linewidth=0.4,
                alpha=0.85 if i else 0.9,
                clip_on=False,
            )
        )
        ax.text(
            0.034,
            legend_y - i * 0.035 + 0.002,
            label,
            transform=ax.transAxes,
            fontsize=8,
            color="#222",
            va="bottom",
        )
    ax.text(
        0.01,
        0.02,
        "Travel Behavior Research Group  ·  Chulalongkorn University  ·  OSM © contributors",
        transform=ax.transAxes,
        fontsize=7,
        color="#555",
    )
    fig.subplots_adjust(0, 0, 1, 1)
    png = out / "access-16x9.png"
    fig.savefig(png, dpi=120, facecolor=fig.get_facecolor())
    plt.close(fig)
    LOG.info("wrote %s (%.1f MB)", png, png.stat().st_size / 1e6)


def refine_study(cfg, khet, stations):
    """All BMA khet, plus adjacent-province districts that contain a station."""
    khet_m = khet.to_crs(cfg["crs_metric"])
    sta_m = stations.to_crs(cfg["crs_metric"])
    joined = gpd.sjoin(khet_m, sta_m[["geometry", "station"]], predicate="contains", how="left")
    has_sta = set(joined.loc[joined["station"].notna()].index)
    in_bkk = khet["in_bkk"].astype(str).isin(["True", "true", "1"]) if "in_bkk" in khet.columns else False
    picked = khet[in_bkk | khet.index.isin(has_sta)].copy()
    if picked.empty:
        picked = khet
    study = gpd.GeoDataFrame(
        {"name": ["study"]}, geometry=[picked.union_all()], crs=picked.crs
    )
    LOG.info("study area from %s districts (%s with stations outside BMA)", len(picked), len(has_sta))
    return study, picked


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=str(Path(__file__).with_name("config.yaml")))
    parser.add_argument("--fresh", action="store_true")
    args = parser.parse_args()

    cfg = load_config(Path(args.config) if Path(args.config).is_absolute() else ROOT / args.config)
    paths = cache_paths(cfg)
    allow, deny = compile_patterns(cfg)

    ox.settings.use_cache = True
    ox.settings.cache_folder = str(paths["cache"] / "ox")
    ox.settings.log_console = False
    ox.settings.overpass_url = "https://maps.mail.ru/osm/tools/overpass/api"
    ox.settings.overpass_rate_limit = False
    ox.settings.timeout = 180
    ox.settings.requests_timeout = 180
    # One Overpass call for the study bbox (default 50 km² tiling is ~100 requests).
    ox.settings.max_query_area_size = 5_000_000_000

    khet, study_all = fetch_boundaries(cfg, paths, args.fresh)
    stations, exits, rail = fetch_rail(cfg, paths, allow, deny, args.fresh)
    study, khet_kept = refine_study(cfg, khet, stations)
    save_gdf(study, paths["study"])
    save_gdf(
        khet_kept.rename(columns={"name_en": "name"})
        if "name" not in khet_kept.columns
        else khet_kept,
        paths["khet"],
    )

    feeders = fetch_feeders(cfg, paths, args.fresh)
    G = fetch_graph(cfg, paths, exits, args.fresh)

    # Clip the walk graph to origins so 6 isochrone runs stay tractable.
    all_pts = pd.concat(
        [exits[["geometry"]], feeders[["geometry"]]] if not feeders.empty else [exits[["geometry"]]],
        ignore_index=True,
    )
    all_pts = gpd.GeoDataFrame(all_pts, crs=exits.crs)
    if G.number_of_nodes() > 250_000:
        LOG.info("clipping walk graph (%s nodes) to feeder buffers", G.number_of_nodes())
        nodes = np.array(list(G.nodes()), dtype=float)
        k = np.cos(np.radians(13.75))
        nxy = np.c_[nodes[:, 0] * 111000 * k, nodes[:, 1] * 111000]
        exy = np.c_[
            all_pts.geometry.x.to_numpy() * 111000 * k,
            all_pts.geometry.y.to_numpy() * 111000,
        ]
        from scipy.spatial import cKDTree

        tree = cKDTree(nxy)
        keep_idx = set()
        radius = float(cfg["graph_buffer_m"]) + 80
        for p in exy:
            keep_idx.update(tree.query_ball_point(p, radius))
        keep_nodes = [tuple(nodes[i]) for i in keep_idx]
        G = G.subgraph(keep_nodes).copy()
        LOG.info("clipped graph: %s nodes", G.number_of_nodes())

    default_speed = float(cfg["walk_speed_kmh"])
    classes, station_iso = compute_isochrones(
        cfg, paths, G, exits, stations, study, True
    )

    speeds = cfg.get("walk_speeds_kmh") or [default_speed]
    extra_classes = {}
    if feeders is not None and not feeders.empty:
        all_origins = gpd.GeoDataFrame(
            pd.concat([exits[["geometry"]], feeders[["geometry"]]], ignore_index=True),
            crs=exits.crs,
        )
    else:
        all_origins = exits
    for sp in speeds:
        key = str(sp).replace(".", "")
        extra_classes[key] = classes_from_origins(cfg, G, exits, study, float(sp))
        extra_classes[f"all_{key}"] = classes_from_origins(cfg, G, all_origins, study, float(sp))

    export_site(
        cfg,
        paths,
        extra_classes.get("40", classes),
        stations,
        rail,
        khet_kept,
        study,
        station_iso,
        extra={"feeders": feeders, "classes": extra_classes},
    )
    LOG.info("done")


if __name__ == "__main__":
    main()
