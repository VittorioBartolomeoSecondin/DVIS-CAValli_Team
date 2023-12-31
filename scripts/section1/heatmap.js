// append the svg object to the body of the page
const svg = d3.select("#heatmap")
  .append("svg")
    .attr("id", "heatmap_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 40)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Read the data
d3.csv("data/section1/heatmap/heatmap.csv").then(function(data) {

  // Labels of row and columns -> unique identifier of the column called 'city' and 'species'
  const myGroups = Array.from(new Set(data.map(d => d.city)))
  const myVars = Array.from(new Set(data.map(d => d.species)))

  // Build X scales and axis:
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)
    .padding(0);
  
  svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(5))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
    .select(".domain").remove();

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0);
  
  svg.append("g")
      .attr("class", "axis")
    .call(d3.axisLeft(y).tickSize(5))
    .select(".domain").remove()

  var colours = ["#2F2F2F", "#323232", "#353535", "#383838", "#3B3B3B", "#3E3E3E", 
                 "#414141", "#444444", "#565656", "#686868", "#7A7A7A", "#8C8C8C", 
                 "#9D9D9D", "#AFAFAF", "#C1C1C1", "#D3D3D3", "#E5E5E5"];
  
  var heatmapColour = d3.scaleLinear()
    .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
    .range(colours);

  var c = d3.scaleLinear().domain([d3.max(data, function(d) { return +d.count}), d3.min(data, function(d) { return +d.count})]).range([0,1]);
  
  // add cells in the heatmap
  svg.selectAll()
    .data(data, function(d) {return d.city+':'+d.species;})
    .join("rect")
      .attr("x", function(d) { return x(d.city) })
      .attr("y", function(d) { return y(d.species) })
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return heatmapColour(c(d.count)) })
      .style("stroke-width", 1)
      .style("stroke", "black")
      .style("opacity", 0.8)

  const legend_svg = d3.select("#heatmap")
    .append("svg")
      .attr("id", "heatmap_legend_svg")
      .attr("width", 1100)
      .attr("height", 80)
    .append("g")
      .attr("transform", `translate(170, -30)`);

  var colorscale = colours.reverse();
  var min = d3.min(data, function(d) { return +d.count}); 
  var max = d3.max(data, function(d) { return +d.count});
  
  var color = d3.scaleQuantize()
    .domain([min, max])
    .range(colorscale);
  
  var format = d3.format(".0f")
  
  drawColorScale();
  
  function drawColorScale() {
      var palette = legend_svg.append('g')
        .attr('id', 'palette');

      // fill the legend with rectangles (colours)
      var swatch = palette.selectAll('rect').data(colorscale);
      swatch.enter().append('rect')
        .attr('fill', function(d) {
          return d;
        })
        .attr('x', function(d, i) {
          return i * 50;
        })
        .attr('y', 50)
        .attr('width', 50)
        .attr('height', 20)
        .style("stroke-width", 1)
        .style("stroke", "black");

      // counts are placed below the legend
      var texts = palette.selectAll("foo")
        .data(color.range())
        .enter()
        .append("text")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("y", 80)
        .attr('x', function(d, i) {
          return i * 50 + 25;
        })
        .append("tspan")
        .attr("dy", "0.5em")
        .attr('x', function(d, i) {
          return i * 50;
        })
        // single value separating two rectangles in the legend
        .text(function(d) {
          return format(color.invertExtent(d)[0])
        })
        .append("tspan")
        .attr('x', function(d, i) {
          return i * 50 + 50;
        })
        // last value below the legend
        .text(function(d) {
          if (color.invertExtent(d)[1] == max)
            return format(color.invertExtent(d)[1])
        })
  }
})
