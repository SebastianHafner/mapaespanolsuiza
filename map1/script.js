


// making AJAX request for data
var map1DataRequest = $.ajax({
  url: "map1.json",
  dataType: "json",
  success: console.log("Map1 data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(map1DataRequest).done(function() {

    var data = map1DataRequest.responseJSON.data;
    var country = 'Spanien';
    console.log(data);

    function restructureData(data) {

        var dataRestructured = {},
            countryData,
            startYear = 1991,
            endYear = 2018,
            i,
            j;

        // loop over all countries
        for (i = 0; i < data.length; i++) {

            countryData = [];
            for (j = startYear; j <= endYear; j++) {
                countryData.push({
                    year: j,
                    value: data[i][j]
                });
            };
            dataRestructured[data[i].name] = countryData;
        };
        return dataRestructured;
    };


    data = restructureData(data);
    console.log(data);

    plotCountry(data, country)


    // change country selection
    document
      .querySelector('#basemaps')
      .addEventListener('change', function (e) {
        country = e.target.value;
        plotCountry(data, country);
      });

  function plotCountry(data, country) {

        var cdata = data[country],
            startYear = cdata[0].year,
            endYear = cdata[cdata.length-1].year;

        console.log(cdata);


        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        //Read the data
        d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

          // When reading the csv, I must format variables:
          function(d){
            return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
          },

          // Now I can use this dataset:
          function(data) {

            // Add X axis --> it is a date format
            var x = d3.scaleTime()
              .domain(d3.extent(data, function(d) { return d.date; }))
              .range([ 0, width ]);
            svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));

            // Add Y axis
            var y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d) { return +d.value; })])
              .range([ height, 0 ]);
            svg.append("g")
              .call(d3.axisLeft(y));

            // Add the line
            svg.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-width", 1.5)
              .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.value) })
                )
            console.log(data);
        })

        d3.data(cdata

    };
/*
        var width = 800;
        var height = 500;
        var margin = {left:20,right:20,top:40,bottom:40};

        var div = d3.select("#chart")
        var svg = div.append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom);
        var g = svg.append("g")
        .attr("transform","translate("+[margin.left,margin.top]+")");

        var y = d3.scaleLinear()
        .domain([0, d3.max(cdata.y, function(d) { return d; }) ])
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


                  // Add the line
        svg.append("path")
          .datum(cdata)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(function(d) { return x(d.x) })
            .y(function(d) { return y(d.y) })
            )



        var title = svg.append("text")
        .style("font-size", "20px")
        .text(cdata.label)
        .attr("x", width/2 + margin.left)
        .attr("y", 30)
        .attr("text-anchor","middle");


    };
*/
/*
var xy_chart = d3_xy_chart()
    .width(960)
    .height(500)
    .xlabel("X Axis")
    .ylabel("Y Axis") ;
var svg = d3.select("body").append("svg")
    .datum(data)
    .call(xy_chart) ;

function d3_xy_chart() {
    var width = 640,
        height = 480,
        xlabel = "X Axis Label",
        ylabel = "Y Axis Label" ;

    function chart(selection) {
        selection.each(function(datasets) {
            //
            // Create the plot.
            //
            var margin = {top: 20, right: 80, bottom: 30, left: 50},
                innerwidth = width - margin.left - margin.right,
                innerheight = height - margin.top - margin.bottom ;

            var x_scale = d3.scale.linear()
                .range([0, innerwidth])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }),
                          d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;

            var y_scale = d3.scale.linear()
                .range([innerheight, 0])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
                          d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

            var color_scale = d3.scale.category10()
                .domain(d3.range(datasets.length)) ;

            var x_axis = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom") ;

            var y_axis = d3.svg.axis()
                .scale(y_scale)
                .orient("left") ;

            var x_grid = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom")
                .tickSize(-innerheight)
                .tickFormat("") ;

            var y_grid = d3.svg.axis()
                .scale(y_scale)
                .orient("left")
                .tickSize(-innerwidth)
                .tickFormat("") ;

            var draw_line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); }) ;

            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;

            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_grid) ;

            svg.append("g")
                .attr("class", "y grid")
                .call(y_grid) ;

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_axis)
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .text(xlabel) ;

            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text(ylabel) ;

            var data_lines = svg.selectAll(".d3_xy_chart_line")
                .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
                .enter().append("g")
                .attr("class", "d3_xy_chart_line") ;

            data_lines.append("path")
                .attr("class", "line")
                .attr("d", function(d) {return draw_line(d); })
                .attr("stroke", function(_, i) {return color_scale(i);}) ;

            data_lines.append("text")
                .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; })
                .attr("transform", function(d) {
                    return ( "translate(" + x_scale(d.final[0]) + "," +
                             y_scale(d.final[1]) + ")" ) ; })
                .attr("x", 3)
                .attr("dy", ".35em")
                .attr("fill", function(_, i) { return color_scale(i); })
                .text(function(d) { return d.name; }) ;

        }) ;
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.xlabel = function(value) {
        if(!arguments.length) return xlabel ;
        xlabel = value ;
        return chart ;
    } ;

    chart.ylabel = function(value) {
        if(!arguments.length) return ylabel ;
        ylabel = value ;
        return chart ;
    } ;

    return chart;
}






      // Set the dimensions of the canvas / graph
    var margin = {top: 30, right: 20, bottom: 70, left: 50},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%b %Y").parse;

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    // Define the line
    var priceline = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.price); });

    // Adds the svg canvas
    var svg = d3.select("body")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("stocks.csv", function(error, data) {
        data.forEach(function(d) {
    		d.date = parseDate(d.date);
    		d.price = +d.price;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.price; })]);

        // Nest the entries by symbol
        var dataNest = d3.nest()
            .key(function(d) {return d.symbol;})
            .entries(data);

        var color = d3.scale.category10();   // set the colour scale

        legendSpace = width/dataNest.length; // spacing for the legend

        // Loop through each symbol / key
        dataNest.forEach(function(d,i) {

            svg.append("path")
                .attr("class", "line")
                .style("stroke", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign ID
                .attr("d", priceline(d.values));

            // Add the Legend
            svg.append("text")
                .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
                .attr("y", height + (margin.bottom/2)+ 5)
                .attr("class", "legend")    // style the legend
                .style("fill", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .on("click", function(){
                    // Determine if current line is visible
                    var active   = d.active ? false : true,
                    newOpacity = active ? 0 : 1;
                    // Hide or show the elements based on the ID
                    d3.select("#tag"+d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", newOpacity);
                    // Update whether or not the elements are active
                    d.active = active;
                    })
                .text(d.key);

        });

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    });

*/



});
