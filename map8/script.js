// placeholder variable
var placeholder;

// setting up map
var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  name: 'tileLayer',
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});


// setting default map view
var defaultMapCenter = [46.80, 8.40];
var defaultMapZoom = 8;
var prevMapZoom = defaultMapZoom;


var map = L.map('map1', {
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
bounds = map.getBounds();
map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});


// adding tyle layer to our map
tileLayer.addTo(map);


// adding an overview minimap when zoomed in (more than default zoom)
var minimap;
map.on("zoomend", function (e) {

	console.log('NEW ZOOM EVENT');

	// closing popups when zooming
	map.closePopup();

	var currMapZoom = map.getZoom();
	// console.log("current map zoom", currMapZoom);
	// console.log('previous map zoom', prevMapZoom);

	// if zoomed in from default map zoom remove minimap
	if (currMapZoom == defaultMapZoom+1 && currMapZoom > prevMapZoom) {

		console.log('add minimap');

		var tileLayerMinimap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			name: 'tyleLayerMinimap',
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		});

		minimap = new L.control.StaticOverview([tileLayerMinimap],{zoom: defaultMapZoom, center: defaultMapCenter, bounds: bounds});
		minimap.setPosition('topleft');

		map.addControl(minimap);
	};

	if (currMapZoom == defaultMapZoom && currMapZoom < prevMapZoom) {
		console.log('remove minimap');
		map.removeControl(minimap);
	};

	prevMapZoom = currMapZoom;
});



// defining markers for language data
var locationBasicMarkerStyle = {
	radius: 3,
	fillColor: '#000000',
	color: '#000000',
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
}

// defining popup style for language data
var locationPopupOptions = {
	'maxWidth': '400',
	'width': '200',
	'className': 'popupCustom'
}



// icon function for clusters
iconClusterGenerator = function(cluster) {
	var count = cluster.getChildCount();
	var markers = cluster.getAllChildMarkers();



	return L.divIcon({
		html: "<div><span>" + count + "</span></div>",
		className: 'cluster',
		iconSize: L.point(20, 20)
	});
};




// initializing bildung layer
var bildungLayer = L.markerClusterGroup({
	maxClusterRadius: 50,
	iconCreateFunction: iconClusterGenerator,
	spiderfyOnMaxZoom: false,
	showCoverageOnHover: false,
	zoomToBoundsOnClick: false
});

// colors for different Bildung types
// generated with colorbrewer (http://colorbrewer2.org/#type=qualitative&scheme=Dark2&n=6)
var colorsBildungTypes = {
	'IEM': '#1b9e77',
	'ALCE': '#d95f02',
	'CUI': '#7570b3',
	'U': '#e7298a',
	'DELE': '#66a61e',
	'EEP': '#e6ab02'
}


var legendBildung = L.control({position: 'bottomright'});
legendBildung.onAdd = function (map) {

	var div = L.DomUtil.create('div','legend');
	console.log(div);
	labels = ['<strong>Bildung Types</strong>'],
	categories = Object.keys(colorsBildungTypes);

	for (var i = 0; i < categories.length; i++) {

		div.innerHTML += labels.push(
			'<div class="dot" style="background:' + colorsBildungTypes[categories[i]] + '"></div> ' + (categories[i] ? categories[i] : '+')
		);

	}
	div.innerHTML = labels.join('<br>');
	console.log(div);
	return div;
};
legendBildung.addTo(map);


// loading bildung geojson and adding markers to bildung layer
placeholder = new L.GeoJSON.AJAX('bildung.geojson',
	{
		pointToLayer: function(feature, latlng) {

      var marker,
          minMarkerSize = 4,
          scaleFactor = 4,
          markerSize = feature.properties.total / scaleFactor;

      markerSize = Math.max(minMarkerSize,markerSize);

      marker =  L.circleMarker(latlng, {
		    radius: markerSize,
				fillColor: colorsBildungTypes[feature.properties.type_abbr],
			  color: '#000000',
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			});


			// marker = L.marker(latlng, {icon: blueIcon});
      console.log(feature);
			var popup = ''.concat(
				'<b>', feature.properties.name, '</b>',
				'<br>', feature.properties.typ,
				'<br>', 'Spanish students: ', feature.properties.total
			);
			marker.bindPopup(popup, locationPopupOptions);

			bildungLayer.addLayer(marker);
			return marker;
		}
	}
);



// define onClick even for clusters
// other options: clustermouseover, clustermouseout
bildungLayer.on('clusterclick', function(cluster) {

  var markers,
      marker,
      name,
      names = [],
      popup,
      popupContent = '',
      i;

	// first close all opened popups
	map.closePopup();

  // looping over all markers and collection all names of institutions
  markers = cluster.layer.getAllChildMarkers();
  for (i = 0; i < markers.length; i++) {
    marker = markers[i];
    names.push(marker.feature.properties.name);
  };

  // alphabetically sorting names and concatenating together
  names.sort();
  for (i = 0; i < names.length; i++) {
    name = names[i];
    if (!(name === null)) {
      popupContent = popupContent + name + '<br>';
    };
  }
  console.log(names);



  popup = L.popup()
		.setLatLng(cluster.layer.getLatLng())
		.setContent(popupContent)
    .openOn(map);


});

// add bildung markers to map
map.addLayer(bildungLayer);





L.control.scale({imperial: false}).addTo(map);
