const DotDensitySpecies = {
  	initialize: function() {
    		// set the dimensions and margins of the graph
    		var margin = { top: 60, right: 70, bottom: 70, left: 100 },
    		    width = 1435 - margin.left - margin.right,
    		    height = 700 - margin.top - margin.bottom;
    		
    		let projection = d3.geoAlbersUsa()
    		                   .scale(width - 20)
    		                   .translate([width / 2, height / 2]);
    		
    		let path = d3.geoPath().projection(projection);

        const speciesColors = {
            "platanus_acerifolia": "#FF5733",       // Reddish-orange
            "prunus": "#8B0000",                    // Dark red
            "liquidambar_styraciflua": "#FFA500",   // Orange
            "acer_rubrum": "#FFD700",               // Gold
            "gleditsia_triacanthos": "#00FF00",     // Green
            "lagerstroemia_indica": "#663399",      // Medium purple
            "pyrus_calleryana": "#00CED1",          // Blue-green
            "tilia_cordata": "#8A2BE2",             // Blue-violet
            "acer_platanoides": "#FFFF00",          // Yellow
            "fraxinus_pennsylvanica": "#FF00FF",    // Fuchsia
            "others": "#A9A9A9"                     // Dark gray
        };
    
    		const tooltip = d3.select("body").append("div")
    				  .attr("class", "tooltip")
    				  .style("opacity", 0);
    	
    		let mouseOver = function(event, d) {
    		    d3.select(this)
    			.transition()
    			.duration(200)
    			.style("stroke", "black")
    			.style("stroke-width", "0.75px");
    	
    		    tooltip.html(d.state + ' (' + d.count + ' trees in ' + d.scientific_name + ')')
    			.style("left", (event.pageX + 15) + "px")
    			.style("top", (event.pageY - 28) + "px")
    			.transition().duration(400)
    			.style("opacity", 1);
    		}
    	
    		let mouseLeave = function() {
    		    d3.select(this)
    			.transition()
    			.duration(200)
    			.style("stroke", "none");
    	
    		    tooltip.transition().duration(300)
    			.style("opacity", 0);
    		}
    
    		let mouseOver_states = function(event, d) {
    		     d3.select(this)
    			.transition()
    			.duration(200)
    			.style("stroke-width", "2px");
    			
    		     tooltip.html(d.properties.name + ' &#40;' + d.properties.postal + '&#41;')
    			.style("left", (event.pageX + 15) + "px")
    			.style("top", (event.pageY - 28) + "px")
    			.transition().duration(400)
    			.style("opacity", 1);
    		}
    		
    		let mouseLeave_states = function() {
    		     d3.select(this)
    			.transition()
    			.duration(200)
    			.style("stroke-width", "0.75px")
    	
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
    			    .style("fill", "white")
    			    .on("mouseover", mouseOver_states)
    			    .on("mouseleave", mouseLeave_states);
    		    })
    		    .catch(error => {
    		        console.error("Error fetching the data:", error);
    		    });

        var selectedColors = [];

            function handleLegendClick(scientificName) {

                // Check if the clicked color is already selected
                const index = selectedColors.indexOf(scientificName);
                
                // If selected, remove it; otherwise, add it
                if (index !== -1) {
                    selectedColors.splice(index, 1);
                } else {
                    selectedColors.push(scientificName);
                }
                
                // Update the visualization based on the selected colors
                updateVisualization(selectedColors);
            
                // Update the legend styles
                updateLegendStyles();
            }
            
            function updateVisualization(selectedColors) {

                Object.keys(speciesColors).forEach(scientific_name => {
                    const isClicked = selectedColors.includes(scientific_name);
                    const displayStyle = isClicked || selectedColors.length === 0 ? null : "none";
                    const circles = d3.selectAll(`.circle-${scientific_name}`);
                    const legendText = d3.selectAll(`.legend-text-${scientific_name}`);

                    circles.style("display", displayStyle);
                    legendText.style("font-weight", isClicked ? "bold" : "normal");
                    
                });
            }

            function updateLegendStyles() {
                const keys = Object.keys(speciesColors);
                const isColorsEmpty = selectedColors.length === 0;
                const isColorsFull = selectedColors.length === Object.keys(speciesColors).length;
            
                keys.forEach(key => {
                    const color = speciesColors[key];
                    const isClicked = selectedColors.includes(key);
                    
                    d3.selectAll(`.legend-rect-${key}`)
                      .style("fill", isClicked || isColorsEmpty ? color : "white")
                      .style("stroke", color);
            
                    d3.selectAll(`.legend-text-${key}`)
                      .style("font-weight", isClicked && !isColorsFull ? "bold" : "normal");
                });

                if (isColorsFull) selectedColors = [];
            }
    
        d3.csv("data/section4/dotmap2_alternative.csv").then(function(data) {
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", function(d) { return "circle-" + d.scientific_name.replace(/\s+/g, '_').toLowerCase(); })
                .attr("cx", function(d) {
                    return projection([+d.longitude, +d.latitude])[0];
                })
                .attr("cy", function(d) {
                    return projection([+d.longitude, +d.latitude])[1];
                })
                .attr("r", function(d) {
                    return Math.sqrt(+d.count)/10;
                })
                    .style("fill", function(d) {
                      return speciesColors[d.scientific_name.replace(/\s+/g, '_').toLowerCase()];
                    })
                    .style("opacity", 0.5)
                  .on("mouseover", mouseOver)
                          .on("mouseleave", mouseLeave);
        });

       var map_legend = svg.append("g")
                                          .attr("class", "legend")
                                          .attr("transform", "translate(80,220)");

      var keys = Object.keys(speciesColors); // Get keys from the dictionary
               
               keys.forEach(function(key, j) {
                   var color = speciesColors[key]; // Get color value for the key
                   
                   map_legend.append("rect")
                                    .attr("class", `legend-rect-${key}`)
                                    .attr("x", width/2 + 385) // 100
                                    .attr("y", j * 30)
                                    .attr("width", 20)
                                    .attr("height", 20)
                                    .attr("fill", color)
                                    .on("click", () => handleLegendClick(key))
                                    .style("cursor", "pointer");
               
                   map_legend.append("text")
                                    .attr("x", width/2 + 415) // 85
                                    .attr("y", j * 30 + 15)
                                    .attr("class", "legend-text-" + key)
                                    .text((key.charAt(0).toUpperCase() + key.slice(1)).replace(/_/g, ' ')) // Display the key associated with the color
                                    .style("font-size", "12px");
               });
  	},

  	destroy: function() {
  	    // Clean up existing map elements
  	    const existingMap = document.querySelector("#dotmap svg");
  	    if (existingMap)
  		      existingMap.parentNode.removeChild(existingMap);
  	
  	    // Remove the reference from the global object
  	    delete window.DotDensitySpecies;
  	}
}
