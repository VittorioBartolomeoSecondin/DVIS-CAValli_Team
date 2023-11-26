// // set the dimensions and margins of the graph
// const margin = {top: 60, right: 30, bottom: 20, left:110},
//     width = 460 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;

// var yearDataMax, yearDataMin;

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

        // Compute the mean of each group
        maxMeans = []
        minMeans = []
        selectedYears.forEach(function (selectedYear) {
            
            yearDataMax = dataMax.filter(function (d) { return +d.year === +selectedYear; });
            console.log(yearDataMax)
            yearDataMin = dataMin.filter(function (d) { return +d.year === +selectedYear; });
            console.log(yearDataMin)
            maxMean = d3.mean(yearDataMax[3:14]);
            console.log(maxMean);
            minMean = d3.mean(yearDataMin[3:14]);
            console.log(minMean);
            maxMeans.push(maxMean);
            minMeans.push(minMean);
            });
        
        // Create a color scale using the means
        const myColor = d3.scaleSequential()
            .domain([minTemperature, maxTemperature])
            .interpolator(d3.interpolateViridis);  

        // Add X axis
        const x = d3.scaleLinear()
            .domain([minTemperature, maxTemperature])
            .range([0, width]);
        
        svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickValues([0,25, 50, 75, 100]).tickSize(-height) )
            .select(".domain").remove();
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .text("Temperatures in Celsius");
        
        // Create a Y scale for densities
        const y = d3.scaleLinear()
            .domain([0, 0.25])
            .range([height, 0]);
        
        // Create the Y axis for names
        const yName = d3.scaleBand()
            .domain(selectedYears)
            .range([0, height])
            .paddingInner(1)
        
        svg.append("g")
            .call(d3.axisLeft(yName).tickSize(0))
            .select(".domain").remove()
        
        // Compute kernel density estimation for each column:
        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
        const allDensity = []
        for (i = 0; i < selectedYears.length; i++) {
            key = selectedYears[i]
            density = kde( data.map(function(d){  return d[key]; }) )
            allDensity.push({key: key, density: density})
        }
        
        // Add areas
        svg.selectAll("areas")
            .data(allDensity)
            .join("path")
              .attr("transform", function(d){return(`translate(0, ${(yName(d.key)-height)})` )})
              .attr("fill", function(d){
                grp = d.key ;
                index = selectedYears.indexOf(grp)
                value = maxMeans[index]
                return myColor(value)
              })
              .datum(function(d){return(d.density)})
              .attr("opacity", 0.7)
              .attr("stroke", "#000")
              .attr("stroke-width", 0.1)
              .attr("d",  d3.line()
                  .curve(d3.curveBasis)
                  .x(function(d) { return x(d[0]); })
                  .y(function(d) { return y(d[1]); })
              )        
        });
}

function handleMouseOver(event, d) {
    // Show the tooltip
    tooltip.transition()
        .duration(200)
        .style("opacity", 1);

    // Tooltip content
    //const temperatureCelsius = getTemperatureCelsius(this);
    const temperatureCelsius = d3.select(this).attr("temperatureCelsius") + "°C";
    const temperatureFahrenheit = d3.select(this).attr("temperatureFahrenheit") + "°F";
    /*const data = d3.select(this).data()[0];
    const temperatureCelsius = data.value + "°C";
    const temperatureFahrenheit = data.valueF + "°F";*/
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
