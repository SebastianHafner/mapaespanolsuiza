


// making AJAX request for data
var map1DataRequest = $.ajax({
  url: "map1.json",
  dataType: "json",
  success: console.log("Map1 data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(map1DataRequest).done(function() {

    var data = map1DataRequest.responseJSON.data,
        i;


    data = restructureData(data);
    console.log(data);



    $("#multiSelect").select2({
        templateSelection: formatSelections,
        templateResult: function(country) { return country.text; },
    });



    function formatSelections(country) {

        var $country = $(
            '<span class=multiselectOptions style="color:' +
            color(country.text) + '">' + country.text + '</span>');
        return $country;
        /*
        var $country = $(
          '<span><img src="' + urlFlags[country.text] + ' class="img-flag" /> ' + country.text + '</span>'
        );
        */


    };



    $('#multiSelect').on('change', function (e) {
        var options = e.currentTarget.selectedOptions,
            i;

        // de-select all countries
        Object.keys(data).forEach(function(country) {
            data[country].active = false
        });

        // select countries according to multi select
        for (i = 0; i < options.length; i++) {
            data[options[i].label].active = true;
        };

        printSelectedCountries(data);
        updateCountrySelection(data)

    });






      // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 100, left: 100},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");





    // .domain(d3.extent(data[oldSelected[0]], function(d) { return d.date; }))

    // set the ranges
    var xScale = d3.scaleTime()
        .domain(d3.extent(data.Spanien.data, function(d) { return d.date; }))
        .range([0, width]);

    // d3.max(data[oldSelected[0]], function(d) { return d.value; })
    var yScale = d3.scaleLinear()
        .domain([0, 0])
        .range([height, 0]);


    // Define the axes
    var xAxis = d3.axisBottom().scale(xScale).ticks(10);
    var yAxis = d3.axisLeft().scale(yScale).ticks(5);


    // define the line
    var valueline = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.value); });

    var color = d3.scale.category10();

    Object.keys(data).forEach(function(country) {
        // Add the valueline path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data[country].data))
            .style("stroke", color(country))
            .style("opacity", 0)
            .attr("id", 'tag' + data[country].id);
    });


    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .style("font-size", "16px")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .style("font-size", "16px")
        .call(yAxis);


    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 30) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Year");

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("n Immigrants");



    function updateCountrySelection(data) {


        var i,
            opacity;
            yMax = 0;

        // Select the section we want to apply our changes to
        var svg = d3.select("#chart").transition();

        // defining transition
        var t = d3.transition()
            .duration(750)

        // updating range of y axis
        Object.keys(data).forEach(function(country) {
            if (data[country].active) {
                yMax = Math.max(yMax, d3.max(data[country].data, function (d) { return d.value;} ));
            };
        });
        console.log(yMax);

        yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);

        svg.select(".y")
            .transition(t)
            .call(yAxis.scale(yScale));


        // updating selection by adjusting opacities of lines
        Object.keys(data).forEach(function(country) {

            opacity = data[country].active ? 1 : 0;

            d3.select('#tag' + data[country].id)
                .transition().duration(100)
                .attr('d', valueline(data[country].data))
                .style("opacity", opacity);
        });


    };



    function restructureData(data) {

        var dataRestructured = {},
            parseTime = d3.timeParse("%Y"),
            countryData,
            startYear = 1991,
            endYear = 2018,
            i,
            year;

        // loop over all countries
        for (i = 0; i < data.length; i++) {

            countryData = [];
            for (year = startYear; year <= endYear; year++) {
                countryData.push({
                    date: parseTime(year),
                    value: data[i][year]
                });
            };

            dataRestructured[data[i].name] = {
                data: countryData,
                active: false,
                id: 'country' + i,
            };
        };
        return dataRestructured;
    };

    // just for debugging
    function printSelectedCountries(data) {
        var str = ''
        Object.keys(data).forEach(function(country) {
            if (data[country].active) {
                str += country + ' ';
            }
        });
        console.log(str);
    };

});
