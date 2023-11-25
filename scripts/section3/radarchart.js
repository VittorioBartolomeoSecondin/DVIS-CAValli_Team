var data = [
    { axis: "Label 1", value: 0.8 },
    { axis: "Label 2", value: 0.6 },
    { axis: "Label 3", value: 0.9 },
    { axis: "Label 4", value: 0.7 },
    { axis: "Label 5", value: 0.5 }
];

// Set the dimensions and margins of the graph
var margin = { top: 60, right: 40, bottom: 70, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#radarchart_1").append("svg")
    .attr("id", "radarchart_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define the number of data points
var numPoints = data.length;

// Define the radius of the radar chart
var radius = Math.min(width, height) / 2;

// Define the angles for each data point
var angle = d3.scaleLinear()
    .domain([0, numPoints])
    .range([0, 2 * Math.PI]);

// Create a radial scale for the values
var scale = d3.scaleLinear()
    .domain([0, 1])  // Assuming values are between 0 and 1
    .range([0, radius]);

// Draw the axes
for (var i = 0; i < numPoints; i++) {
    var axis = angle(i);
    svg.append("line")
        .attr("x1", width / 2)
        .attr("y1", height / 2)
        .attr("x2", width / 2 + scale(1) * Math.cos(axis))
        .attr("y2", height / 2 + scale(1) * Math.sin(axis))
        .attr("stroke", "gray");
}

// Plot the data points and connect them with lines
var line = d3.lineRadial()
    .angle(function (d, i) { return angle(i); })
    .radius(function (d) { return scale(d.value); });

svg.append("path")
    .datum(data)
    .attr("d", line)
    .attr("stroke", "blue")
    .attr("fill", "blue");
