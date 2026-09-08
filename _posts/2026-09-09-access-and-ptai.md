---
title: Access vs PTAI
date: 2026-09-09
theme: access
---
The lab has two access measures that are easy to mix up. They answer different questions, on different networks, and only one of them can be published as a map on this site.

| | Walk access (`/access/`) | PTAI |
|---|---|---|
| Question | How far is the walk to urban rail? | Why is generalized travel cost high? |
| Geography | 50 Bangkok districts, plus neighbouring districts that contain a selected station | 88 inner-Bangkok subdistricts (khwaeng) |
| Network | OpenStreetMap walk graph, from station *exits* | Transit routing used in the lab paper (evening peak) |
| Output | 5 / 10 / 15 minute isochrones at 4.0 km/h | Demand-weighted index (inverse of generalized cost) |
| On this site | [Interactive map]({{ '/access/' | relative_url }}) and [GeoJSON]({{ '/data/' | relative_url }}) | Related work only. Routing legs cannot be republished. |

Walk access will paint a park red because OSM has no footpath through it. PTAI can show a khwaeng as costly because the bus is slow, the fare is high, or the wait is long — even if a station is nearby as the crow flies. Neither is a verdict on “this place is inaccessible” without the other.

Use the map when the question is first-mile walking. Use PTAI (on request, with a name and an intended use) when the question is generalized cost across modes. Method for the map: [Walk access to urban rail]({{ '/2026/09/08/walk-access-map.html' | relative_url }}).
