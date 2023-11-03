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
    .padding(0.05);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0.05);
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  const myColor = d3.scaleSequential()
    .range(["#d5e9c5", "#356d10"])
    .domain([500,40000])



  // Add X grid lines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x)
      .tickSize(-height)
      .tickFormat("")
    );
  
  // Add Y grid lines
  svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
      .tickSize(-width)
      .tickFormat("")
    );

  // Select the grid lines and style them
  svg.selectAll(".grid line")
    .style("stroke", "black")
    .style("stroke-opacity", 0.5)
    .style("shape-rendering", "crispEdges"); // Optional for crisp edges

  


  // add the squares
  svg.selectAll()
    .data(data, function(d) {return d.city+':'+d.species;})
    .join("rect")
      .attr("x", function(d) { return x(d.city) })
      .attr("y", function(d) { return y(d.species) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.count)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
})
