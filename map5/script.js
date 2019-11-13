


// making AJAX request for data
var map5DataRequest = $.ajax({
  url: "map5.geojson",
  dataType: "json",
  success: console.log("Map 5 data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(map5DataRequest).done(function() {

    // setting up new map2
    var map5 = setupMap('map5');

    // loading requested external GeoJSON
    //console.log(map2DataRequest.responseJSON);
    var schools = L.geoJson(map5DataRequest.responseJSON, {
        pointToLayer: function(feature, latlng) {

            var marker,
                markerSize = 6,
                hyperlink,
                popup;

            marker =  L.circleMarker(latlng, getMarkerStyle(markerSize));


            hyperlink = '<a href=' +  feature.properties.website + ' target="_blank">webpage</a>';

            popup = ''.concat(
                '<b>', feature.properties.name, '</b>',
                '<br>', feature.properties.address,
                '<br>', hyperlink
            );
            marker.bindPopup(popup);

            return marker;
        }
    });

    // creating cluster layer and adding markers to it
    var schoolClusters = L.markerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: iconClusterGenerator,
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false
    });
    schools.eachLayer(function(layer) {
        schoolClusters.addLayer(layer);
    });

    // define onClick even for clusters
    // other options: clustermouseover, clustermouseout
    schoolClusters.on('clusterclick', clusterOnClick(map5));

    // adding to map
    schoolClusters.addTo(map5);




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

    // icon function for clusters
    function iconClusterGenerator(cluster) {
    	var count = cluster.getChildCount();
    	var markers = cluster.getAllChildMarkers();



    	return L.divIcon({
    		html: "<div><span>" + count + "</span></div>",
    		className: 'cluster',
    		iconSize: L.point(20, 20)
    	});
    };

    function clusterOnClick(map) {
        return function(cluster) {

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

        popup = L.popup()
            .setLatLng(cluster.layer.getLatLng())
            .setContent(popupContent)
            .openOn(map);
    };
    };

});
