var margin2 = { top: 60, right: 160, bottom: 70, left: 100 }, 
    width2 = 460 - margin2.left - margin2.right,
    height2 = 450 - margin2.top - margin2.bottom;

function updateRadarChart(selectedDataset_1, selectedDataset_2, selectedDataset_3, selectedYears) {

    // Read the data
    Promise.all([
        d3.csv(selectedDataset_1),
        d3.csv(selectedDataset_2),
        d3.csv(selectedDataset_3)
    ]).then(function (datasets) {

        var external_svg = d3.select("#external").append("svg")
                             .attr("id", "external_svg")
                             .attr("width", width2 + 700 + margin2.left + margin2.right)
                             .attr("height", height2 - 400 + margin2.top + margin2.bottom)
                             .append("g")
                             .attr("transform", `translate(450, ${margin2.top})`);
    
        var dataAvg = datasets[0];
        var dataMax = datasets[1];
        var dataMin = datasets[2];

        var allMonths = Object.keys(dataAvg[0]).slice(2);
        var months = allMonths.slice(0, allMonths.length / 2);
        
        var minTemperature = d3.min(dataMin, function (d) {
            return d3.min(months, function (month) {
                return +d[month];
            });
        });
        
        var maxTemperature = d3.max(dataMax, function (d) {
            return d3.max(months, function (month) {
                return +d[month];
            });
        });
        
        var selectState = document.getElementById("dataset-dropdown");
        var stateName = selectState.options[selectState.selectedIndex].innerHTML;
        var dataAll = [dataMin, dataAvg, dataMax]
        var name = ["radarchart_1", "radarchart_2", "radarchart_3"]

        external_svg.append("text")
                    .attr("x", width2 / 2)
                    .attr("y", 0 - margin2.top / 2)
                    .attr("text-anchor", "middle")
                    .style("font-size", "20px")
                    .style("text-decoration", "underline")
                    .text(`Temperature Data for ${stateName} in ${selectedYears.join(', ')}`);
       
        for (let i = 0; i < 3; i++) { 
           
           // Append the svg object
           var svg = d3.select("#" + name[i]).append("svg")
                       .attr("id", name[i] + "_svg")
                       .attr("width", width2 + margin2.left + margin2.right)
                       .attr("height", height2 + margin2.top + margin2.bottom)
                       .append("g")
                       .attr("transform", `translate(${margin2.left},${margin2.top})`);
           
           // Define the angles for each data point
           var radialScale = d3.scaleLinear()
                               .domain([d3.min([0, minTemperature]), maxTemperature])
                               .range([0, 150]);
   
           var ticks = [minTemperature, 0, maxTemperature];    
   
           // Add circles
           svg.selectAll("circle")
              .data(ticks)
              .join(
                   enter => enter.append("circle")
                       .attr("cx", width2 / 2)
                       .attr("cy", height2 / 2)
                       .attr("fill", "none")
                       .attr("stroke", "black")
                       .attr("r", d => radialScale(d))
               );
   
           // Add text labels for ticks
           svg.selectAll(".ticklabel")
              .data(ticks)
              .join(
                   enter => enter.append("text")
                                 .attr("class", "ticklabel")
                                 .attr("x", width2 / 2 - 8)
                                 .attr("y", (d, i) => height2 / 2 + (i == 2 ?  -radialScale(ticks[i])-2 : radialScale(ticks[i])+8)) 
                                 .style("font-size", "10px")
                                 .text((d, i) => (i == 1 && ticks[i-1] > 0 ? "" : d.toString()))
               );
           
           // Create a function angle to coordinate
           function angleToCoordinate(angle, value){
               var x = Math.cos(angle) * radialScale(value);
               var y = Math.sin(angle) * radialScale(value);
               return {"x": width2 / 2 + x, "y": height2 / 2 - y};
           }
   
           var featureData = months.map((m, i) => {
               var angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
               return {
                   "name": m,
                   "angle": angle,
                   "line_coord": angleToCoordinate(angle, maxTemperature),
                   "label_coord": angleToCoordinate(angle, maxTemperature + 6)
               };
           });
   
           // Draw axis lines
           svg.selectAll("line")
              .data(featureData)
              .join(
                   enter => enter.append("line")
                                 .attr("x1", width2 / 2)
                                 .attr("y1", height2 / 2)
                                 .attr("x2", d => d.line_coord.x)
                                 .attr("y2", d => d.line_coord.y)
                                 .attr("stroke","gray")
                                 .attr("stroke-opacity", 0.3)
               );
           
           // Draw axis labels
           svg.selectAll(".axislabel")
               .data(featureData)
               .join(
                   enter => enter.append("text")
                                 .attr("x", d => d.label_coord.x - 13)
                                 .attr("y", d => d.label_coord.y + 5)
                                 .text(d => d.name)
               );
   
           // Plotting the data
           var line = d3.line()
                        .x(d => d.x)
                        .y(d => d.y);
           
          function getPathCoordinates(data_point){
               var coordinates = [];
               for (var i = 0; i < months.length; i++){
                   var months_name = months[i];
                   if (!isNaN(data_point[months_name])) {
                       var angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
                       coordinates.push(angleToCoordinate(angle, data_point[months_name]));
                   }
               }
               coordinates.push(angleToCoordinate((Math.PI / 2) + (2 * Math.PI), data_point["Jan"]));
               return coordinates;
            }

            var selectedColors = [];

            function handleLegendClick(clickedYear) {

                // Check if the clicked color is already selected
                const index = selectedColors.indexOf(clickedYear);
                
                // If selected, remove it; otherwise, add it
                if (index !== -1) {
                    selectedColors.splice(index, 1);
                } else {
                    selectedColors.push(clickedYear);
                }
                
                // Update the visualization based on the selected colors
                updateVisualization(selectedColors);
            
                // Update the legend styles
                updateLegendStyles();
            }
            
            function updateVisualization(selectedColors) {

                const allYears = selectedYears.map(String);
                
                allYears.forEach(year => {
                    const isClicked = selectedColors.includes(year);
                    const displayStyle = isClicked || selectedColors.length === 0 ? null : "none";
                    const circles = d3.selectAll(`.circle-avg-${year}, .circle-max-${year}, .circle-min-${year}`);
                    const maxLines = d3.selectAll(`.line-max-${year}`);
                    const minLines = d3.selectAll(`.line-min-${year}`);
                    const avgLines = d3.selectAll(`.line-avg-${year}`);
                    const legendText = d3.selectAll(`.legend-text-${year}`);

                    circles.style("display", displayStyle);
                    maxLines.style("display", displayStyle);
                    minLines.style("display", displayStyle);
                    avgLines.style("display", displayStyle);
                    legendText.style("font-weight", isClicked ? "bold" : "normal");
                    
                });
            }

            function updateLegendStyles() {
                const keys = Object.keys(used_colours);
                const isColorsEmpty = selectedColors.length === 0;
                const isColorsFull = selectedColors.length === selectedYears.length;
            
                keys.forEach(key => {
                    const color = used_colours[key];
                    const isClicked = selectedColors.includes(key);
                    
                    d3.selectAll(`.legend-rect-${key}`)
                      .style("fill", isClicked || isColorsEmpty ? color : "white")
                      .style("stroke", color);
            
                    d3.selectAll(`.legend-text-${key}`)
                      .style("font-weight", isClicked && !isColorsFull ? "bold" : "normal");
                });

                if (isColorsFull) selectedColors = [];
            }
               
           // Colours that are used
           var used_colours = {}
           
           var data = [];
           selectedYears.forEach(function (selectedYear) {
               yearData = dataAll[i].filter(function (d) { return +d.year === +selectedYear; }); 
               var point = {}
               months.forEach(m => point[m] = yearData[0][m]);
               data.push(point);      
           
               // Draw paths and circles with the same color for each data point
               svg.selectAll("g")
                  .data(data)
                  .enter()
                  .append("g")
                  .each(function(d, i) {
                       const color = getColorForYear(selectedYear);
                       used_colours[selectedYear] = color;
                       const pathData = getPathCoordinates(d);
               
                       // Draw path element
                       d3.select(this)
                         .append("path")
                         .attr("class", function() { return (i == 0 ? "line-min-" : i == 1 ? "line-avg-" : "line-max-") + selectedYear})
                         .attr("d", line(pathData))
                         .attr("stroke", color)
                         .attr("fill", "none")
                         .attr("stroke-opacity", 1);
               
                       // Draw circles for data points
                       d3.select(this)
                         .selectAll("circle")
                         .data(Object.values(d))
                         .enter()
                         .filter(dp => !isNaN(dp)) // Filter out NaN values
                         .append("circle")
                         .attr("class", function() { return (i == 0 ? "circle-min-" : i == 1 ? "circle-avg-" : "circle-max-") + selectedYear})
                         .attr("temperatureCelsius", function(d) { return d; }) // Custom attribute for temperature
                         .attr("temperatureFahrenheit", function(d, i) { return yearData[0][months[i] + "F"]; })
                         .attr("cx", function(dp, j) {
                               const angle = (Math.PI / 2) + (2 * Math.PI * j / months.length);
                               return width2 / 2 + Math.cos(angle) * radialScale(dp);
                          })
                         .attr("cy", function(dp, j) {
                               const angle = (Math.PI / 2) + (2 * Math.PI * j / months.length);
                               return height2 / 2 - Math.sin(angle) * radialScale(dp);
                          })
                         .attr("r", 4) // Adjust the radius of the circles as needed
                         .attr("fill", color) // Use the same color for circles
                         .on("mouseover", handleMouseOver)
                         .on("mouseout", handleMouseOut);
                   });
           });

           if (i == 2) {
               var radarchart_legend = svg.append("g")
                                          .attr("class", "legend")
                                          .attr("transform", "translate(20,20)");
       
               var linechart_legend = linechart_svg.append("g")
                                                   .attr("class", "legend")
                                                   .attr("transform", "translate(20,20)");
                           
               var keys = Object.keys(used_colours); // Get keys from the dictionary
               
               keys.forEach(function(key, j) {
                   var color = used_colours[key]; // Get color value for the key
               
                   radarchart_legend.append("rect")
                                    .attr("class", `legend-rect-${key}`)
                                    .attr("x", width2 + 90) // 100
                                    .attr("y", j * 20)
                                    .attr("width", 10)
                                    .attr("height", 10)
                                    .attr("fill", color)
                                    .on("click", () => handleLegendClick(key))
                                    .style("cursor", "pointer");
               
                   radarchart_legend.append("text")
                                    .attr("x", width2 + 105) // 85
                                    .attr("y", j * 20 + 9)
                                    .attr("class", "legend-text-" + key)
                                    .text(key) // Display the key associated with the color
                                    .style("font-size", "12px");
       
                  linechart_legend.append("rect")
                                  .attr("class", `legend-rect-${key}`)
                                  .attr("x", width)
                                  .attr("y", j * 20)
                                  .attr("width", 10)
                                  .attr("height", 10)
                                  .attr("fill", color)
                                  .on("click", () => handleLegendClick(key))
                                  .style("cursor", "pointer");
               
                   linechart_legend.append("text")
                                   .attr("x", width + 15)
                                   .attr("y", j * 20 + 9)
                                   .attr("class", "legend-text-" + key)
                                   .text(key) // Display the key associated with the color
                                   .style("font-size", "12px");
               });
           }
         };
     });
}

function handleMouseOver(event, d) {
    // Show the tooltip
    tooltip.transition()
           .duration(200)
           .style("opacity", 1);

    // Tooltip content
    const temperatureCelsius = d3.select(this).attr("temperatureCelsius") + "°C";
    const temperatureFahrenheit = d3.select(this).attr("temperatureFahrenheit") + "°F";
    tooltip.html(`Temperature: ${temperatureCelsius} / ${temperatureFahrenheit}`)
           .style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 20) + "px");
}

function handleMouseOut() {
    // Hide the tooltip
    tooltip.transition()
           .duration(500)
           .style("opacity", 0);
}

// Initial chart creation with the default dataset
updateRadarChart("data/section3/AVG/AlabamaAVG.csv", "data/section3/MAX/AlabamaMAX.csv", "data/section3/MIN/AlabamaMIN.csv", ['2000']);

// Listen for changes in the dropdown selection
document.getElementById("dataset-dropdown").addEventListener("change", function () {
  const selectedDataset_1 = "data/section3/AVG/" + this.value + "AVG.csv";
  const selectedDataset_2 = "data/section3/MAX/" + this.value + "MAX.csv";
  const selectedDataset_3 = "data/section3/MIN/" + this.value + "MIN.csv";

  // Select all checked checkboxes
  const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");

  // Extract values of checked checkboxes
  const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

  d3.select("#radarchart_1_svg").remove();
  d3.select("#radarchart_2_svg").remove();
  d3.select("#radarchart_3_svg").remove();
  d3.select("#external_svg").remove();
  updateRadarChart(selectedDataset_1, selectedDataset_2, selectedDataset_3, selectedYears);
});

// Add an event listener for changes in the year dropdown
document.getElementById("year-checkbox-form").addEventListener("change", function () {
    const selectedValue = document.getElementById("dataset-dropdown").value;

    // Select all checked checkboxes
    const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");
    
    // Extract values of checked checkboxes
    const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
    
    const selectedDataset_1 = "data/section3/AVG/" + selectedValue + "AVG.csv";
    const selectedDataset_2 = "data/section3/MAX/" + selectedValue + "MAX.csv";
    const selectedDataset_3 = "data/section3/MIN/" + selectedValue + "MIN.csv";

    d3.select("#radarchart_1_svg").remove();
    d3.select("#radarchart_2_svg").remove();
    d3.select("#radarchart_3_svg").remove();
    d3.select("#external_svg").remove();
    updateRadarChart(selectedDataset_1, selectedDataset_2, selectedDataset_3, selectedYears);
});
