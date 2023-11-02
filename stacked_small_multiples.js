const datasets = ['section1_1/small_multiple1.csv', 'section1_1/small_multiple2.csv', 'section1_1/small_multiple3.csv'];
const colours = ['#e41a1c', '#377eb8', '#4daf4a'];

function keep_interesting_cities(selectedValue, data) {
    if (selectedValue == "all")
        return data.slice(0);
    else
        return data.slice(0, selectedValue);
}

function updateStackedSMChart(selectedValue) {
    /*let max_values = [];
    
    for (let i = 0; i < datasets.length; i++) {
        d3.csv(datasets[i]).then( function(data) {
            let filteredData = data;
            if (selectedValue == "all")
                filteredData = data.slice(0);
            else
                filteredData = data.slice(0, selectedValue);
            
            max_values.push(d3.max(filteredData, function(d) {return +d.count;}));
        });
    }

    console.log(max_values);
    const max = Math.max(...max_values);
    console.log(max);*/

    let max_values = [];
    var max = 0;

    // Create an array of promises for loading and processing data
    const promises = datasets.map((dataset) => {
      return d3.csv(dataset)
        .then(function (data) {
          let filteredData = keep_interesting_cities(selectedValue, data);
          max_values.push(d3.max(filteredData, function (d) { return +d.count; }));
        });
    });
    
    // Wait for all promises to resolve
    Promise.all(promises)
      .then(() => {
        // All data has been loaded and max_values is populated
        max = Math.max(...max_values);
        console.log(max);
          
        // Now you can continue with your chart creation or other actions
        for (let i = 0; i < datasets.length; i++) {

              // Parse the Data
              d3.csv(datasets[i]).then( function(data) {
                 let filteredData = keep_interesting_cities(selectedValue, data);
                  // Append the svg object to the body of the page
                  const svg = d3.select("#" + datasets[i].substring(11, 26))
                                .append("svg")
                                .attr("id", datasets[i].substring(11, 26) + "_svg")
                                  .attr("width", width + margin.left + margin.right)
                                  .attr("height", height + margin.top + margin.bottom)
                                .append("g")
                                  .attr("transform", `translate(${margin.left}, ${margin.top})`);
            
                  // Create the tooltip element
                  const tooltip = d3.select("#" + datasets[i].substring(11, 26))
                                    .append("section")
                                    .attr("id", datasets[i].substring(11, 26) + "_tooltip")
                                    .style("opacity", 0)
                                    .style("background-color", "lightgray")
                                    .style("border", "2px solid black")
                                      .attr("class", "tooltip");
        
                 
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
                              .domain(filteredData.map(d => d.city))
                              .padding(.1);
              
                  svg.append("g")
                     .call(d3.axisLeft(y));
              
                  // Show the bars
                  svg.selectAll("myRect")
                     .data(filteredData)
                     .enter()
                     .append("rect")
                       .attr("x", x(0))
                       .attr("y", d => y(d.city))
                       //.attr("width", d => x(d.count))
                       .attr("width", 0)
                       .attr("height", y.bandwidth())
                       .attr("fill", colours[i])
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
                     tooltip.html(`Count: ${d.count}`)
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
                     d3.select(this).style("fill", colours[i]);
            
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
      })
      .catch((error) => {
        console.error(error);
      });
}
updateStackedSMChart("all"); // Load the chart with all cities initially
document.getElementById("city-dropdown").addEventListener("change", function () {
  const selectedValue = this.value;
  d3.select("#small_multiple1_svg").remove();
  d3.select("#small_multiple2_svg").remove();
  d3.select("#small_multiple3_svg").remove();
  d3.select("#small_multiple1_tooltip").remove();
  d3.select("#small_multiple2_tooltip").remove();
  d3.select("#small_multiple3_tooltip").remove();
  // Call a function to update your chart based on the selected value
  updateStackedSMChart(selectedValue);
});
