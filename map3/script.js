


// making AJAX request for data
var uniDataRequest = $.ajax({
  url: "unis.geojson",
  dataType: "json",
  success: console.log("Uni data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(uniDataRequest).done(function() {

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
  var map3 = L.map('map3', {
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
  bounds = map3.getBounds();
  map3.setMaxBounds(bounds);
  map3.on('drag', function() {
      map3.panInsideBounds(bounds, { animate: false });
  });

  // adding tyle layer to our map
  tileLayer.addTo(map3);

  // adding legend to map
  L.control.scale({imperial: false}).addTo(map3);



  // Add requested external GeoJSON to map
  var geojson = L.geoJson(uniDataRequest.responseJSON, {
    pointToLayer: function(feature, latlng) {
			var marker =  L.circleMarker(latlng, getMarkerStyle(10));
      return marker;
    }
  }).addTo(map3);


  // time series slider to select the year to visualize on the map
  var startYear = 1988, endYear = 2018;
  var currYear = startYear;
  updateMarkers(currYear);

  var $d = $("#timeSlider");

  $d.ionRangeSlider({
    skin: "round",
    min: startYear,
    max: endYear,
    from: currYear,
    grid: true,
    grid_num: 5,
    prettify: function(year) { return year; }
  });


  $d.on("change", function () {
    var $inp = $(this);
    var currYear = $inp.prop("value"); // reading input value
    updateMarkers(currYear);
  });



  // function to update the marker sizes according to number of students
  // of input year
  function updateMarkers(year) {
    // console.log('updating marker to year ' + year);
    geojson.eachLayer(function (e) {
      var nStudents = e.feature.properties[year];
      e.setStyle({radius: nStudents/2})
    });
  }


  // function to return style for circle marker
  function getMarkerStyle(size) {
    return {
        radius: size,
        fillColor: '#006CFA',
        color: '#000000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
  };

});
