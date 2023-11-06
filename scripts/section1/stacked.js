function updateStackedChart(selectedValue) {
  console.log("updateChart");
  // Parse the Data
  d3.csv("data/section1/stacked_barcharts/stacked_top_others.csv").then( function(data) {
    
    // append the svg object to the body of the page
    const svg = d3.select("#stacked_1")
                  .append("svg")
                    .attr("id", "stacked_svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Create the tooltip element
    const tooltip = d3.select("#stacked_1")
                      .append("section")
                      .attr("id", "stacked_tooltip")
                      .style("opacity", 0)
                      .style("background-color", "lightgray")
                      .style("border", "2px solid black")
                        .attr("class", "tooltip"); 
   
    // List of subgroups = header of the csv files = scientific name of the trees (here)
    const subgroups = data.columns.slice(1);
  
    // List of groups = value of the first column = cities (here) -> on Y axis
    const groups = data.map(d => d.city);

    var filteredGroups = groups;
    var filteredData = data;
    if (selectedValue == "all") {
      filteredGroups = groups.slice(0);
      filteredData = data.slice(0);
    }
    else {
      filteredGroups = groups.slice(0, selectedValue);
      filteredData = data.slice(0, selectedValue);
    }

    // Define maximum
    var max = d3.max(filteredData, d => d3.sum(subgroups.map(key => +d[key])));
      
    // Add X axis
    const x = d3.scaleLinear()
                .domain([0, max + max/10])
                .range([0, width]);
    
    svg.append("g")
         .attr("class", "axis")
         .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(x))
       .selectAll("text")
         .attr("transform", "translate(-10,0)rotate(-45)")
       .style("text-anchor", "end");
    
    // Add Y axis
    const y = d3.scaleBand()
                .range([0, height])
                .domain(filteredGroups)
                .padding(.1);
    
    svg.append("g")
       .attr("class", "axis")
       .call(d3.axisLeft(y).tickSizeOuter(0));
  
    // Color palette = one color per subgroup
    const color = d3.scaleOrdinal()
                    .range(['#b51d14', '#ddb310', '#4053d3', '#fb49b0', '#00b25d']) //#cacaca for the 6th color
                    .domain(subgroups);
    
    // Stack the data (per subgroup)
    const stackedData = d3.stack()
                          .keys(subgroups)                      
                          .value((d, key) => +d[key])
                          .order(d3.stackOrderNone)
                          .offset(d3.stackOffsetNone)
                          (filteredData);
  
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
         .on("mouseover", function(event, d) {
  
         // Change color when hovering
         d3.select(this).style("fill", "lightgreen");
            
         // Show the tooltip
         tooltip.transition()
                .duration(200)
                .style("opacity", 1)
                .style("background-color", "lightgray")
                .style("border", "2px solid black");
          
         // Define the subgroup name and value to display them in the tooltip
         const subgroupName = d3.select(this.parentNode).datum().key;
         const subgroupValue = d.data[subgroupName];
          
         // Customize the tooltip content
         tooltip.html("Scientific name: " + subgroupName + "<br>" + "Count: " + subgroupValue)
                .style("left", (event.pageX + 40) + "px")
                .style("top", (event.pageY - 40) + "px");
           
         })
         .on("mousemove", function(event, d) {
          
         // Move the tooltip with the mouse pointer
         tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
           
         })
         .on("mouseout", function(event, d) {
  
         // Returning to original color when not hovering
         const subgroupColor = color(d3.select(this.parentNode).datum().key);
         d3.select(this).style("fill", subgroupColor);
         
         // Hide the tooltip
         tooltip.transition()
                .duration(500)
                .style("opacity", 0);
          
         });
  })
}
updateStackedChart("all"); // Load the chart with all cities initially

document.getElementById("city-dropdown").addEventListener("change", function () {
const selectedValue = this.value;
d3.select("#stacked_svg").remove();
d3.select("#stacked_tooltip").remove();
// Call a function to update your chart based on the selected value
updateStackedChart(selectedValue);
});
