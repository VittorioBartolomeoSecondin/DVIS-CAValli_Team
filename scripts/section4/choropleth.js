// set the dimensions and margins of the graph
var margin = { top: 60, right: 70, bottom: 70, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// Define the width and height of the legend
const legendWidth = 100;
const legendHeight = 300;

// Calculate the position for the legend
const legendX = width - legendWidth - 20; // Adjust as needed
const legendY = height / 2 - legendHeight / 2 - 70; // Center vertically, adjust as needed

let projection = d3.geoAlbersUsa()
                   .scale(width)
                   .translate([width / 2, height / 2]);

// add tooltip
const tooltip = d3.select("body").append("div")
		  .attr("class", "tooltip")
		  .style("opacity", 0);

let mouseOver = function(event, d) {
			d3.selectAll(".Country")
				.transition()
				.duration(200)
				.style("opacity", .5)
				.style("stroke-width", "0.75px")
				.style("stroke", "black");
			d3.select(this)
				.transition()
				.duration(200)
				.style("opacity", 1)
				.style("stroke", "green")
				.style("stroke-width", "2px")
			tooltip.style("left", (event.pageX + 15) + "px")
				.style("top", (event.pageY - 28) + "px")
				.transition().duration(400)
				.style("opacity", 1)
				.text(d.properties.name + ' (' + d.properties.postal + '): ' + d.properties.abundance + ' trees');
		}

let mouseLeave = function() {
			d3.selectAll(".Country")
				.transition()
				.duration(200)
				.style("opacity", 1)
				.style("stroke-width", "0.75px")
				.style("stroke", "black");
			tooltip.transition().duration(300)
				.style("opacity", 0);
		}

let path = d3.geoPath().projection(projection);

var colours = d3.schemeGreens[9].reverse();
  
var mapColour = d3.scaleLinear()
		      .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
		      .range(colours);

let svg = d3.select("#map")
	    .append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("preserveAspectRatio", "xMinYMin meet")
	    .attr("viewBox", `0 0 ${width} ${height}`);

let world = svg.append("g"); 

fetch("data/section4/choropleth.json")
    .then(response => response.json())
    .then(data => {
        const data_features = topojson.feature(data, data.objects.states).features;
        // var c = d3.scaleLinear().domain([d3.max(data_features, function(d) { return +d.properties.abundance}), d3.min(data_features, function(d) { return +d.properties.abundance})]).range([0,1]);
	
	const legend_svg = svg.append("g")
			      .attr("id", "choropleth_legend_svg")
			      .attr("width", legendWidth)
			      .attr("height", legendHeight)
			     .append("g")
			      .attr("transform", `translate(${legendX}, ${legendY})`);

	var min = d3.min(data_features, function(d) { return +d.properties.abundance}); 
        var max = d3.max(data_features, function(d) { return +d.properties.abundance});

	var c = d3.scaleLinear().domain([max, 0]).range([0,1]);
	    
	var color = d3.scaleQuantize()
		      .domain([max, 0])
		      .range(colours);
	  
	var format = d3.format(".0f")
	  
	drawColorScale();
	  
	function drawColorScale() {
	      var palette = legend_svg.append('g')
		.attr('id', 'palette');
	
	      // fill the legend with rectangles (colours)
	      var swatch = palette.selectAll('rect').data(colours);
	      swatch.enter().append('rect')
		.attr('fill', function(d) {
		  return d;
		})
		.attr('y', function(d, i) {
		  return i * 50;
		})
		.attr('x', 50)
		.attr('height', 50)
		.attr('width', 20)
		.style("stroke-width", 1)
		.style("stroke", "black");
	
	      // counts are placed below the legend
	      var texts = palette.selectAll("foo")
		.data(color.range())
		.enter()
		.append("text")
		.attr("font-size", "10px")
		.attr("text-anchor", "middle")
		.attr("x", 80)
		.attr('y', function(d, i) {
		  return 25 + 50 * i;
		})
		.attr("dx", "2em")
		// single value separating two rectangles in the legend
		.text(function(d) {
		  return `< ${(color.invertExtent(d)[0] / (10 ** 6)).toFixed(2)} m`;
		})
		/*.append("tspan")
		.attr('y', function(d, i) {
		  return i * 50 + 50;
		})
		// last value below the legend
		.text(function(d) {
		  if (color.invertExtent(d)[1] == max)
		    return format(color.invertExtent(d)[1])
		})*/
	}

        world.selectAll(".states")
            .data(data_features)
            .enter().append("path")
	    .attr("data-name", function(d) { return d.properties.name }) 
		
	    // add a class, styling and mouseover/mouseleave and click functions
	    .attr("d", path)
	    .style("stroke", "black")
	    .attr("class", "Country")
	    .attr("id", function(d) { return d.id })
	    .style("opacity", 1)
	    .style("stroke-width", "0.75px")
            .style("fill", function(d) {
                // Get data value
                var value = d.properties.abundance;
                return mapColour(c(value));               
            })
	    .on("mouseover", mouseOver)
	    .on("mouseleave", mouseLeave);
    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });
