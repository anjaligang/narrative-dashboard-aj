d3.csv("Timestamp_Search.csv").then(function (data) {

    data = data.slice(1);

    // Define the time parser
    var parseTime = d3.timeParse("%Y-%m-%dT%H");

    // Convert data to appropriate format
    data.forEach(function (d) {
        d.time = parseTime(d.time); // Parse the time string into a Date object
        d.Barbie = +d.Barbie;
        d.Oppenheimer = +d.Oppenheimer;
    });

    console.log(data);

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 960)
        .attr("height", 500);

    var margin = { top: 20, right: 80, bottom: 30, left: 50 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleTime() // Use d3.scaleTime() for the x-axis
        .domain(d3.extent(data, function (d) { return d.time; }))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return Math.max(d.Barbie, d.Oppenheimer); })])
        .range([height, 0]);

    // var color = d3.scaleOrdinal(d3.schemeCategory10);

const customColors = ['#f472b6', '#4ade80'];

// Create the color scale using the custom array
const color = d3.scaleOrdinal().range(customColors);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);

    var line = d3.line()
        .x(function (d) { return x(d.time); })
        .y(function (d) { return y(d.search); });

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var keys = Object.keys(data[0]).filter(function (key) { return key !== "time"; });
    color.domain(keys);

    var movies = keys.map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return { time: d.time, search: +d[name] };
            })
        };
    });

    console.log(movies)

    x.domain(d3.extent(data, function (d) { return d.time; }));

    y.domain([
        d3.min(movies, function (c) { return d3.min(c.values, function (v) { return v.search; }); }),
        d3.max(movies, function (c) { return d3.max(c.values, function (v) { return v.search; }); })
    ]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .text("Search");

    var movie = g.selectAll(".movie")
        .data(movies)
        .enter().append("g")
        .attr("class", "movie");

    movie.append("path")
        .attr("class", "line")
        .attr("d", function (d) { return line(d.values); })
        .style("stroke", function (d) { return color(d.name); });

    

    movie.append("text")
        .datum(function (d) { return { name: d.name, value: d.values[d.values.length - 1] }; })
        .attr("transform", function (d) { return "translate(" + x(d.value.time) + "," + y(d.value.search) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function (d) { return d.name; });

        // Create a tooltip div element
    var tooltip = d3.select("#chartTooltip")
    // .append("div")
    // .attr("class", "tooltip")
    // .style("opacity", 0);


// Append a transparent overlay for handling the mouse events
g.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function () {
        verticalLine.style("display", null); // Show the vertical line
        tooltip.style("opacity", 1); // Show the tooltip
    })
    .on("mouseout", function () {
        verticalLine.style("display", "none"); // Hide the vertical line
        tooltip.style("opacity", 0); // Hide the tooltip
    })
    .on("mousemove", mousemove);

// Add the vertical line that will be hidden by default
var verticalLine = g.append("line")
    .attr("class", "vertical-line")
    .style("display", "none")
    .attr("y1", 0)
    .attr("y2", height);

function mousemove(event) {
    var tooltip = d3.select("#chartTooltip");

    var x0 = x.invert(d3.pointer(event)[0]);
    var bisectDate = d3.bisector(function (d) { return d.time; }).left;
    var index = bisectDate(data, x0, 1);
    var d0 = data[index - 1];
    var d1 = data[index];
    var d = x0 - d0.time > d1.time - x0 ? d1 : d0;

    var tooltipWidth = parseInt(tooltip.style("width"));
    var tooltipHeight = parseInt(tooltip.style("height"));

    var tooltipX = event.pageX + 10; // Add 10 pixels to the right of the cursor
    var tooltipY = event.pageY - tooltipHeight - 10; // Display above the cursor

    // Adjust the tooltip position to avoid overflowing the chart
    if (tooltipX + tooltipWidth > width) {
        tooltipX = event.pageX - tooltipWidth - 10; // Display to the left of the cursor
    }

    tooltip.html("Time: " + d.time.toLocaleString() + "<br>" + 
                 "Barbie: " + d.Barbie + "<br>" +
                 "Oppenheimer: " + d.Oppenheimer)
        .style("left", tooltipX + "px")
        .style("top", tooltipY + "px");

    // Update the position of the vertical line
    verticalLine
        .attr("x1", x(d.time))
        .attr("x2", x(d.time))
        .style("display", "block"); // Show the vertical line
}

}).catch(function (error) {
    // Handle any errors that occurred during data loading
    console.error("Error loading data:", error);
});
