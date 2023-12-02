function updateRidgeLine(selectedDataset_1, selectedDataset_2, selectedYears) {

    // append the svg object to the body of the page
    var svg = d3.select("#ridgeline_1").append("svg")
        .attr("id", "ridgeline_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Read the data
    Promise.all([
        d3.csv(selectedDataset_1),
        d3.csv(selectedDataset_2)
    ]).then(function (datasets) {
   
        var dataMax = datasets[0];
        var dataMin = datasets[1];

        var allMonths = Object.keys(dataMax[0]).slice(2);
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

        var thresholds = d3.ticks(...d3.nice(...[minTemperature, maxTemperature], 2), 12);
        
        // Append a title to the SVG
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - 15 - margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text(`Temperature Data for ${stateName} in ${selectedYears.join(', ')}`);

        // Add X axis
        var x = d3.scaleLinear()
            .domain([d3.min(thresholds), d3.max(thresholds)])
            .range([0, width]);

        svg.append("g")
            .attr("class", "xAxis primary")
            .attr("transform", "translate(0," + height + ")")
            .attr("stroke", "green")
            .attr("stroke-opacity", 1)
            .call(d3.axisBottom(x).tickValues([minTemperature, maxTemperature]).tickSize(height).tickFormat(d3.format(".1f")))
            .selectAll(".tick line") // Selecting all tick lines
            .attr("stroke", "green"); // Changing the tick color to green

        // Removing the domain line separately after the axis is created
        svg.select(".xAxis.primary")
           .select(".domain").remove();
        
        svg.append("g")
            .attr("class", "xAxis secondary")
            .attr("transform", "translate(0," + height + ")")
            .attr("stroke", "gray")
            .attr("stroke-opacity", 0.3)
            .call(d3.axisBottom(x).tickValues(thresholds).tickSize(-height))
            .select(".domain").remove();
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2) // 150
            .attr("y", height + 40)
            .text("Temperatures in Celsius");
        
        // Create a Y scale for densities
        var y = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);
        
        // Create the Y axis for names
        var yName = d3.scaleBand()
            .domain(selectedYears)
            .range([0, height])
            .paddingInner(1)

        var midY = (yName.range()[0] + yName.range()[1]) / 2;
        
        /*var yAxis = svg.append("g")
                       .call(d3.axisLeft(yName).tickSize(5));
                       //.select(".domain").remove();

        yAxis.selectAll(".tick text")
             .attr("transform", function(d) {
                console.log(d);
                var distanceFromMid = yName(d.key) - midY;
                var translation = midY + (distanceFromMid * 0.5);
                return `translate(0, ${translation - height})`;
            });
             //.attr("dy", midY / 2);*/
        
        var allDensity = [];

        selectedYears.forEach(function (selectedYear) { 
            
            yearDataMax = dataMax.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMin = dataMin.filter(function (d) { return +d.year === +selectedYear; }); 
            
            colorForMaxYear = getColorForYear(selectedYear);

            arrayDataMax = []
            months.forEach(function (month) { arrayDataMax.push( +yearDataMax[0][month] ) });
            
            arrayDataMin = []
            months.forEach(function (month) { arrayDataMin.push( +yearDataMin[0][month] ) });
            
            // Compute kernel density estimation for each column:
            //var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));
            //densityMax = kde(arrayDataMax);
            densityMax = kernelDensityEstimator(kernelEpanechnikov(1), thresholds, arrayDataMax)
            densityMin = kernelDensityEstimator(kernelEpanechnikov(1), thresholds, arrayDataMin)            
            allDensity.push({key: selectedYear, 
                             densityMax: densityMax, densityMin: densityMin, 
                             colorMax: colorForMaxYear, colorMin: chroma(colorForMaxYear).desaturate(1).hex()});  
        });

        //console.log(allDensity);
        
        /*var yAxis = svg.append("g")
                       .call(d3.axisLeft(yName).tickSize(5));*/
        
        /*yAxis.selectAll(".tick text")
             .data(allDensity)
             .attr("dy", function(d) {
                //console.log(d);
                var distanceFromMid = yName(d.key) - midY;
                var translation = midY + (distanceFromMid * 0.5);
                return translation - height;
            });*/

        svg.selectAll("lines")
            .data(allDensity)
            .join("g") // Create a group for each data point
            .attr("transform", function(d) {
                var distanceFromMid = yName(d.key) - midY;
                var translation = midY + (distanceFromMid * 0.8);
                return `translate(0, ${translation - height})`;
            })
            .call(g => {
                g.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(0))
                    .attr("y2", y(0))
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1);
        
                // Append text labels to the left of each line
                g.append("text")
                    .attr("x", -5) // Adjust the x position for the text
                    .attr("y", y(0)) // Align text vertically with the line
                    .attr("dy", "0.35em") // Fine-tune vertical alignment
                    .attr("text-anchor", "end") // Align text to the end of the label
                    .text(function(d) {
                        // Provide the label content here based on your data
                        return d.key; 
                    });
            });
        /*
        // Append lines first
        svg.selectAll("lines")
            .data(allDensity)
            .join("line")
            .attr("transform", function(d) {
                //console.log(d);
                var distanceFromMid = yName(d.key) - midY;
                var translation = midY + (distanceFromMid * 0.5);
                return `translate(0, ${translation - height})`;
            })
            .attr("x1", 0) // Start x-coordinate
            .attr("x2", width) // End x-coordinate
            .attr("y1", y(0)) // Start y-coordinate (baseline)
            .attr("y2", y(0)) // End y-coordinate (baseline)
            .attr("stroke", "#000")
            .attr("stroke-width", 1);*/
        
        // Add areas with modified translation
        svg.selectAll("areas")
          .data(allDensity)
          .join("path")
            .attr("transform", function(d) {
              var distanceFromMid = yName(d.key) - midY;
              var translation = midY + (distanceFromMid * 0.8);
              return `translate(0, ${translation - height})`;
            })
            .attr("fill", function(d) { console.log(d); return `${d.colorMax}80`; })
            .datum(function(d) { console.log(d); return d.densityMax; })
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
              .curve(d3.curveBasis)
              .x(function(d) { return x(d[0]); })
              .y(function(d) { return y(d[1]); })
            );

        svg.selectAll("areas")
          .data(allDensity)
          .join("path")
            .attr("transform", function(d) {
              var distanceFromMid = yName(d.key) - midY;
              var translation = midY + (distanceFromMid * 0.8);
              return `translate(0, ${translation - height})`;
            })
            .attr("fill", function(d) { console.log(d); return `${d.colorMin}80`; })
            .datum(function(d) { console.log(d); return d.densityMin; })
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
              .curve(d3.curveBasis)
              .x(function(d) { return x(d[0]); })
              .y(function(d) { return y(d[1]); })
            );
    });
}

/*function handleMouseOver(event, d) {
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
}*/

// Initial chart creation with the default dataset
updateRidgeLine("data/section3/MAX/AlabamaMAX.csv", "data/section3/MIN/AlabamaMIN.csv", [2000]);

// Listen for changes in the dropdown selection
document.getElementById("dataset-dropdown").addEventListener("change", function () {
    
  const selectedDataset_1 = "data/section3/MAX/" + this.value + "MAX.csv";
  const selectedDataset_2 = "data/section3/MIN/" + this.value + "MIN.csv";

  // Select all checked checkboxes
  const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");

  // Extract values of checked checkboxes
  const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

  d3.select("#ridgeline_svg").remove();
  updateRidgeLine(selectedDataset_1, selectedDataset_2, selectedYears);
});

// Add an event listener for changes in the year dropdown
document.getElementById("year-checkbox-form").addEventListener("change", function () {
    const selectedValue = document.getElementById("dataset-dropdown").value;

    // Select all checked checkboxes
    const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");
    
    // Extract values of checked checkboxes
    const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
    
    const selectedDataset_1 = "data/section3/MAX/" + selectedValue + "MAX.csv";
    const selectedDataset_2 = "data/section3/MIN/" + selectedValue + "MIN.csv";

    d3.select("#ridgeline_svg").remove();
    updateRidgeLine(selectedDataset_1, selectedDataset_2, selectedYears);
});

// This is what I need to compute kernel density estimation
/*function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}

function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}*/


function kernelDensityEstimator(kernel, thresholds, data) {
  return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
}
function kernelEpanechnikov(bandwidth) {
  return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
}


// var kde = kernelDensityEstimator(normalDistribution(x, , 2.25), x.ticks(40));

// function normalDistribution(x, mean, variance) {
//   const coefficient = 1 / (Math.sqrt(2 * Math.PI * variance));
//   const exponent = -(Math.pow(x - mean, 2) / (2 * variance));
//   return coefficient * Math.exp(exponent);
// }
