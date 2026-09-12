---
title: Primal and dual walk access
date: 2026-09-12
theme: access
---
The Access map’s default view answers a dual question: **how many minutes is the walk to the nearest urban-rail station?** That is the cost of reaching one opportunity.

Cui and Levinson (2020) distinguish that from **primal** access: fix the cost, count the opportunities. On this map the cost is a 15-minute walk at 4.0 km/h, and the opportunities are urban-rail stations, not jobs. The layer *Stations in 15 min* colours a cell by how many stations sit inside that walk — 0, 1, 2, 3, or 4 and more. The two views are complements. A place 6 minutes from one station and a place 6 minutes from four stations look the same on the default map; they do not on the primal layer.

Interchanges (Siam, Tao Poon, Lak Si) rise on primal because more than one station is walkable. A single-line suburb can look fine on dual (the nearest station is close) and thin on primal (there is only that one). Red on primal is the same statement as red on dual at 15 minutes: no urban-rail station is within a 15-minute walk.

This is still first-mile walk access. It is not Hansen job access, and it is not the [Public Transport Accessibility Index]({{ site.baseurl }}{% post_url 2026-09-08-access-and-ptai %}), which uses demand-weighted generalised cost across 88 subdistricts. Speed options stay on the dual layer; primal is computed once at 4.0 km/h from the per-station 15-minute polygons.

Cui, M., and Levinson, D. (2020). Primal and Dual Access. *Geographical Analysis* 52(3), 452–474. [doi:10.1111/gean.12220](https://doi.org/10.1111/gean.12220). [Open the map]({{ '/access/' | relative_url }}).
