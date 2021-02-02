// the endpoint for the earthquakes with formtat=geojson and dates from 2021
let endpoint = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-18&endtime=2021-01-25"
let plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

let mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'

// Layers for my map
let dark = L.tileLayer(mapboxUrl, {
    id: 'mapbox/dark-v10', 
    tileSize: 512, 
    zoomOffset: -1,
    accessToken: API_KEY,
    title: "USGS Earthquakes" 
});
let satellite   = L.tileLayer(mapboxUrl, {
    id: 'mapbox/satellite-v9', 
    tileSize: 512, 
    zoomOffset: -1,
    accessToken: API_KEY,
    title: "USGS Earthquakes" 
});

// My map starting map and properties
let light =  L.tileLayer(mapboxUrl, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY,
    title: "USGS Earthquakes"
});

// My map starting point
let myMap = L.map('map',{
    center: [17.999936471282737, -10.783409692796146],
    zoom: 3,
    layers: [light, dark, satellite]
});

// Base layers to select what kind of map we want to see
let baseMaps = {
    "Satellite": satellite,
    "Dark": dark,
    "Light": light
};

// Add base layers to map
let myLayersControl  = L.control.layers(baseMaps,{},{
    collapsed: false
}).addTo(myMap);

// the array of colors and limits to use in the circles and in the label
let colors = ["#7FFF00","#ADFF2F","#FFFF00","#FFD700","#FFA500","#FF4500"]
let limits = ["0-1","1-2","2-3","3-4","4-5","5+"]

/**
 * Function that receives a feature from GeoJSON and according to magnitude decides
 * which color to return for the circles
 * @param {Object} feature from GeoJSON 
 * @param {Object} layer from Leaflet
 * @returns {String} containing the fillColor for the point
 */
function fillColor(feature,layer){
    // transform the property into a number
    let mag = +feature.properties.mag;
    // select the color depending on the magnitude
    if(mag > 0 && mag < 1){
        return colors[0]
    }else if(mag < 2){
        return colors[1]
    }else if(mag < 3){
        return colors[2]
    }else if(mag < 4){
        return colors[3]
    }else if(mag < 5){
        return colors[4]
    }else {
        return colors[5]
    }
}

/**
 * Function that receives feature from GeoJSON and if this feature has a property named place
 * we add the Popup to the point to display more information when each point is clicked
 * in this case we add Magnitude value and Place description
 * @param {Object} feature from GeoJSON
 * @param {Object} layer from Leaflet
 */
function onEachFeature(feature, layer) {
    // does this feature have a property named place?
    if (feature.properties && feature.properties.place) {
        layer.bindPopup(`Magnitude: ${feature.properties.mag} <br> Place: ${feature.properties.place}`);
    }
}

// Read the endpoint to get the data from the USGS
d3.json(endpoint).then(data => {
    console.log(data)
    
    let myCircleStyle = {
        color: "black",
        weight: 1,
        opacity: 0.5,
        fillColor: "#088",
        fillOpacity: 0.65,
        radius: 8
    };
    
    // Add points to my map and change properties depending on properties of the feature
    let geojson = L.geoJson(data,{
        pointToLayer: function(data, latlng){
            myCircleStyle.radius = data.properties.mag*5;
            myCircleStyle.fillColor = fillColor(data,latlng)
            return L.circleMarker(latlng, myCircleStyle)
        },
        onEachFeature: onEachFeature //this calls the function to bind Popups on each feature
    }).addTo(myMap)
    // Add geojson to my layers control
    myLayersControl.addOverlay(geojson,"Earthquakes")

    // Set up the legend
    let legend = L.control({ 
        position: "bottomright"
     });

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let labels = [];

        // Add min & max
        let legendInfo = "<p>Magnitudes</p>" +
        "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

        div.innerHTML = legendInfo;

        // add the scale of colors with the values considered inside
        limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\">"+limit+"</li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);

})
// catch errors and print them in the console
.catch(e =>{
    console.log(e)
})


// her we read the second dataset for the tectonic plates
d3.json(plates).then(geojsonFeature=>{

    // console.log(geojsonFeature)

    let myStyle = {
        "color": "#ff7800",
        "weight": 1,
        "opacity": 1,
        "fillOpacity": 0
    };

    // Read the features of the geoJSON and put them in the map
    let tectonics = L.geoJSON(geojsonFeature,{
        style: myStyle
    }).addTo(myMap)

    // Add them to the layers control
    myLayersControl.addOverlay(tectonics,"Tectonic Plates")
})
.catch(e=>{
    console.log(e)
})