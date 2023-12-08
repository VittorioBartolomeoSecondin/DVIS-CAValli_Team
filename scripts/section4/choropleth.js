// set the dimensions and margins of the graph
var margin = { top: 60, right: 70, bottom: 70, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// D3 Projection
var projection = d3.geoAlbersUsa()
				   .translate([width/2, height/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

var colours = ["#2F2F2F", "#323232", "#353535", "#383838", "#3B3B3B", "#3E3E3E", 
                 "#414141", "#444444", "#565656", "#686868", "#7A7A7A", "#8C8C8C", 
                 "#9D9D9D", "#AFAFAF", "#C1C1C1", "#D3D3D3", "#E5E5E5"];
  
var mapColour = d3.scaleLinear()
		      .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
		      .range(colours);

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

let g = svg.append("g");
/*
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
    });*/




// Load in my states data!
d3.csv("data/section4/state_abundance_postal.csv", function(d) {
	//var c = d3.scaleLinear().domain([d3.max(data, function(d) { return +d.abundance}), d3.min(data, function(d) { return +d.abundance})]).range([0,1]);

	// Load GeoJSON data and merge with states data
	fetch("scripts/section4/us-states.json")
	.then(response => {
	     	// Loop through each state data value in the .csv file
		for (var i = 0; i < d.length; i++) {
		
			// Grab State Name
			var dataState = d[i].state;
		
			// Grab data value 
			var dataValue = d[i].abundance;
		
			// Find the corresponding state inside the GeoJSON
			for (var j = 0; j < response.json().features.length; j++)  {
				var jsonState = response.json().features[j].properties.name;
		
				if (dataState == jsonState) {
		
				// Copy the data value into the JSON
				response.json().features[j].properties.abundance = dataValue; 
		
				// Stop looking through the JSON
				break;
				}
			}
		}
	    })
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
});

/*
// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", function(d) {
		
			// Get data value
			var value = d.properties.abundance;
		
			if (value) {
			//If value exists…
			return mapColour(c(value));
			} else {
			//If value is undefined…
			return "rgb(213,222,217)";
			}*/
