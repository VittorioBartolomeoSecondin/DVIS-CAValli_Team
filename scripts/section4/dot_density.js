const DotDensity = {
	initialize: function() {
		// set the dimensions and margins of the graph
		var margin = { top: 60, right: 70, bottom: 70, left: 100 },
		    width = 1435 - margin.left - margin.right,
		    height = 700 - margin.top - margin.bottom;
		
		let projection = d3.geoAlbersUsa()
		                   .scale(width - 20)
		                   .translate([width / 2, height / 2]);
		
		let path = d3.geoPath().projection(projection);
		const tooltip = d3.select("body").append("div")
				  .attr("class", "tooltip")
				  .style("opacity", 0);
	
		let mouseOver = function(event, d) {
		    d3.selectAll(".Circle")
		      .transition()
		      .duration(200)
		      .style("opacity", 0.1)
		      .style("stroke", "none");
		    d3.select(this)
			.transition()
			.duration(200)
			.style("stroke", "black")
			.style("opacity", 0.5)
			.style("stroke-width", "0.75px");
		    tooltip.html(d.greater_metro + ' (' + d.count + ' trees)')
			.style("left", (event.pageX + 15) + "px")
			.style("top", (event.pageY - 28) + "px")
			.transition().duration(400)
			.style("opacity", 1);
		}
	
		let mouseLeave = function() {
		    d3.selectAll(".Circle")
			.transition()
			.duration(200)
			.style("opacity", 0.5)
			.style("stroke", "none");
		    tooltip.transition().duration(300)
			.style("opacity", 0);
		}
		let mouseOver_states = function(event, d) {
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
			.style("stroke", d.properties.abundance != 0 ? "green" : "black")
			.style("stroke-width", "2px");
		     tooltip.html(d.properties.name + ' &#40;' + d.properties.postal + '&#41;')
			.style("left", (event.pageX + 15) + "px")
			.style("top", (event.pageY - 28) + "px")
			.transition().duration(400)
			.style("opacity", 1);
		}
		
		let mouseLeave_states = function() {
		     d3.selectAll(".Country")
			.transition()
			.duration(200)
			.style("opacity", 1)
			.style("stroke", "black")
			.style("stroke-width", "0.75px");
		    tooltip.transition().duration(300)
			.style("opacity", 0);
		}
		
		let svg = d3.select("#dotmap")
			    .append("svg")
			    .attr("width", width)
			    .attr("height", height)
			    .attr("preserveAspectRatio", "xMinYMin meet")
			    .attr("viewBox", `0 0 ${width} ${height}`);
		let zoomed = function(event) {
		    world.attr("transform", event.transform);
		    // Update circle positions and sizes on zoom
		    svg.selectAll("circle")
		        .attr("cx", function(d) {
		            return event.transform.apply([projection([+d.longitude, +d.latitude])[0], projection([+d.longitude, +d.latitude])[1]])[0];
		        })
		        .attr("cy", function(d) {
		            return event.transform.apply([projection([+d.longitude, +d.latitude])[0], projection([+d.longitude, +d.latitude])[1]])[1];
		        })
		        .attr("r", function(d) {
		            return (Math.sqrt(+d.count) / 10) * event.transform.k; // Scale based on zoom level
		        });
		};

		let zoom = d3.zoom()
		    .scaleExtent([1, 8]) 
		    .on("zoom", zoomed);
		
		svg.call(zoom);
		
		let world = svg.append("g");
		
		let currentZoomState = null;

		let zoomIn = function(event, d) {
		    if (currentZoomState === d.id) {
		        // Reset to initial view
		        svg.transition()
		            .duration(750)
		            .call(
		                zoom.transform,
		                d3.zoomIdentity
		            );
		        currentZoomState = null; // Reset the currently zoomed state
		    } else {
		        // Zoom to the clicked state
		        let bounds = path.bounds(d);
		        let dx = bounds[1][0] - bounds[0][0];
		        let dy = bounds[1][1] - bounds[0][1];
		        let x = (bounds[0][0] + bounds[1][0]) / 2;
		        let y = (bounds[0][1] + bounds[1][1]) / 2;
		        let scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
		        let translate = [width / 2 - scale * x, height / 2 - scale * y];
		
		        svg.transition()
		            .duration(750)
		            .call(
		                zoom.transform,
		                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		            );
		        currentZoomState = d.id; // Set the currently zoomed state
		    }
		};
		
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
			    .style("fill", "white")
			    .on("mouseover", mouseOver_states)
			    .on("mouseleave", mouseLeave_states)
			    .on("click", zoomIn);
		    })
		    .catch(error => {
		        console.error("Error fetching the data:", error);
		    });
		    d3.csv("data/section4/dotmap_alternative.csv").then(function(data) {
			svg.selectAll("circle")
			    .data(data)
			    .enter()
			    .append("circle")
			    .attr("class", "Circle")
			    .attr("cx", function(d) {
			        return projection([+d.longitude, +d.latitude])[0];
			    })
			    .attr("cy", function(d) {
			        return projection([+d.longitude, +d.latitude])[1];
			    })
			    .attr("r", function(d) {
			        return Math.sqrt(+d.count)/10;
			    })
			    .style("fill", "rgb(34,139,34)")
			    .style("opacity", 0.5)
			    .on("mouseover", mouseOver)
			    .on("mouseleave", mouseLeave);
		    });
	},
	destroy: function() {
	    // Clean up existing map elements
	    const existingMap = document.querySelector("#dotmap svg");
	    if (existingMap)
		existingMap.parentNode.removeChild(existingMap);
	
	    // Remove the reference from the global object
	    delete window.DotDensity;
	}
}
DotDensity.initialize();
