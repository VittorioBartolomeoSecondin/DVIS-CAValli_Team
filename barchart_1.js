// set the dimensions and margins of the graph
const margin = {top: 40, right: 40, bottom: 50, left: 120}, width = 700 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#barchart_1")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create the tooltip element
const tooltip = d3.select("#barchart_1")
                  .append("div")
                  .style("opacity", 0)
                  .attr("class", "tooltip");

// Parse the Data
d3.csv("barchart_1.csv").then( function(data) {
    
    // Add X axis
    const x = d3.scaleLinear()
                .domain([0, 250000])
                .range([ 0, width]);
  
    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(x))
       .selectAll("text")
       .attr("transform", "translate(-10,0)rotate(-45)")
       .style("text-anchor", "end");
    
    // Y axis
    const y = d3.scaleBand()
                .range([ height, 0 ])
                .domain(data.map(d => d.scientific_name))
                .padding(.1);

    svg.append("g")
       .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("myRect")
       .data(data)
       .enter()
       .append("rect")
       .attr("x", x(0) )
       .attr("y", d => y(d.scientific_name))
       .attr("width", d => x(d.count))
       .attr("height", y.bandwidth())
       .attr("fill", "steelblue")
       .on("mouseover", function (event, d) {
         
         // Show the tooltip
         tooltip.transition()
                .duration(200)
                .style("opacity", 1);
     
         // Customize the tooltip content
         tooltip.html(`Common name: ${d.common_name}<br>Count: ${d.count}<br>Average height: ${d.avg_height} m`)
                .style("left",(event.pageX + 40) + "px")
                .style("top", (event.pageY - 40) + "px");
         
       })
      
       .on("mouseout", function (d) {
         
         // Hide the tooltip
         tooltip.transition()
           .duration(500)
           .style("opacity", 0);
         
       });

  
  // Animation
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y(d.Value))
        .attr("height", d => height - y(d.Value))
        .delay((d,i) => {console.log(i); return i*100})

})
