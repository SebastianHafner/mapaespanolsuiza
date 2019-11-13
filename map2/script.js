


// making AJAX request for data
var map2DataRequest = $.ajax({
  url: "map2.geojson",
  dataType: "json",
  success: console.log("Map2 data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(map2DataRequest).done(function() {

  // time series slider to select the year to visualize on the map
  var startYear = 2010,
    endYear = 2018,
    currYear = endYear
    country = 'Total';


  // setting up new map2
  var map2 = setupMap('map2');

  // loading requested external GeoJSON
  //console.log(map2DataRequest.responseJSON);
  var municipalities = L.geoJson(map2DataRequest.responseJSON);
  console.log(municipalities);

  // coloring layers
  setMapData(country, currYear);

  // adding to map
  municipalities.addTo(map2);

  // adding legend to map
  var legendMap2 = setupLegend();
  legendMap2.addTo(map2);




  var $sliderMap2 = $("#timeSliderMap2");

  $sliderMap2.ionRangeSlider({
    skin: "round",
    min: startYear,
    max: endYear,
    from: currYear,
    grid: true,
    grid_num: 8,
    prettify: function(year) { return year; }
  });


  $sliderMap2.on("change", function () {
    var $inp = $(this);
    currYear = $inp.prop("value"); // reading input value
    setMapData(country, currYear);
  });


  // change country selection
  document
    .querySelector('#basemaps')
    .addEventListener('change', function (e) {
      country = e.target.value;
      setMapData(country, currYear);
    });

  function setMapData (country, year) {

    console.log('changing to ' + country + ' for ' + year)

    // first we set the layer colors
    municipalities.eachLayer(function(layer) {
      var key = country + '_' + year;
      // console.log(key);
      var count = layer.feature.properties[key];
      var n_inhabitants = layer.feature.properties.n_inhabitants;

      var percentage = -1;
      if ((n_inhabitants != null)  && (count != null)) {
        percentage = count/n_inhabitants*100;
      };

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


  function setupLegend() {
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [1, 0.1, 0.01, 0.001],
          labels = [],
          add;
      console.log(div);
      div.innerHTML += '<span style="font-weight:bold; display:block; height:0;">Poblacion Nacionalidad (%)</span><br>'

      // loop through our density intervals and generate a color box and a label for each entry
      grades.push(grades[grades.length-1]);
      for (var i = 0; i < grades.length; i++) {

        add = (i < grades.length-1) ? grades[grades.length-1] : -grades[0];

        // create color box
        div.innerHTML += '<i style="background:' + getColor(grades[i] + add) + '"></i> ';

        // create label, but treat first and last entry separately
        if (i == 0) {
          div.innerHTML += '> ' + grades[i] + '<br>' ;
        } else if (i == grades.length-1) {
          div.innerHTML += '< ' + grades[i] + '<br>' ;
        } else {
          div.innerHTML += grades[i-1] + ' &ndash; ' + grades[i] + '<br>';
        };
      }

      // finally add no data entry
      div.innerHTML += '<i style="background:' + getColor(-1) + '"></i>';
      div.innerHTML += '<span>No data</span>' ;

      return div;
    };
    return legend;
  };

  // to do selection for leaflet map
  function setupSElect(map, options) {

    var div = L.DomUtil.create('div', 'basemaps-wrapper');
    return div;

  };



  // function to get color according to count and min max
  // colors are from colorbrewer http://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=6
  function getColor(p) {
    // red for no data
    if (p == -1) {
      return '#969696';
    } else {
      return p > 1 ? '#045a8d' :
             p > 0.1  ? '#2b8cbe' :
             p > 0.01  ? '#74a9cf' :
             p > 0.001  ? '#bdc9e1' :
                            '#f1eef6';
    };
  };

});
