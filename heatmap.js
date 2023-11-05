// append the svg object to the body of the page
const svg = d3.select("#heatmap")
.append("svg")
.attr("id", "heatmap_svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data
d3.csv("section1_1/heatmap.csv").then(function(data) {

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
    .select(".domain").remove()

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0);
  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickSize(5))
    .select(".domain").remove()

  var colours = ["#258257", "#2A8C5C", "#309562", "#359E67", "#3BA76C", "#41B070", "#48B875", 
                 "#4FC07A", "#56C87F", "#5DCF84", "#65D689", "#76D494", 
                 "#85D49E", "#94D4A8", "#A2D5B2", "#B0D6BC", "#BCD8C5"];
  
  var heatmapColour = d3.scaleLinear()
    .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
    .range(colours);

  var c = d3.scaleLinear().domain(d3.extent(data, (d) => d.count)).range([0,1]);
  
  // add the squares
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
})
