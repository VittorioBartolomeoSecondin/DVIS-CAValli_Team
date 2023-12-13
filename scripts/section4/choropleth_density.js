const ChoroplethDensity = {
	initialize: function() {
		// set the dimensions and margins of the graph
		var margin = { top: 60, right: 70, bottom: 70, left: 100 },
		    width = 1300 - margin.left - margin.right,
		    height = 700 - margin.top - margin.bottom;
		
		// Define the width and height of the legend
		const legendWidth = 110;
		const legendHeight = 300;
		
		// Calculate the position for the legend
		const legendX = width - legendWidth - 20; 
		const legendY = height / 2 - legendHeight / 2 - 220; 
		
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
						.style("opacity", .3)
						.style("stroke", "black")
						.style("stroke-width", "0.75px");
					d3.select(this)
						.transition()
						.duration(200)
						.style("opacity", 1)
						.style("stroke", d.properties.density_1000 != 0 ? "green" : "black")
						.style("stroke-width", "2px");
					tooltip.html(d.properties.name + ' &#40;' + d.properties.postal + '&#41;: ' + Math.round(d.properties.density_1000) + ' trees every 1000 km<sup>2</sup>')
						.style("left", (event.pageX + 15) + "px")
						.style("top", (event.pageY - 28) + "px")
						.transition().duration(400)
						.style("opacity", 1);
				}
		
		let mouseLeave = function() {
					d3.selectAll(".Country")
						.transition()
						.duration(200)
						.style("opacity", 1)
						.style("stroke", "black")
						.style("stroke-width", "0.75px");
					tooltip.transition().duration(300)
						.style("opacity", 0);
				}
		
		let path = d3.geoPath().projection(projection);
		
		// Define color scale
		const colorScale = d3.scaleThreshold()
			.domain([100, 500, 1000, 4000])
			.range(d3.schemeGreens[5]);
		
		let svg = d3.select("#choropleth_density")
			    .append("svg")
			    .attr("width", width)
			    .attr("height", height)
			    .attr("preserveAspectRatio", "xMinYMin meet")
			    .attr("viewBox", `0 0 ${width} ${height}`);
		
		let world = svg.append("g");
		
		// Add the stripe pattern to the SVG
		const defs = svg.append("defs");
		
		defs.append("pattern")
		    .attr("id", "stripe")
		    .attr("patternUnits", "userSpaceOnUse")
		    .attr("width", 8)
		    .attr("height", 8)
		    .attr("patternTransform", "rotate(45)")
		    .append("rect")
		    .attr("width", 4)
		    .attr("height", 8)
		    .attr("transform", "translate(0,0)")
		    .attr("opacity", 0.5)
		    .attr("fill", "grey");
		
		fetch("data/section4/choropleth.json")
		    .then(response => response.json())
		    .then(data => {
		        const data_features = topojson.feature(data, data.objects.states).features;
			    
		        world.selectAll(".states")
		            .data(data_features)
		            .enter().append("path")
			    .attr("data-name", function(d) { return d.properties.name }) 
				
			    // add a class, styling and mouseover/mouseleave
			    .attr("d", path)
			    .style("stroke", "black")
			    .attr("class", "Country")
			    .attr("id", function(d) { return d.id })
			    .style("opacity", 1)
			    .style("stroke-width", "0.75px")
		            .style("fill", function(d) {
		                // Get data value
		                var value = d.properties.density_1000;
		                //return mapColour(c(value));
			        return value != 0 ? colorScale(value) : "url(#stripe)";
		            })
			    .on("mouseover", mouseOver)
			    .on("mouseleave", mouseLeave);
		    })
		    .catch(error => {
		        console.error("Error fetching the data:", error);
		    });
		
		// Legend
		const x = d3.scaleLinear()
			.domain([2.6, 75.1])
			.rangeRound([600, 860]);
		
		const legend = svg.append("g")
			.attr("id", "choropleth_legend")
			.attr("transform", `translate(${legendX}, ${legendY})`);
		
		const legend_entry = legend.selectAll("g.legend")
			.data(colorScale.range().map(function(d) {
				d = colorScale.invertExtent(d);
				if (d[0] == null) d[0] = x.domain()[0];
				if (d[1] == null) d[1] = x.domain()[1];
				return d;
			}))
			.enter().append("g")
			.attr("class", "legend_entry");
		
		const ls_w = 20,
			ls_h = 20;
		
		legend_entry.append("rect")
			.attr("x", 20)
			.attr("y", function(d, i) {
				return height - (i * ls_h) - 2 * ls_h;
			})
			.attr("width", ls_w)
			.attr("height", ls_h)
			.style("fill", function(d) {
				return colorScale(d[0]);
			});
			//.style("opacity", 0.8);
		
		legend_entry.append("text")
			.attr("x", 50)
			.attr("y", function(d, i) {
				return height - (i * ls_h) - ls_h - 6;
			})
			.text(function(d, i) {
				if (i === 0) return "< " + d[1];
				if (d[1] < d[0]) return d[0] + " +";
				return d[0] + " - " + d[1];
			});
		
			legend.append("text")
			  .attr("x", 27)
			  .attr("y", 425)
			  .text("Tree density");
			
			legend.append("text")
			  .attr("x", 7)
			  .attr("y", 440)
			  .text("(trees every 1000 km")
			  .append("tspan")
			  .attr("baseline-shift", "super")
			  .text("2");
			
			legend.append("text")
			  .attr("x", 128)
			  .attr("y", 440)
			  .text(")");
	}
}

ChoroplethDensity.initialize();
