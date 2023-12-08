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

// Fetching the JSON file using fetch
fetch("scripts/section4/us-states.json")
    .then(response => response.json())
    .then(data => {
        g.selectAll(".states")
            .data(topojson.feature(data, data.objects.states).features)
            .enter().append("path")
            .attr("class", "states")
            .attr("d", path);
    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });
