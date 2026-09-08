---
title: Walk access to urban rail
date: 2026-09-08
theme: access
---
The group’s first-mile map asks one question: how far is the walk to the nearest urban-rail *exit* in Bangkok, on the street network, at a typical walking speed.

That is not “as the crow flies,” and it is not a realtor’s 5 km/h circle. The default is **4.0 km/h** (67 m/min) — a pace that is plausible in heat. Slow (3.6) and brisk (4.5) are precomputed layers, not a live router. At 4.0 km/h, five minutes is 333 m on the network, ten minutes 667 m, fifteen minutes 1 km.

Origins are station exits from OpenStreetMap (`railway=subway_entrance` and entrance nodes), not the station centroid. If OSM has no exit, the station node is used — which makes some stations look worse than they are. Isochrones are unioned per station, then across the city. White is under 5 minutes, gold 5–10, orange 10–15, red beyond 15. Parks, rivers, and expressway boxes stay red when they have no walkable OSM edge.

The default layer is operating urban rail: BTS Sukhumvit, Silom, and Gold; MRT Blue, Purple, Yellow, and Pink; Airport Rail Link; SRT Dark Red and Light Red. An optional toggle adds Chao Phraya and canal boat piers. Conventional long-distance SRT and unopened Orange are out.

The study area is all 50 Bangkok districts, plus districts in Nonthaburi, Samut Prakan, and Pathum Thani that contain a selected station. GeoJSON and a 16:9 poster are on [Data]({{ '/data/' | relative_url }}). Cite TBRG and OpenStreetMap contributors.

This map is the walk to rail. It is not the Public Transport Accessibility Index (PTAI), which is a demand-weighted generalized-cost index for 88 inner-Bangkok subdistricts. [Access vs PTAI]({{ site.baseurl }}{% post_url 2026-09-08-access-and-ptai %}) is the short comparison. [Open the map]({{ '/access/' | relative_url }}).
