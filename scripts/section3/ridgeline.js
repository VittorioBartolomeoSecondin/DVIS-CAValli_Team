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

        // Append a title to the SVG
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text(`Temperature Data for ${stateName} in ${selectedYears.join(', ')}`);

        // Add X axis
        var x = d3.scaleLinear()
            .domain([minTemperature - 2, maxTemperature])
            .range([0, width]);
        
        svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickValues([minTemperature - 2, minTemperature, 0, maxTemperature]).tickSize(-height) )
            .select(".domain").remove();
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 150)
            .attr("y", height + 40)
            .text("Temperatures in Celsius");
        
        // Create a Y scale for densities
        var y = d3.scaleLinear()
            .domain([0, 0.5])
            .range([height, 0]);
        
        // Create the Y axis for names
        var yName = d3.scaleBand()
            .domain(selectedYears)
            .range([0, height])
            .paddingInner(1)

        var midY = (yName.range()[0] + yName.range()[1]) / 2;
        
        svg.append("g")
            .call(d3.axisLeft(yName).tickSize(0))
            .select(".domain").remove()

        var allDensity = []
        selectedYears.forEach(function (selectedYear) { 
            
            yearDataMax = dataMax.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMin = dataMin.filter(function (d) { return +d.year === +selectedYear; });  

            arrayDataMax = []
            months.forEach(function (month) { arrayDataMax.push( +yearDataMax[0][month] ) });
            console.log(arrayDataMax);
            
            arrayDataMin = []
            months.forEach(function (month) { arrayDataMin.push( +yearDataMin[0][month] ) });
            
            // Compute kernel density estimation for each column:
            var kde = kernelDensityEstimator(kernelEpanechnikov(0.2), x.ticks(40));
            densityMax = kde(arrayDataMax);
            allDensity.push({key: selectedYear, density: densityMax});  
            console.log(allDensity);
        });

        // Append lines first
        svg.selectAll("lines")
            .data(allDensity)
            .join("line")
            .attr("transform", function(d) {
                var distanceFromMid = yName(d.key) - midY;
                var translation = midY + (distanceFromMid * 0.5);
                return `translate(0, ${translation - height})`;
            })
            .attr("x1", 0) // Start x-coordinate
            .attr("x2", width) // End x-coordinate
            .attr("y1", y(0)) // Start y-coordinate (baseline)
            .attr("y2", y(0)) // End y-coordinate (baseline)
            .attr("stroke", "#000")
            .attr("stroke-width", 1);
        
        // Add areas with modified translation
        svg.selectAll("areas")
          .data(allDensity)
          .join("path")
            .attr("transform", function(d) {
              var distanceFromMid = yName(d.key) - midY;
              var translation = midY + (distanceFromMid * 0.5);
              return `translate(0, ${translation - height})`;
            })
            .datum(function(d) { return d.density; })
            .attr("fill", "#69b3a2")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
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
function kernelDensityEstimator(kernel, X) {
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
}
