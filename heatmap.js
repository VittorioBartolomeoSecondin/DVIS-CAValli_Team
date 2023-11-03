// append the svg object to the body of the page
var svg = d3.select("#heatmap")
.append("svg")
  .attr("id", "heatmap_svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Labels of row and columns
var myGroups = ["Los Angeles", "San Jose", "San Diego", "Rancho Cucamonga", "Stockton"]
var myVars = ["Lagerstroemia indica", "Platanus acerifolia", "Liquidambar styraciflua", "Washingtonia robusta", "Magnolia grandiflora"]

// Build X scales and axis:
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(myGroups)
  .padding(0.01);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))

// Build X scales and axis:
var y = d3.scaleBand()
  .range([ height, 0 ])
  .domain(myVars)
  .padding(0.01);
svg.append("g")
  .call(d3.axisLeft(y));

// Build color scale
var myColor = d3.scaleLinear()
  .range(["#d5e9c5", "#356d10"])
  .domain([500,40000])

//Read the data
d3.csv("section1_1/stacked_1.csv", function(data) {

  svg.selectAll()
      .data(data, function(d) {return d.city+':'+d.species;})
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(d.city) })
      .attr("y", function(d) { return y(d.species) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.count)} )

})
