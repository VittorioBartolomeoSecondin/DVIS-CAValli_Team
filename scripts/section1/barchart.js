// Set the dimensions and margins of the graph
const margin = {top: 20, right: 40, bottom: 70, left: 240}, width = 1000 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;
const margin2 = {top: 20, right: 40, bottom: 70, left: 160}, width2 = 450 - margin.left - margin.right, height2 = 400 - margin.top - margin.bottom;

// Parse the Data
function updateBarChart(selectedDataset) {
  d3.csv(selectedDataset).then( function(data) {
      
      // Append the svg object to the body of the page
      const svg = d3.select("#barchart_1")
                    .append("svg")
                      .attr("id", "barchart_svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                      .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      // Create the tooltip element
      const tooltip = d3.select("#barchart_1")
                        .append("section")
                          .attr("id", "barchart_tooltip")
                        .style("opacity", 0)
                        .style("background-color", "lightgray")
                        .style("border", "2px solid black")
                          .attr("class", "tooltip");
    
      // Define maximum
      var max = d3.max(data, function(d) {return +d.count;});
    
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
                  .range([height, 0])
                  .domain(data.map(d => d.scientific_name))
                  .padding(.1);
  
      svg.append("g")
         .attr("class", "axis")
         .call(d3.axisLeft(y));
  
      // Show the bars
      svg.selectAll("myRect")
         .data(data)
         .enter()
         .append("rect")
           .attr("x", x(0))
           .attr("y", d => y(d.scientific_name))
           .attr("width", 0)
           .attr("height", y.bandwidth())
           .attr("fill", "steelblue")
         .on("mouseover", function (event, d) {

         // Change color when hovering
         d3.select(this).style("fill", "lightgreen");

         // Show the tooltip
         tooltip.transition()
                .duration(200)
                .style("opacity", 1)
                .style("background-color", "lightgray")
                .style("border", "2px solid black");
         
         // Customize the tooltip content
         tooltip.html(`Common name: ${d.common_name}<br>Count: ${d.count}<br>Average height: ${d.avg_height} meters`)
                .style("left", (event.pageX + 40) + "px")
                .style("top", (event.pageY - 40) + "px");

         })
         .on("mousemove", function (event, d) {

         // Move the tooltip with the mouse pointer
         tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");

         })
         .on("mouseout", function (d) {

         // Returning to original color when not hovering
         d3.select(this).style("fill", "steelblue");

         // Hide the tooltip
         tooltip.transition()
                .duration(500)
                .style("opacity", 0);           
         });  

      // Animation
      svg.selectAll("rect")
          .transition()
          .duration(1000)
            .attr("x", x(0))
            .attr("width", d => x(d.count))
          .delay((d, i) => i * 100);
  })
}

// Initial chart creation with the default dataset
updateBarChart("data/section1/barchart/total.csv");

// Listen for changes in the dropdown selection
document.getElementById("dataset-dropdown").addEventListener("change", function () {
  const selectedDataset = this.value;
  d3.select("#barchart_svg").remove();
  d3.select("#barchart_tooltip").remove();
  updateBarChart(selectedDataset);
});
