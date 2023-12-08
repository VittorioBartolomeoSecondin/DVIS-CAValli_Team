/*
// initial setup
const svg = d3.select("svg"),
	path = d3.geoPath(),
	usamap = "https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_500k.json";

// Load GeoJSON file
d3.json(usamap).then(function (us) {
      // Load CSV data
      d3.csv("data/section4/state_abundance_fips.csv").then(function (data) {
        // Create a dictionary to map state id to abundance
        var dataByFips = {};
        data.forEach(function (d) {
          dataByFips[d.fips] = +d.abundance;
        });

        // Create SVG container
        var svg = d3.select('body').append('svg')
          .attr('width', 960)
          .attr('height', 600);

        // Create color scale
        var color = d3.scaleQuantize()
          .domain([0, d3.max(data, function (d) { return +d.abundance; })])
          .range(d3.schemeBlues[9]);

        // Draw map
        svg.selectAll('path')
          .data(us.features)
          .enter().append('path')
          .attr('d', d3.geoPath())
          .attr('fill', function (d) {
            return color(dataByFips[d.properties.fips]);
          })
          .append('title')
          .text(function (d) {
            return d.properties.name + ': ' + dataByFips[d.properties.fips];
          });
	});
});*/

// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()
    .center([2, 47])                // GPS of location to zoom on
    .scale(980)                       // This is like the zoom
    .translate([ width/2, height/2 ])

// Load external data and boot
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(data){

    // Filter data
    data.features = data.features.filter(d => {console.log(d.properties.name); return d.properties.name=="USA"})

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
          .attr("fill", "grey")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "none")
})
