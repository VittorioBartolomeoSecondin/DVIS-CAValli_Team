// add tooltip
const tooltip_density = d3.select("body").append("div")
		  .attr("class", "tooltip")
		  .style("opacity", 0);

let mouseOver_density = function(event, d) {
			d3.selectAll(".Country_density")
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
			tooltip.html(d.properties.name + ' &#40;' + d.properties.postal + '&#41;: ' + d.properties.density_1000 + ' trees/1000 square kilometers')
				.style("left", (event.pageX + 15) + "px")
				.style("top", (event.pageY - 28) + "px")
				.transition().duration(400)
				.style("opacity", 1);
		}

let mouseLeave_density = function() {
			d3.selectAll(".Country_density")
				.transition()
				.duration(200)
				.style("opacity", 1)
				.style("stroke", "black")
				.style("stroke-width", "0.75px");
			tooltip.transition().duration(300)
				.style("opacity", 0);
		}

// Define color scale
const colorScale_density = d3.scaleThreshold()
	.domain([100000, 200000, 300000, 500000])
	.range(d3.schemeGreens[5]);

let svg_density = d3.select("#choropleth_density")
	    .append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("preserveAspectRatio", "xMinYMin meet")
	    .attr("viewBox", `0 0 ${width} ${height}`);

let world_density = svg_density.append("g");

// Add the stripe pattern to the SVG
const defs_density = svg_density.append("defs");

defs_density.append("pattern")
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
	    .attr("class", "Country_density")
	    .attr("id", function(d) { return d.id })
	    .style("opacity", 1)
	    .style("stroke-width", "0.75px")
            .style("fill", function(d) {
                // Get data value
                var value = d.properties.density_1000;
                //return mapColour(c(value));
	        return value != 0 ? colorScale_density(value) : "url(#stripe)";
            })
	    .on("mouseover", mouseOver)
	    .on("mouseleave", mouseLeave);
    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });

// Legend
const x_density = d3.scaleLinear()
	.domain([2.6, 75.1])
	.rangeRound([600, 860]);

const legend_density = svg.append("g")
	.attr("id", "choropleth_legend")
	.attr("transform", `translate(${legendX}, ${legendY})`);

const legend_entry_density = legend_density.selectAll("g.legend_density")
	.data(colorScale_density.range().map(function(d) {
		d = colorScale_density.invertExtent(d);
		if (d[0] == null) d[0] = x_density.domain()[0];
		if (d[1] == null) d[1] = x_density.domain()[1];
		return d;
	}))
	.enter().append("g")
	.attr("class", "legend_entry_density");

legend_entry_density.append("rect")
	.attr("x", 20)
	.attr("y", function(d, i) {
		return height - (i * ls_h) - 2 * ls_h;
	})
	.attr("width", ls_w)
	.attr("height", ls_h)
	.style("fill", function(d) {
		return colorScale_density(d[0]);
	});
	//.style("opacity", 0.8);

legend_entry_density.append("text")
	.attr("x", 50)
	.attr("y", function(d, i) {
		return height - (i * ls_h) - ls_h - 6;
	})
	.text(function(d, i) {
		if (i === 0) return "< " + d[1] / 1000 + " k";
		if (d[1] < d[0]) return d[0] / 1000 + " k +";
		return d[0] / 1000 + " k - " + d[1] / 1000 + " k";
	});

legend_density.append("text").attr("x", 15).attr("y", 440).text("Tree abundance");
