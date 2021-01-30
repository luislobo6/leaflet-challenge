// the endpoint for the earthquakes with formtat=geojson and dates from 2021
let endpoint = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-18&endtime=2021-01-25"

// My map starting point
let myMap = L.map('map').setView([35.93373001708858, -112.41594924041489], 6);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
}).addTo(myMap);


function fillColor(feature,layer){
    let mag = feature.properties.mag;

}


function onEachFeature(feature, layer) {
    // does this feature have a property named place?
    if (feature.properties && feature.properties.place) {
        layer.bindPopup(`Magnitude: ${feature.properties.mag} <br> Place: ${feature.properties.place}`);
    }
}


d3.json(endpoint).then(data => {
    console.log(data)
    // Add markers layer
    // let markers = L.markerClusterGroup()

    // data.features.forEach(d=>{
   
    //     if(d.geometry){
    //     //   markers.addLayer(
    //         L.circle([d.geometry.coordinates[1],d.geometry.coordinates[0]],{
    //             color: "black",
    //             weight: 1,
    //             fillColor: "#088",
    //             fillOpacity: 0.5,
    //             radius: 5000
    //         })
    //         .bindPopup(`Mag: ${d.properties.mag} <br> Place: ${d.properties.place}`)
    //         .addTo(myMap)
    //     //   )
    //     }
    //   })
    
    let myCircleStyle = {
        color: "black",
        weight: 1,
        opacity: 0.5,
        fillColor: "#088",
        fillOpacity: 0.5,
        radius: 8
    };
    
    // Add points to my map
    L.geoJson(data,{
        pointToLayer: function(data, latlng){
            myCircleStyle.radius = data.properties.mag*10;
            return L.circleMarker(latlng, myCircleStyle)
        },
        onEachFeature: onEachFeature
    }).addTo(myMap)
    // Add markers to my map
    // markers.addTo(myMap)

})
.catch(e =>{
    console.log(e)
})