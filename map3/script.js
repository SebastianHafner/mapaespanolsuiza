


// making AJAX request for data
var map3DataRequest = $.ajax({
  url: "map3.geojson",
  dataType: "json",
  success: console.log("Uni data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(map3DataRequest).done(function() {


  // time series slider to select the year to visualize on the map
  var startYear = 1988, endYear = 2018;
  var currYear = startYear;


  // setting up new map2
  var map3 = setupMap('map3');

  // Add requested external GeoJSON to map
  var uniMarkers = L.geoJson(map3DataRequest.responseJSON, {
    pointToLayer: function(feature, latlng) {
			var marker =  L.circleMarker(latlng, getMarkerStyle(10));
      var popup = chart(feature);
      console.log(popup);
      marker.bindPopup(popup);
      return marker;
    }
    });


  uniMarkers.addTo(map3);



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
    uniMarkers.eachLayer(function (e) {
      var nStudents = e.feature.properties[year];
      e.setStyle({radius: nStudents/2});
    });
  }

  function chart(feature) {
    var data = [],
      year;
    for (year = startYear; year <= endYear; year++) {
      var value = feature.properties[year];
      data.push(feature.properties[year]);
    }

    var width = 300;
    var height = 80;
    var margin = {left:20,right:20,top:40,bottom:40};
    var parse = d3.timeParse("%m");
    var format = d3.timeFormat("%b");

    var div = d3.create("div")
    var svg = div.append("svg")
      .attr("width", width+margin.left+margin.right)
      .attr("height", height+margin.top+margin.bottom);
    var g = svg.append("g")
      .attr("transform","translate("+[margin.left,margin.top]+")");

    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return d; }) ])
      .range([height,0]);

    var yAxis = d3.axisLeft()
      .ticks(4)
      .scale(y);
    g.append("g").call(yAxis);

    //d3.range(startYear,endYear,5)
    var x = d3.scaleBand()
      .domain(d3.range(endYear-startYear))
      .range([0,width-20]);

    var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(function(d) { return startYear+d; });

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("text-anchor","end")
        .attr("transform","rotate(-90)translate(-12,-15)")


    var rects = g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("y",height)
      .attr("height",0)
      .attr("width", x.bandwidth()-2 )
      .attr("x", function(d,i) { return x(i); })
      .attr("fill",'#006CFA')
      .transition()
      .attr("height", function(d) { return height-y(d); })
      .attr("y", function(d) { return y(d); });



    var title = svg.append("text")
      .style("font-size", "20px")
      .text(feature.properties.name)
      .attr("x", width/2 + margin.left)
      .attr("y", 30)
      .attr("text-anchor","middle");



    return div.node();

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
