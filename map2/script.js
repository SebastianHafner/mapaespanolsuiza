


// making AJAX request for data
var map2DataRequest = $.ajax({
  url: "map2.geojson",
  dataType: "json",
  success: console.log("Map2 data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(map2DataRequest).done(function() {

  // setting up new map2
  var map2 = setupMap('map2');

  // loading requested external GeoJSON
  //console.log(map2DataRequest.responseJSON);
  var municipalities = L.geoJson(map2DataRequest.responseJSON);

  // coloring layers
  setMapData('Total');

  // adding to map
  municipalities.addTo(map2);


  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [10, 1, 0.1, 0.01, 0.001, 0.0001, 0.00001],
        labels = [],
        add = Number.MIN_VALUE;

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + add) + '"></i> ' +
        grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map2);


  // change country selection
  document
    .querySelector('#basemaps')
    .addEventListener('change', function (e) {
      var country = e.target.value;
      setMapData(country);
    });

  function setMapData (country) {

    console.log('changing to ' + country)

    // first we set the layer colors
    municipalities.eachLayer(function(layer) {
      var count = layer.feature.properties[country];
      var n_inhabitants = layer.feature.properties.n_inhabitants;

      var percentage = 0;
      if (n_inhabitants != null) { percentage = count/n_inhabitants; };

      layer.setStyle({
        fillColor: getColor(percentage),
    		weight: 0.5,
    		opacity: 1,
    		color: 'black',
    		fillOpacity: 0.9
      });

      // then we set the popups
      var from = 'From ' + country;
      if (country == 'Total') { from = 'Total Spanish speaking'; };
      layer.bindPopup(''.concat(
        '<b>', layer.feature.properties.name, '</b>',
      	'<br>', from, ': ', count,
      	'<br>', 'Inhabitants municipality: ', n_inhabitants
      ));

    });
  };

  // function to get color according to count and min max
  // colors are from colorbrewer http://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=6
  function getColor(p) {
    // console.log(p);
    return p > 10 ? '#034e7b' :
  	       p > 1  ? '#0570b0' :
  	       p > 0.1  ? '#3690c0' :
  	       p > 0.01  ? '#74a9cf' :
           p > 0.001  ? '#a6bddb' :
           p > 0.0001  ? '#d0d1e6' :
  	                  '#f1eef6';
  }


  // sets up a map of switzerland
  function setupMap(div) {

    // setting up base layer of map
    var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      name: 'tileLayer',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });

    // setting default map view
    var defaultMapCenter = [46.80, 8.35];
    var defaultMapZoom = 8;
    var prevMapZoom = defaultMapZoom;

    // initializing map
    var map = L.map(div, {
      layers: tileLayer,
      center: defaultMapCenter,
      zoom: defaultMapZoom,
      zoomControl: false,
      touchZoom: true,
      // setting zoom restrictions
      maxZoom: 18,
      minZoom: defaultMapZoom
    });

    // setting panning restrictions
    var bounds = map.getBounds();
    map.setMaxBounds(bounds);
    map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
    });

    // adding tyle layer to our map
    tileLayer.addTo(map);

    // adding legend to map
    L.control.scale({imperial: false}).addTo(map);

    return map;
  };


});
