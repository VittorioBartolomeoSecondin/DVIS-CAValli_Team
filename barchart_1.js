// set the dimensions and margins of the graph
const margin = {top: 40, right: 40, bottom: 50, left: 120}, width = 700 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#barchart_1")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left}, ${margin.top})`);

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
       .call(d3.axisLeft(y))

    // Bars
    svg.selectAll("myRect")
       .enter()
       .append('rect')
       .attr('class', 'bar')
       .on('mouseover', (d) => {
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`Common name: <span>${d.common_name}</span><br> 
                        Average height: <span>${d.avg_height}</span>`)
                   .style('left', `${d3.event.layerX}px`)
                   .style('top', `${(d3.event.layerY - 28)}px`);
       })
       .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0))
       .data(data)
       .join("rect")
       .attr("x", x(0) )
       .attr("y", d => y(d.scientific_name))
       .attr("width", d => x(d.count))
       .attr("height", y.bandwidth())
       .attr("fill", "steelblue")

})

const tooltip = d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);

svg.selectAll('.bar').data(letterFrequencies)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', d => xScale(d.letter))
  .attr('width', xScale.bandwidth())
  .attr('y', d => yScale(d.frequency))
  .attr('height', d => height - yScale(d.frequency))
  .on('mouseover', (d) => {
    tooltip.transition().duration(200).style('opacity', 0.9);
    tooltip.html(`Common name: <span>${d.common_name}</span><br> 
                  Average height: <span>${d.avg_height}</span>`)
           .style('left', `${d3.event.layerX}px`)
           .style('top', `${(d3.event.layerY - 28)}px`);
  })
  .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));