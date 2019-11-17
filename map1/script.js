


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
        oldSelected = ['Spanien'],
        newSelected = oldSelected;


    data = restructureData(data);
    console.log(data);


    $("#multiSelect").select2();

    $('#multiSelect').on('change', function (e) {
        var options = e.currentTarget.selectedOptions,
            i;

        // update new selected countries
        newSelected = [];
        for (i = 0; i < options.length; i++) {
            newSelected.push(options[i].label);
        };
        console.log(oldSelected, newSelected);
        updateChart()

        oldSelected = newSelected;
    });

    // change country selection
    document
      .querySelector('#basemaps')
      .addEventListener('change', function (e) {
        country = e.target.value;
        updateChart();
      });

      // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
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



    // set the ranges
    var xScale = d3.scaleTime()
        .domain(d3.extent(data[oldSelected[0]], function(d) { return d.date; }))
        .range([0, width]);


    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data[oldSelected[0]], function(d) { return d.value; })])
        .range([height, 0]);


    // Define the axes
    var xAxis = d3.axisBottom().scale(xScale).ticks(5);
    var yAxis = d3.axisLeft().scale(yScale).ticks(5);


    // define the line
    var valueline = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.value); });


    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data[oldSelected[0]]));

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);


    function updateChart() {

        console.log('selected countries', newSelected);
        console.log('changing to ' + newSelected[0]);

        var cdata = data[newSelected[0]],
            selectedData = [],
            i,
            yMax = 0;


        for (i = 0; i < newSelected.length; i++) {
            selectedData.push(data[newSelected[i]]);
        };

        console.log(selectedData);


        // Select the section we want to apply our changes to
        var svg = d3.select("#chart").transition();

        // defining transition
        var t = d3.transition()
            .duration(750)


        // changing y axis
        for (i = 0; i < selectedData.length; i++) {
            var countryMax = d3.max(selectedData[i], function(d) { return d.value; });
            yMax = countryMax > yMax ? countryMax : yMax;
        };
        console.log('maxvalue', yMax);

        yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);

        svg.select(".y") // change the y axis
            .transition(t)
            .call(yAxis.scale(yScale));


        // updating still present classes


        // Make the changes
        svg.select(".line")   // change the line
            .transition(t)
            .attr("d", valueline(cdata));


        svg = d3.select("#chart");
        for (i = 0; i < selectedData.length; i++) {
            // Add the valueline path.
            console.log(i);
            svg.append("path")
                .attr("class", "line" + i)
                .attr("d", valueline(selectedData[i]));
        };



    };

    //    draw(data, country);


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
            dataRestructured[data[i].name] = countryData;
        };
        return dataRestructured;
    };

});
