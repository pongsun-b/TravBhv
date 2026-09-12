(function () {
  var el = document.getElementById("access-map");
  if (!el || typeof L === "undefined") return;

  var base = el.getAttribute("data-base") || "/access-data/";
  if (base.slice(-1) !== "/") base += "/";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var map = L.map(el, {
    zoomControl: true,
    scrollWheelZoom: false,
    tapTolerance: 15
  }).setView([13.75, 100.55], 11);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; OSM walk graph &copy; OpenStreetMap contributors",
      maxZoom: 19
    }
  ).addTo(map);

  el.addEventListener("click", function () {
    map.scrollWheelZoom.enable();
  });
  el.addEventListener("mouseleave", function () {
    map.scrollWheelZoom.disable();
  });

  var view = "combined";
  var speed = "40";
  var useAll = false;
  var classLayers = {};
  var classesLayer, khetLayer, railLayer, stationsLayer, feedersLayer, isoLayer, studyLayer, primalLayer;
  var primalData = null;
  var metaInfo = null;
  var stationIndex = [];
  var locMarker, locCircle;

  function fly(latlng, zoom) {
    if (reduceMotion) map.setView(latlng, zoom);
    else map.flyTo(latlng, zoom, { duration: 0.55 });
  }

  function setStatus(msg) {
    var box = document.getElementById("access-status");
    if (!box) return;
    if (msg) {
      box.hidden = false;
      box.textContent = msg;
    } else {
      box.hidden = true;
      box.textContent = "";
    }
  }

  function updateMeta() {
    var box = document.getElementById("access-meta");
    if (!box) return;
    var n = metaInfo && metaInfo.n_stations != null ? " · " + metaInfo.n_stations + " stations" : "";
    if (view === "primal15") {
      box.textContent = "4.0 km/h · stations within 15 min (primal)" + n;
      return;
    }
    var sp = speed === "36" ? "3.6" : speed === "45" ? "4.5" : "4.0";
    var extra = useAll ? " · rail + boats" : " · urban rail";
    box.textContent = sp + " km/h" + extra + n;
  }

  function updateLegend() {
    var dual = document.querySelector('[data-legend="dual"]');
    var primal = document.querySelector('[data-legend="primal"]');
    if (dual) dual.hidden = view === "primal15";
    if (primal) primal.hidden = view !== "primal15";
  }

  function setPrimalMode(on) {
    document.querySelectorAll('input[name="access-speed"]').forEach(function (el) {
      el.disabled = on;
    });
    var panel = document.querySelector(".access-panel");
    if (panel) panel.classList.toggle("is-primal", on);
  }

  function primalStyle(feature) {
    var k = (feature.properties && feature.properties.class) || "0";
    var colors = {
      "0": "#d4564c",
      "1": "#dce8f5",
      "2": "#8bb4d9",
      "3": "#3d7eb8",
      "4+": "#0b3d6e"
    };
    var c = colors[k] || "#d4564c";
    return {
      color: c,
      fillColor: c,
      fillOpacity: k === "0" ? 0.45 : 0.55,
      weight: 0
    };
  }

  function classStyle(feature) {
    var klass = feature.properties && feature.properties.class;
    if (view === "gaps10") {
      if (klass === "<5" || klass === "5-10" || klass === "<10")
        return { fillOpacity: 0, stroke: false };
      return { color: "#d4564c", fillColor: "#d4564c", fillOpacity: 0.45, weight: 0 };
    }
    if (view === "gaps15") {
      if (klass === ">15")
        return { color: "#d4564c", fillColor: "#d4564c", fillOpacity: 0.45, weight: 0 };
      return { fillOpacity: 0, stroke: false };
    }
    if (klass === "<5" || klass === "<10")
      return { color: "#f7f4ef", fillColor: "#f7f4ef", fillOpacity: 0.1, weight: 0 };
    if (klass === "5-10")
      return { color: "#f3c07a", fillColor: "#f3c07a", fillOpacity: 0.42, weight: 0 };
    if (klass === "10-15")
      return { color: "#e07a3d", fillColor: "#e07a3d", fillOpacity: 0.5, weight: 0 };
    return { color: "#d4564c", fillColor: "#d4564c", fillOpacity: 0.45, weight: 0 };
  }

  function fileFor() {
    var prefix = useAll ? "classes_all_" : "classes_";
    return prefix + speed + ".geojson";
  }

  function showClasses(data) {
    if (primalLayer && map.hasLayer(primalLayer)) map.removeLayer(primalLayer);
    if (classesLayer) map.removeLayer(classesLayer);
    classesLayer = L.geoJSON(data, { style: classStyle, interactive: false }).addTo(map);
  }

  function showPrimal(data) {
    if (classesLayer && map.hasLayer(classesLayer)) map.removeLayer(classesLayer);
    if (primalLayer) map.removeLayer(primalLayer);
    primalLayer = L.geoJSON(data, { style: primalStyle, interactive: false }).addTo(map);
    if (railLayer && map.hasLayer(railLayer)) railLayer.bringToFront();
    if (stationsLayer && map.hasLayer(stationsLayer)) stationsLayer.bringToFront();
    if (feedersLayer && map.hasLayer(feedersLayer)) feedersLayer.bringToFront();
  }

  function applyView() {
    setPrimalMode(view === "primal15");
    updateLegend();
    if (view === "primal15") {
      if (primalData) {
        showPrimal(primalData);
        updateMeta();
        return;
      }
      setStatus("Loading primal access…");
      loadJSON("primal_15.geojson")
        .then(function (data) {
          primalData = data;
          showPrimal(data);
          setStatus("");
          updateMeta();
        })
        .catch(function () {
          setStatus("Primal layer is not in this build yet.");
        });
      return;
    }
    if (primalLayer && map.hasLayer(primalLayer)) map.removeLayer(primalLayer);
    if (classesLayer) {
      if (!map.hasLayer(classesLayer)) classesLayer.addTo(map);
      classesLayer.setStyle(classStyle);
    } else {
      switchLayer();
    }
    updateMeta();
  }

  function switchLayer() {
    if (view === "primal15") return;
    var name = fileFor();
    if (classLayers[name]) {
      showClasses(classLayers[name]);
      return;
    }
    var sp = speed === "36" ? "3.6" : speed === "45" ? "4.5" : "4.0";
    setStatus("Loading " + sp + " km/h layer…");
    loadJSON(name)
      .then(function (data) {
        classLayers[name] = data;
        showClasses(data);
        setStatus("");
      })
      .catch(function () {
        setStatus("");
        if (classLayers["classes.geojson"]) showClasses(classLayers["classes.geojson"]);
      });
  }

  function loadJSON(name) {
    return fetch(base + name).then(function (r) {
      if (!r.ok) throw new Error(name);
      return r.json();
    });
  }

  function hideStationIso() {
    if (isoLayer && map.hasLayer(isoLayer)) map.removeLayer(isoLayer);
  }

  function ensureIso(done) {
    if (isoLayer) {
      done();
      return;
    }
    loadJSON("station_iso.geojson")
      .then(function (data) {
        isoLayer = L.geoJSON(data, {
          style: function (f) {
            var band = f.properties && f.properties.band;
            return {
              color: band === "10" ? "#888" : "#e07a3d",
              weight: 1.2,
              fillOpacity: 0.15,
              fillColor: band === "10" ? "#fff" : "#e07a3d",
              opacity: 0
            };
          }
        });
        done();
      })
      .catch(function () {
        done();
      });
  }

  function showStationIso(name) {
    ensureIso(function () {
      if (!isoLayer) return;
      isoLayer.eachLayer(function (lyr) {
        var same =
          lyr.feature &&
          lyr.feature.properties &&
          lyr.feature.properties.station === name;
        lyr.setStyle({
          opacity: same ? 1 : 0,
          fillOpacity: same ? 0.2 : 0
        });
      });
      if (!map.hasLayer(isoLayer)) isoLayer.addTo(map);
    });
  }

  function selectStation(entry) {
    if (!map.hasLayer(stationsLayer)) {
      stationsLayer.addTo(map);
      var box = document.getElementById("tog-stations");
      if (box) box.checked = true;
    }
    fly(entry.latlng, 14);
    if (entry.layer) entry.layer.openPopup();
    showStationIso(entry.name);
    var find = document.getElementById("access-find");
    if (find) find.value = entry.name;
    hideResults();
  }

  function hideResults() {
    var list = document.getElementById("access-find-results");
    if (!list) return;
    list.hidden = true;
    list.innerHTML = "";
  }

  function renderResults(hits) {
    var list = document.getElementById("access-find-results");
    if (!list) return;
    list.innerHTML = "";
    if (!hits.length) {
      list.hidden = true;
      return;
    }
    hits.forEach(function (entry) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = entry.label;
      btn.addEventListener("click", function () {
        selectStation(entry);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    list.hidden = false;
  }

  function norm(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function searchStations(q) {
    q = norm(q);
    if (q.length < 1) return [];
    var hits = [];
    for (var i = 0; i < stationIndex.length; i++) {
      if (stationIndex[i].key.indexOf(q) !== -1) hits.push(stationIndex[i]);
    }
    hits.sort(function (a, b) {
      var a0 = a.key.indexOf(q);
      var b0 = b.key.indexOf(q);
      if (a0 !== b0) return a0 - b0;
      return a.name.localeCompare(b.name);
    });
    return hits.slice(0, 8);
  }

  function wireSearch() {
    var find = document.getElementById("access-find");
    if (!find) return;
    find.addEventListener("input", function () {
      var hits = searchStations(find.value);
      renderResults(hits);
    });
    find.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        hideResults();
        find.blur();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        var hits = searchStations(find.value);
        if (hits[0]) selectStation(hits[0]);
      }
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest(".access-search") || e.target.closest(".access-find-results"))
        return;
      hideResults();
    });
  }

  function wireLocate() {
    var btn = document.getElementById("access-locate");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!navigator.geolocation) {
        setStatus("This browser cannot share a location.");
        return;
      }
      setStatus("Finding your location…");
      map.locate({ enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
    });
    map.on("locationfound", function (e) {
      if (locMarker) map.removeLayer(locMarker);
      if (locCircle) map.removeLayer(locCircle);
      locMarker = L.circleMarker(e.latlng, {
        radius: 7,
        color: "#8b050d",
        fillColor: "#e0565e",
        fillOpacity: 1,
        weight: 2
      }).addTo(map);
      locMarker.bindPopup("You are here").openPopup();
      locCircle = L.circle(e.latlng, {
        radius: e.accuracy,
        color: "#8b050d",
        fillColor: "#e0565e",
        fillOpacity: 0.08,
        weight: 1
      }).addTo(map);
      var bkk = L.latLng(13.75, 100.55);
      if (e.latlng.distanceTo(bkk) > 90000) {
        setStatus("Your location is outside the Bangkok study area.");
        return;
      }
      setStatus("");
      fly(e.latlng, Math.max(map.getZoom(), 14));
    });
    map.on("locationerror", function () {
      setStatus("Could not read your location. Check the browser permission.");
    });
  }

  Promise.all([
    loadJSON("classes_40.geojson").catch(function () { return loadJSON("classes.geojson"); }),
    loadJSON("khet.geojson"),
    loadJSON("rail.geojson"),
    loadJSON("stations.geojson"),
    loadJSON("study.geojson").catch(function () { return null; }),
    loadJSON("meta.json").catch(function () { return null; }),
    loadJSON("feeders.geojson").catch(function () { return null; })
  ])
    .then(function (pack) {
      var classes = pack[0];
      var khet = pack[1];
      var rail = pack[2];
      var stations = pack[3];
      var study = pack[4];
      metaInfo = pack[5];
      var feeders = pack[6];

      classLayers["classes_40.geojson"] = classes;
      classLayers["classes.geojson"] = classes;
      showClasses(classes);

      if (study) {
        studyLayer = L.geoJSON(study, {
          style: { color: "#5b2d8e", weight: 2, fill: false },
          interactive: false
        }).addTo(map);
      }

      khetLayer = L.geoJSON(khet, {
        style: { color: "#2f6f6a", weight: 1, fill: false },
        interactive: false
      }).addTo(map);

      railLayer = L.geoJSON(rail, {
        style: { color: "#222", weight: 1.6, opacity: 0.85 },
        interactive: false
      }).addTo(map);

      stationsLayer = L.geoJSON(stations, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 6,
            color: "#111",
            fillColor: "#111",
            fillOpacity: 1,
            weight: 2
          });
        },
        onEachFeature: function (feature, layer) {
          var p = feature.properties || {};
          var name = p.station || p.name || "Station";
          var bits = ["<strong>" + name + "</strong>"];
          if (p.line) bits.push(p.line);
          if (p.exits) bits.push(p.exits + " mapped exits");
          layer.bindPopup(bits.join("<br>"));
          var label = p.line ? name + " · " + p.line : name;
          stationIndex.push({
            name: name,
            line: p.line || "",
            label: label,
            key: norm(name + " " + (p.line || "")),
            latlng: layer.getLatLng(),
            layer: layer
          });
          layer.on("click", function (e) {
            L.DomEvent.stopPropagation(e);
            showStationIso(name);
          });
        }
      }).addTo(map);

      if (feeders) {
        feedersLayer = L.geoJSON(feeders, {
          pointToLayer: function (feature, latlng) {
            var kind = feature.properties && feature.properties.kind;
            var boat = kind === "boat";
            return L.circleMarker(latlng, {
              radius: 5,
              color: boat ? "#1d4e89" : "#2c6e49",
              fillColor: boat ? "#1d4e89" : "#2c6e49",
              fillOpacity: 0.95,
              weight: 1
            });
          },
          onEachFeature: function (feature, layer) {
            var p = feature.properties || {};
            var label = p.kind === "brt" ? "BRT" : "Boat pier";
            layer.bindPopup("<strong>" + (p.name || label) + "</strong><br>" + label);
          }
        });
      }

      map.on("click", function () {
        hideStationIso();
      });

      var bounds = classesLayer.getBounds();
      if (bounds.isValid()) {
        var wide = window.innerWidth > 720;
        map.fitBounds(bounds, {
          paddingTopLeft: [wide ? 300 : 16, 16],
          paddingBottomRight: [16, 16]
        });
      }
      var loading = el.querySelector(".access-loading");
      if (loading) loading.remove();
      map.invalidateSize();

      updateMeta();
      wireSearch();
      wireLocate();
    })
    .catch(function (err) {
      el.innerHTML =
        '<p class="access-missing">Map data is not in this build yet. Run <code>scripts/access/build.py</code>.</p>';
      console.error(err);
    });

  document.querySelectorAll('input[name="access-view"]').forEach(function (input) {
    input.addEventListener("change", function () {
      view = input.value;
      applyView();
    });
  });
  document.querySelectorAll('input[name="access-speed"]').forEach(function (input) {
    input.addEventListener("change", function () {
      speed = input.value;
      switchLayer();
      updateMeta();
    });
  });
  var allBox = document.getElementById("tog-all");
  if (allBox) {
    allBox.addEventListener("change", function () {
      useAll = allBox.checked;
      switchLayer();
      if (feedersLayer) {
        if (useAll) feedersLayer.addTo(map);
        else map.removeLayer(feedersLayer);
      }
      updateMeta();
    });
  }

  document.getElementById("tog-khet").addEventListener("change", function () {
    if (!khetLayer) return;
    if (this.checked) khetLayer.addTo(map);
    else map.removeLayer(khetLayer);
  });
  document.getElementById("tog-rail").addEventListener("change", function () {
    if (!railLayer) return;
    if (this.checked) railLayer.addTo(map);
    else map.removeLayer(railLayer);
  });
  document.getElementById("tog-stations").addEventListener("change", function () {
    if (!stationsLayer) return;
    if (this.checked) stationsLayer.addTo(map);
    else map.removeLayer(stationsLayer);
  });
})();
