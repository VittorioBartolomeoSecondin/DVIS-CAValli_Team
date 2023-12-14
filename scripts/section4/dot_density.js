const Dot_Density = {
	initialize: function() {
		// set the dimensions and margins of the graph
		var margin = { top: 60, right: 70, bottom: 70, left: 100 },
		    width = 1300 - margin.left - margin.right,
		    height = 700 - margin.top - margin.bottom;
		
		let projection = d3.geoAlbersUsa()
		                   .scale(width)
		                   .translate([width / 2, height / 2]);
		
		let path = d3.geoPath().projection(projection);

		const tooltip = d3.select("body").append("div")
				  .attr("class", "tooltip")
				  .style("opacity", 0);
		
		let mouseOver = function(event, d) {
					d3.selectAll("circle")
						.transition()
						.duration(200)
						.style("stroke", "black")
						.style("stroke-width", "0.75px");
					tooltip.html(d.properties.name + ' &#40;')
						.style("left", (event.pageX + 15) + "px")
						.style("top", (event.pageY - 28) + "px")
						.transition().duration(400)
						.style("opacity", 1);
				}
		
		let mouseLeave = function() {
					d3.selectAll("circle")
						.transition()
						.duration(200)
					tooltip.transition().duration(300)
						.style("opacity", 0);
				}
		
		let svg = d3.select("#dotmap")
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
			    
		        world.selectAll(".states")
		            .data(data_features)
		            .enter().append("path")
			    .attr("data-name", function(d) { return d.properties.name }) 
				
			    // add a class and styling
			    .attr("d", path)
			    .style("stroke", "black")
			    .attr("class", "Country")
			    .attr("id", function(d) { return d.id })
			    .style("opacity", 1)
			    .style("stroke-width", "0.75px")
			    .style("fill", "white");
		    })
		    .catch(error => {
		        console.error("Error fetching the data:", error);
		    });

		    d3.csv("data/section4/dotmap.csv").then(function(data) {

			svg.selectAll("circle")
			    .data(data)
			    .enter()
			    .append("circle")
			    .attr("cx", function(d) {
			        return projection([+d.longitude, +d.latitude])[0];
			    })
			    .attr("cy", function(d) {
			        return projection([+d.longitude, +d.latitude])[1];
			    })
			    .attr("r", function(d) {
			        return Math.sqrt(+d.count)/20;
			    })
			        .style("fill", "rgb(34,139,34)")
			        .style("opacity", 0.5);
			
			    /*.on("mouseover", function(d) {
			        div.transition()
			             .duration(200)
			           .style("opacity", .9);
			           div.text(d.state)
			           .style("left", (d3.event.pageX) + "px")
			           .style("top", (d3.event.pageY - 28) + "px");
			    })
			
			    // fade out tooltip on mouse out
			    .on("mouseout", function(d) {
				div.transition()
			           .duration(500)
			           .style("opacity", 0);
			    });*/
		    });
	}
}

Dot_Density.initialize();
