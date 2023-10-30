// Parse the Data
d3.csv("section1_1/stacked_1.csv").then( function(data) {
  
  // append the svg object to the body of the page
  const svg = d3.select("#stacked_1")
                .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

  //// HERE WE SHOULD CREATE THE TOOLTIP  
 
  // List of subgroups = header of the csv files = scientific name of the trees (here)
  const subgroups = data.columns.slice(1);

  // List of groups = value of the first column cities (here) -> on Y axis
  const groups = data.map(d => (d.city));

  // Define maximum
  var max = d3.max(data, function(d) { return +d.count;} );

  // Add X axis
  const x = d3.scaleLinear()
              .domain([0, max + max/10])
              .range([0, width]);
  
  svg.append("g")
     //.call(d3.axisLeft(x))
       .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x))
     .selectAll("text")
       .attr("transform", "translate(-10,0)rotate(-45)")
     .style("text-anchor", "end");
  
  // Add Y axis
  const y = d3.scaleBand()
              .range([height, 0])
              .domain(groups)
              .padding([.1]);
  
  svg.append("g")
     //.attr("transform", `translate(0, ${height})`)
     //.call(d3.axisBottom(y).tickSizeOuter(0))
     .call(d3.axisLeft(y));

  // Color palette = one color per subgroup
  const color = d3.scaleOrdinal()
                  .range(['#e41a1c', '#377eb8', '#4daf4a', '#fcff33', '#c733ff'])
                  .domain(subgroups) 
  
  // Stack the data (per subgroup)
  const stackedData = d3.stack()
                        .keys(subgroups)
                        (data)

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
         .attr("x", d => x(d[1]))
         .attr("y", d => y(d.data.city))
         .attr("width", d => x(d[0]) - x(d[1]))
         .attr("height", y.bandwidth())         
})
