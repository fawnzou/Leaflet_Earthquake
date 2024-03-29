
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Load two urls json files

d3.json(earthquakeURL, function(data) {
    // Creating a geoJSON layer 
    var features = data.features;
    var earthquakes = L.geoJSON(features, {

        // 1. Cricles radium and color determined by "mag"
        pointToLayer: (feature, latlng) => {
          return new L.circle(latlng, {
            radius: radiusoptions(feature.properties.mag),
            fillColor: coloroptions(feature.properties.mag),
            fillOpacity: .9,
            stroke: false,
            weight: 0.5
             })    
        },   

        //  2. sites bindPopup setting
        onEachFeature: function(feature,layer) {
          layer.bindPopup(`<h3>Magnitude:${feature.properties.mag}</h3>\
            <h3>Location:${feature.properties.place}</h3>\
            <hr><p>${new Date(feature.properties.time)}</p>`);
        }    

    // earthquakes geoJson is over
    });
    createMap(earthquakes);   

});


function createMap(earthquakes) {
    // Set up base layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        accessToken:API_KEY
      });
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        accessToken:API_KEY
      });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        accessToken: API_KEY
       });

    var baseMaps = {
    	"Outdoors": outdoors,
    	"Satellite": satellite,
    	"Dark Map": darkmap
    };

    var tectonicplates = new L.LayerGroup();

    var overlayMaps ={
    	"Earthquakes": earthquakes,
    	"tectonic Plates": tectonicplates
    };

  	var myMap = L.map("map", {
  		center: [37.09, -95.71],
  		zoom: 2.5,
  		layers: [outdoors, earthquakes, tectonicplates]
  	}); 

  	d3.json(tectonicPlatesURL, function(plateData) {
  		L.geoJSON(plateData,{
  			color:"orange",
  			weight:2
  		}).addTo(tectonicplates);
  	});

  	L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(myMap) {
      var div = L.DomUtil.create('div', 'info legend')
      var limits = [0, 1, 2, 3, 4, 5]
      var labels = []

    div.innerHTML = `<div class="labels"><div class="min">${limits[0]}</div>\
      <div class="max">${limits[limits.length - 1]}+</div></div>`

    limits.forEach(function(limit, index) {
      labels.push(`<li style="background-color: ${coloroptions(index+1)}"></li>`)
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }

  legend.addTo(myMap);
}
  
// circle color fuction
function coloroptions(d){
       return d > 5 ? "#ff0000":
              d > 4 ? "#ff6600":
              d > 3 ? "#ffa500":
              d > 2 ? "#ffb37e":
              d > 1 ? "#ffff66":
                      "#90ee90";
   }  

// circle radius size fuction   
function radiusoptions(value){
	return value*25000
   }