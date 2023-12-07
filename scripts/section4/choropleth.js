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
});
