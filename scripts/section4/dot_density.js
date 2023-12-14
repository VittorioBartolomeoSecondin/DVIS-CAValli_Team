const Dot_Density = {
	initialize: function() {
		// set the dimensions and margins of the graph
		var margin = { top: 60, right: 70, bottom: 70, left: 100 },
		    width = 1300 - margin.left - margin.right,
		    height = 700 - margin.top - margin.bottom;
		
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
						//.style("stroke", d.properties.abundance != 0 ? "green" : "black")
						.style("stroke-width", "2px");
					tooltip.html(d.properties.name + ' &#40;' + d.properties.postal + '&#41;: ' + d.properties.abundance + ' trees' +
		        			'<br>' + d.properties.area + ' square kilometers')
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
			.domain([50000, 100000, 200000, 300000, 500000])
			.range(d3.schemeGreens[6]);
		
		let svg = d3.select("#dotmap")
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
		                var value = d.properties.abundance;
		                //return mapColour(c(value));
			        return value != 0 ? colorScale(value) : "url(#stripe)";
		            })
			    .on("mouseover", mouseOver)
			    .on("mouseleave", mouseLeave);
		    })
		    .catch(error => {
		        console.error("Error fetching the data:", error);
		    });
	}
}


		/*
d3.csv("dotmap.csv", function(data) {

svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
        return projection([d.longitude, d.latitude])[0];
    })
    .attr("cy", function(d) {
        return projection([d.longitude, d.latitude])[1];
    })
    .attr("r", function(d) {
        return Math.sqrt(d.count)/10;
    })
        .style("fill", "rgb(217,91,67)")
        .style("opacity", 0.85)

    .on("mouseover", function(d) {
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
    });
});

*/
