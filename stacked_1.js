// Parse the Data
d3.csv("section1_1/stacked_1.csv").then( function(data) {
  
  // append the svg object to the body of the page
  const svg = d3.select("#stacked_1")
                .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create the tooltip element
  const tooltip = d3.select("#stacked_1")
                    .append("section")
                    .style("opacity", 0)
                    .style("background-color", "lightgray")
                    .style("border", "2px solid black")
                      .attr("class", "tooltip"); 
 
  // List of subgroups = header of the csv files = scientific name of the trees (here)
  const subgroups = data.columns.slice(1);

  // List of groups = value of the first column = cities (here) -> on Y axis
  const groups = data.map(d => d.city);

  // Define maximum
  var max = d3.max(data, d => d3.sum(subgroups.map(key => +d[key])));  

  // Add X axis
  const x = d3.scaleLinear()
              .domain([0, max + max/10])
              .range([0, width]);
  
  svg.append("g")
       .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x))
     .selectAll("text")
       .attr("transform", "translate(-10,0)rotate(-45)")
     .style("text-anchor", "end");
  
  // Add Y axis
  const y = d3.scaleBand()
              .range([0, height])
              .domain(groups)
              .padding(.1);
  
  svg.append("g")
     .call(d3.axisLeft(y).tickSizeOuter(0));

  // Color palette = one color per subgroup
  const color = d3.scaleOrdinal()
                  .range(['#e41a1c', '#377eb8', '#4daf4a', '#f48d0a', '#800aee'])
                  .domain(subgroups);
  
  // Stack the data (per subgroup)
  const stackedData = d3.stack()
                        .keys(subgroups)                      
                        .value((d, key) => +d[key])
                        .order(d3.stackOrderNone)
                        .offset(d3.stackOffsetNone)
                        (data);

  // Show the bars
  svg.append("g")
     .selectAll("g")
     // Enter in the stack data = loop key per key = group per group
     .data(stackedData)
     .join("g")
       .attr("fill", d => color(d.key))
       .selectAll("rect")
       // enter a second time = loop subgroup per subgroup to add all rectangles
       .data(d => d)
       .join("rect")
         .attr("x", d => x(d[0]))
         .attr("y", d => y(d.data.city))
         .attr("width", d => x(d[1]) - x(d[0]))
         .attr("height", y.bandwidth())
       .on("mouseover", (event, d) => {
          // Show the tooltip
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`City: ${d.data.city}<br> ${d.key}: ${d.data[d.key]}`);
       })
       .on("mousemove", (event) => {
          // Move the tooltip with the mouse pointer
          tooltip.style("left", event.pageX + 10 + "px")
                 .style("top", event.pageY + "px");
       })
       .on("mouseout", () => {
          // Hide the tooltip on mouseout
          tooltip.transition().duration(500).style("opacity", 0);
    });
})
