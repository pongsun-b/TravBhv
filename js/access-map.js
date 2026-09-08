(function () {
  var el = document.getElementById("access-map");
  if (!el || typeof L === "undefined") return;

  var base = el.getAttribute("data-base") || "/access-data/";
  if (base.slice(-1) !== "/") base += "/";

  var map = L.map(el, { zoomControl: true, scrollWheelZoom: true }).setView(
    [13.75, 100.55],
    11
  );

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; OSM walk graph &copy; OpenStreetMap contributors",
      maxZoom: 19
    }
  ).addTo(map);

  var view = "combined";
  var speed = "40";
  var useAll = false;
  var classLayers = {};
  var classesLayer, khetLayer, railLayer, stationsLayer, feedersLayer, isoLayer, studyLayer;

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
    if (classesLayer) map.removeLayer(classesLayer);
    classesLayer = L.geoJSON(data, { style: classStyle, interactive: false }).addTo(map);
  }

  function switchLayer() {
    var name = fileFor();
    if (classLayers[name]) {
      showClasses(classLayers[name]);
      return;
    }
    loadJSON(name)
      .then(function (data) {
        classLayers[name] = data;
        showClasses(data);
      })
      .catch(function () {
        if (classLayers["classes.geojson"]) showClasses(classLayers["classes.geojson"]);
      });
  }

  function loadJSON(name) {
    return fetch(base + name).then(function (r) {
      if (!r.ok) throw new Error(name);
      return r.json();
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
      var meta = pack[5];
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

      stationsLayer = L.geoJSON(stations, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 3.5,
            color: "#111",
            fillColor: "#111",
            fillOpacity: 1,
            weight: 1
          });
        },
        onEachFeature: function (feature, layer) {
          var p = feature.properties || {};
          var name = p.station || p.name || "Station";
          var bits = ["<strong>" + name + "</strong>"];
          if (p.line) bits.push(p.line);
          if (p.exits) bits.push(p.exits + " mapped exits");
          layer.bindPopup(bits.join("<br>"));
          layer.on("click", function () {
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
          });
        }
      }).addTo(map);

      if (feeders) {
        feedersLayer = L.geoJSON(feeders, {
          pointToLayer: function (feature, latlng) {
            var kind = feature.properties && feature.properties.kind;
            var boat = kind === "boat";
            return L.circleMarker(latlng, {
              radius: 4,
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

      function updateMeta() {
        var box = document.getElementById("access-meta");
        if (!box) return;
        var sp = speed === "36" ? "3.6" : speed === "45" ? "4.5" : "4.0";
        var extra = useAll ? " · rail + boats" : " · urban rail";
        var n = meta && meta.n_stations != null ? meta.n_stations + " stations" : "";
        box.textContent = sp + " km/h" + extra + (n ? " · " + n : "");
      }
      updateMeta();
    })
    .catch(function (err) {
      el.innerHTML =
        '<p class="access-missing">Map data is not in this build yet. Run <code>scripts/access/build.py</code>.</p>';
      console.error(err);
    });

  document.querySelectorAll('input[name="access-view"]').forEach(function (input) {
    input.addEventListener("change", function () {
      view = input.value;
      if (classesLayer) classesLayer.setStyle(classStyle);
    });
  });
  document.querySelectorAll('input[name="access-speed"]').forEach(function (input) {
    input.addEventListener("change", function () {
      speed = input.value;
      switchLayer();
      var box = document.getElementById("access-meta");
      if (box) {
        var sp = speed === "36" ? "3.6" : speed === "45" ? "4.5" : "4.0";
        var extra = useAll ? " · rail + boats" : " · urban rail";
        box.textContent = sp + " km/h" + extra;
      }
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
      var box = document.getElementById("access-meta");
      if (box) {
        var sp = speed === "36" ? "3.6" : speed === "45" ? "4.5" : "4.0";
        box.textContent = sp + " km/h · " + (useAll ? "rail + boats" : "urban rail");
      }
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
