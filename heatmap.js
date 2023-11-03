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
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(5))
    .select(".domain").remove()

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0);
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(5))
    .select(".domain").remove()

  // Build color scale
  const myColor = d3.scaleSequential()
    .range(["#d5e9c5", "#356d10"])
    .domain([500,40000])

  // Extract color domain values and color codes
  const colorDomain = myColor.domain(); // Array of color domain values (numbers)
  const colorRange = myColor.range();   // Array of color codes
  
  // Create a legend SVG element
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0, 20"); // Adjust the position as needed
  
  // Draw colored rectangles and corresponding text labels in the legend
  legend.selectAll("rect")
    .data(colorDomain)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 30) // Adjust spacing
    .attr("width", 30) // Adjust the width of each legend item
    .attr("height", 15) // Adjust the height of the legend items
    .style("fill", d => myColor(d)); // Use the color scale to fill
  
  legend.selectAll("text")
    .data(colorDomain)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 30 + width) // Adjust spacing and positioning
    .attr("y", height) // Adjust vertical position
    .style("text-anchor", "middle")
    .text(d => d);

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
      .style("fill", function(d) { return myColor(d.count)} )
      .style("stroke-width", 1)
      .style("stroke", "black")
      .style("opacity", 0.8)
})
