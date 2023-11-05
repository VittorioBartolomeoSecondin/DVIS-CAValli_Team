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

  var colours = ["#27742D", "#2A7B2C", "#30822D", "#378830", "#3F8F33", "#489636", 
                 "#519D39", "#5AA33C", "#64AA3F", "#6FB142", "#79B745", "#84BE48", 
                 "#8FC44B", "#9BCB4E", "#A7D151", "#B3D855", "#C0DE58"];
  
  var heatmapColour = d3.scaleLinear()
    .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
    .range(colours);

  var c = d3.scaleLinear().domain([d3.max(data, function(d) { return +d.count}), d3.min(data, function(d) { return +d.count})]).range([0,1]);

  console.log([d3.max(data, function(d) { return +d.count}), d3.min(data, function(d) { return +d.count})]);
  
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
