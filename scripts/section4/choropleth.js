// set the dimensions and margins of the graph
var margin = { top: 60, right: 70, bottom: 70, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;
let projection = d3.geoAlbersUsa()
                   .scale(width)
                   .translate([width / 2, height / 2]);
let path = d3.geoPath().projection(projection);

var colours = ["#2F2F2F", "#323232", "#353535", "#383838", "#3B3B3B", "#3E3E3E", 
                 "#414141", "#444444", "#565656", "#686868", "#7A7A7A", "#8C8C8C", 
                 "#9D9D9D", "#AFAFAF", "#C1C1C1", "#D3D3D3", "#E5E5E5"];
  
var mapColour = d3.scaleLinear()
		      .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
		      .range(colours);

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
            .attr("d", path)
	    .style("stroke", "#fff")
	    .style("stroke-width", "0.75px")
	    .style("fill", function(d) {
		// Get data value
		var value = d.properties.abundance;
	
		if (value) {
		//If value exists…
		return "rgb(255,0,0)";//mapColour(c(value));
		} else {
		//If value is undefined…
		return "rgb(213,222,217)";
    	   	}
	    })
    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });


// // set the dimensions and margins of the graph
// var margin = { top: 60, right: 70, bottom: 70, left: 100 },
//     width = 1000 - margin.left - margin.right,
//     height = 700 - margin.top - margin.bottom;

// // Define path generator
// var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
// 	.projection(projection);  // tell path generator to use albersUsa projection


// // initial setup
// const svg = d3.select("svg"),
// 	path = d3.geoPath(),
// 	data = d3.map(),
// 	usamap = "scripts/section4/us-states.json",
// 	treeabundance = "data/section4/state_abundance_postal.csv";

// let centered, world;

// // style of geographic projection and scaling
// var projection = d3.geoAlbersUsa()
// 	.translate([width/2, height/2])    // translate to center of screen
// 	.scale([1000]);          // scale things down so see entire US

// // Define color scale
// var colours = ["#2F2F2F", "#323232", "#353535", "#383838", "#3B3B3B", "#3E3E3E", 
//                  "#414141", "#444444", "#565656", "#686868", "#7A7A7A", "#8C8C8C", 
//                  "#9D9D9D", "#AFAFAF", "#C1C1C1", "#D3D3D3", "#E5E5E5"];
  
// var mapColour = d3.scaleLinear()
// 		      .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
// 		      .range(colours);

// // add tooltip
// const tooltip = d3.select("body").append("div")
// 	.attr("class", "tooltip")
// 	.style("opacity", 0);

// // Load external data and boot
// d3.queue()
// 	.defer(d3.json, usamap)
// 	.defer(d3.csv, treeabundance, function(d) {
// 		data.set(d.postal, +d.abundance);
// 	})
// 	.await(ready);

// // Add clickable background
// svg.append("rect")
//   .attr("class", "background")
// 	.attr("width", width)
// 	.attr("height", height)
// 	.on("click", click);

// // ----------------------------
// //Start of Choropleth drawing
// // ----------------------------

// function ready(error, topo) {
// 	// topo is the data received from the d3.queue function (the world.geojson)
// 	// the data from world_population.csv (country code and country population) is saved in data variable
	
// 	d3.csv("data/section4/state_abundance_postal.csv", function(d) {
// 	var c = d3.scaleLinear().domain(
// 		[d3.max(topo, function(d) { return +d.features.properties.abundance}), 
// 		 d3.min(topo, function(d) { return +d.features.properties.abundance})]).range([0,1]);});
	
// 	let mouseOver = function(d) {
// 		d3.selectAll(".states")
// 			.transition()
// 			.duration(200)
// 			.style("opacity", .5)
// 			.style("stroke", "transparent");
// 		d3.select(this)
// 			.transition()
// 			.duration(200)
// 			.style("opacity", 1)
// 			.style("stroke", "black");
// 		tooltip.style("left", (d3.event.pageX + 15) + "px")
// 			.style("top", (d3.event.pageY - 28) + "px")
// 			.transition().duration(400)
// 			.style("opacity", 1)
// 			.text(d.properties.name + ': ' + Math.round((d.total / 1000000) * 10) / 10 + ' mio.');
// 	}

// 	let mouseLeave = function() {
// 		d3.selectAll(".states")
// 			.transition()
// 			.duration(200)
// 			.style("opacity", 1)
// 			.style("stroke", "transparent");
// 		tooltip.transition().duration(300)
// 			.style("opacity", 0);
// 	}

// 	// Draw the map
// 	usa = svg.append("g")
// 		.attr("class", "usa");
// 	usa.selectAll("path")
// 		.data(topo.features)
// 		.enter()
// 		.append("path")
// 		// draw each country
// 		// d3.geoPath() is a built-in function of d3 v4 and takes care of showing the map from a properly formatted geojson file, if necessary filtering it through a predefined geographic projection
// 		.attr("d", d3.geoPath().projection(projection))

// 		//retrieve the name of the state from data
// 		.attr("data-name", function(d) {
// 			return d.properties.name
// 		})

// 		// set the color of each country
// 		.attr("fill", function(d) {
// 			var value = d.properties.abundance;
// 			if (value) {return mapColour(c(value));}
// 			else {return "rgb(213,222,217)";}
// 		})

// 		// add a class, styling and mouseover/mouseleave and click functions
// 		.style("stroke", "transparent")
// 		.attr("class", function(d) {
// 			return "Country"
// 		})
// 		.style("opacity", 1)
// 		.on("mouseover", mouseOver)
// 		.on("mouseleave", mouseLeave)
// 		.on("click", click);
  
// 	// Legend
// 	const x = d3.scaleLinear()
// 		.domain([2.6, 75.1])
// 		.rangeRound([600, 860]);
// }

// // Zoom functionality
// function click(d) {
//   var x, y, k;

//   if (d && centered !== d) {
//     var centroid = path.centroid(d);
//     x = -(centroid[0] * 6);
//     y = (centroid[1] * 6);
//     k = 3;
//     centered = d;
//   } else {
//     x = 0;
//     y = 0;
//     k = 1;
//     centered = null;
//   }

//   world.selectAll("path")
//       .classed("active", centered && function(d) { return d === centered; });

//   world.transition()
//       .duration(750)
//       .attr("transform", "translate(" + x + "," + y + ") scale(" + k + ")" );
  
// }
