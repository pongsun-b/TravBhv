# Bangkok walk-isochrone builder

Offline pipeline for the public `/access/` map. Jekyll does not run this.

```bash
python3 -m venv scripts/access/.venv
scripts/access/.venv/bin/pip install -r scripts/access/requirements.txt
scripts/access/.venv/bin/python scripts/access/build.py
```

Walk speed defaults to **4.0 km/h** (typical urban walk in heat). `config.yaml` also precomputes 3.6 (slower) and 4.5 (brisk). The map UI switches those layers; GitHub Pages cannot recompute live.

`--fresh` ignores `scripts/access/cache/` and re-downloads OSM.

Outputs land in `access-data/` (GeoJSON + 16:9 PNG) and are what the site loads.
