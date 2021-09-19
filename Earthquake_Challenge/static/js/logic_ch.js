// Add GeoJSON data URL of USGS PAST 7 DAYS earthquake as well as tectonic Plate Boundary URL
jsonEarthquakeDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
jsonTectonicDataURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// create three tile layers based on Leatlet by mapbox styles API 
let street = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: API_KEY
});

let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    accessToken: API_KEY
});

let light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    accessToken: API_KEY
});

// define an object of base tile layers group
let baseMaps = {
    "Streets": street,
    "Satellite": satelliteStreets,
    "Light": light
};

//declare overlays layer group 
let overlayGroup = new L.layerGroup();

// define an object of overlays, always visible
let overlays = {
    "Tectonic Plates": overlayGroup,
    "Earthquakes": overlayGroup
};

// initialize a map object 
let mymap = L.map("mapid", {
    center: [39.5, -98.5],
    zoom: 3,
    layers: [street]  // default map style
});
// add overlayGroup on map instantiation
overlayGroup.addTo(mymap);

// layers control, allow users to change which base layers and overlays are visible
L.control.layers(baseMaps, overlays).addTo(mymap);


// ----------------------------Earthquake GeoJSON layer---------------------------------------------------

// Grabbing, parsing and add earthquake GeoJSON data(FeatureCollection) on overlays as a geoJSON layer
d3.json(jsonEarthquakeDataURL).then((data) => {
    L.geoJSON(data, {
        //set the style for each circleMarker, pass the magnitude into two separate functions to calculate the color and radius.
        style: function (feature) {
            return {
                opacity: 1,
                fillOpacity: 1,
                color: "#000000",  // black
                stroke: true,
                weight: 0.5,
                fillColor: getColor(feature.properties.mag), // use function instead a single color
                radius: getRadius(feature.properties.mag)
            }
        },
        //turn each feature into a circleMarker on the map using pointToLayer
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng)
                .bindPopup("<h2> Earthquake Magnitude: " + feature.properties.mag +
                    "</h2><hr><h3> Location: " + feature.properties.place + "</h3>")
        }
    }).addTo(overlayGroup);
});

// This function determines the fillcolor of circleMarkers based on magtitude
function getColor(magnitude) {
    if (magnitude > 5) {
        return "#ea2c2c";
    }
    if (magnitude > 4) {
        return "#ea822c";
    }
    if (magnitude > 3) {
        return "#ee9c00";
    }
    if (magnitude > 2) {
        return "#eecc00";
    }
    if (magnitude > 1) {
        return "#d4ee00";
    }
    return "#98ee00";
};

// This function determines the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
function getRadius(magnitude) {
    if (magnitude === 0) { return 1 }
    return magnitude * 4;
};

// -----------------------------------------------Legend Control----------------------------------------
// Here we create a legend control object.
let legend = L.control({
    position: "bottomright"
});

// Then add all the details for the legend
legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
    ];

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < magnitudes.length; i++) {
        console.log(colors[i]);
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
};

// Finally, we add our legend to the map.
legend.addTo(map);


// ---------------------------------------Tectonic Plate GeoJSON layer------------------------------------
// Grabbing, parsing and add tectonic Plates GeoJSON data(FeatureCollection) on map object as geoJSON layer
d3.json(jsonTectonicDataURL).then((data) => {
    L.geoJSON(data, {
        style: {
            opacity: 1,
            color: "#e85151",
            weight: 2.7
        },
        // a popup info for each tactonic boundary
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3> Tectonic Plate Boundary: " + feature.properties.Name +
                "</h3><hr><h4> PlateA: " + feature.properties.PlateA +
                " &#124; PlateB: " + feature.properties.PlateB + "</h4>")
        }
    }).addTo(overlayGroup);
});