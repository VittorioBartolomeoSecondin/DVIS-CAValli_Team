/*
// initial setup
const svg = d3.select("svg"),
	path = d3.geoPath(),
	usamap = "https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_500k.json";

// Load GeoJSON file
d3.json(usamap).then(function (us) {
      // Load CSV data
      d3.csv("data/section4/state_abundance_fips.csv").then(function (data) {
        // Create a dictionary to map state id to abundance
        var dataByFips = {};
        data.forEach(function (d) {
          dataByFips[d.fips] = +d.abundance;
        });

        // Create SVG container
        var svg = d3.select('body').append('svg')
          .attr('width', 960)
          .attr('height', 600);

        // Create color scale
        var color = d3.scaleQuantize()
          .domain([0, d3.max(data, function (d) { return +d.abundance; })])
          .range(d3.schemeBlues[9]);

        // Draw map
        svg.selectAll('path')
          .data(us.features)
          .enter().append('path')
          .attr('d', d3.geoPath())
          .attr('fill', function (d) {
            return color(dataByFips[d.properties.fips]);
          })
          .append('title')
          .text(function (d) {
            return d.properties.name + ': ' + dataByFips[d.properties.fips];
          });
	});
});*/

import * as topojson from "topojson";

// set the dimensions and margins of the graph
var margin = { top: 60, right: 70, bottom: 70, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

let projection = d3.geoAlbersUsa()
                   .scale(width)
                   .translate([width / 2, height / 2]);

let path = d3.geoPath().projection(projection);

let svg = d3.select("#map")
	    .append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("preserveAspectRatio", "xMinYMin meet")
	    .attr("viewBox", `0 0 ${width} ${height}`);

let g = svg.append("g");

let us = require("./us-states.json");

g.selectAll(".states")
 .data(topojson.feature(us, us.objects.states).features)
 .enter().append("path")
 .attr("class", "states")
 .attr("d", path);

d3.select(window).on("resize", this.updateSizes.bind(this));
