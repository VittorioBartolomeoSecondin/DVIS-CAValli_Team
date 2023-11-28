// set the dimensions and margins of the graph
var margin = { top: 60, right: 40, bottom: 70, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

const distinctColors = [
    "fa4d56", "29a329", "bbded6", "00539a", "005d5d", "fdc300",
    "fbd5d8", "8a525d", "009d9a", "ffa69e", "e5f6ff", "82cfff",
    "491d8b", "8a3ffc", "cc5e12", "005d5d", "e8daff", "a56eff",
    "fffca3", "ff8389", "ff1d47", "6929c4", "da1e28", "fffc87",
    "a2191f", "750e13", "003a6d", "e5f6ff", "bae6ff", "ffb3b8",
    "33b1ff", "9ef0f0", "3b5998", "a7f0ba", "fff42e", "454B1B",
    "007d79", "e95b54", "e5e1d5", "be95ff", "7be39f", "9d4edd",
    "bebebe", "f6f2ff", "4F7942", "fff96e", "a0f0bf", "80d6ff",
    "f3a683", "e4f1fe", "fff1f1", "1192e8", "0072c3", "990000",
    "d4bbff", "90a4ae", "3ddbd9", "50b777", "8c3d35", "fff74f"
];


// Create a tooltip
const tooltip = d3.select("#linechart_1")
    .append("section")
        .attr("id", "linechart_tooltip")
    .style("opacity", 0)
    .style("background-color", "lightgray")
    .style("border", "2px solid black")
        .attr("class", "tooltip");

var yearDataAvg, yearDataMax, yearDataMin;

function updateLineChart(selectedDataset_1,selectedDataset_2,selectedDataset_3, selectedYears) {

    // append the svg object to the body of the page
    var svg = d3.select("#linechart_1").append("svg")
        .attr("id", "linechart_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Read the data
    Promise.all([
        d3.csv(selectedDataset_1),
        d3.csv(selectedDataset_2),
        d3.csv(selectedDataset_3)
    ]).then(function (datasets) {
    
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
    
        var x = d3.scaleBand()
            .domain(months)
            .range([0, width])
            .padding(1);
        
        var y = d3.scaleLinear()
            .domain([minTemperature, maxTemperature])
            .range([height, 0]);
    
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));
    
        svg.append("g")
            .call(d3.axisLeft(y));
        
        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Temperatures in Celsius");

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

        selectedYears.forEach(function (selectedYear) {
            yearDataAvg = dataAvg.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMax = dataMax.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMin = dataMin.filter(function (d) { return +d.year === +selectedYear; });

            const colorForMax = getColorForYear(selectedYear);
            const color = chroma(colorForMax);
            
            // Desaturate the color
            const colorForAvg = color.desaturate(1).hex();
            const colorForMin = color.desaturate().hex();

            var lineMin = d3.line()
                .defined(function(d) { return !isNaN(d[1]); }) // Exclude NaN values from the line
                .x(function(d) { return x(d[0]); })
                .y(function(d) { return y(d[1]); });
            
            var filteredDataMin = months.map(function(month) {
                return [month, +yearDataMin[0][month]];
            }).filter(function(d) {
                return !isNaN(d[1]);
            });
            
            svg.append("path")
                .datum(filteredDataMin)
                .attr("fill", "none")
                .attr("stroke", colorForMin)
                .attr("stroke-width", 1.5)
                .attr("d", lineMin);

            var lineMax = d3.line()
                .defined(function(d) { return !isNaN(d[1]); }) // Exclude NaN values from the line
                .x(function(d) { return x(d[0]); })
                .y(function(d) { return y(d[1]); });
            
            var filteredDataMax = months.map(function(month) {
                return [month, +yearDataMax[0][month]];
            }).filter(function(d) {
                return !isNaN(d[1]);
            });
            
            svg.append("path")
                .datum(filteredDataMax)
                .attr("fill", "none")
                .attr("stroke", colorForMax)
                .attr("stroke-width", 1.5)
                .attr("d", lineMax);
        
            svg.selectAll(".circle-avg-" + selectedYear)
                .data(months.filter(function(month) {
                    return !isNaN(yearDataAvg[0][month]); // Filter out NaN values
                }))
                .enter().append("circle")
                .attr("class", "circle-avg-" + selectedYear)
                .attr("temperatureCelsius", function(d) { return yearDataAvg[0][d]; }) // Custom attribute for temperature
                .attr("temperatureFahrenheit", function(d) { return yearDataAvg[0][d + "F"]; })
                .attr("cx", function (d) { return x(d); })
                .attr("cy", function (d) { return y(yearDataAvg[0][d]); })
                .attr("r", 4)
                .style("fill", colorForAvg)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
        
            svg.selectAll(".circle-max-" + selectedYear)
                .data(months.filter(function(month) {
                    return !isNaN(yearDataMax[0][month]); // Filter out NaN values
                }))
                .enter().append("circle")
                .attr("class", "circle-max-" + selectedYear)
                .attr("temperatureCelsius", function(d) { return yearDataMax[0][d]; }) // Custom attribute for temperature
                .attr("temperatureFahrenheit", function(d) { return yearDataMax[0][d + "F"]; })
                .attr("cx", function (d) { return x(d); })
                .attr("cy", function (d) { return y(yearDataMax[0][d]); })           
                .attr("r", 4)
                .style("fill", colorForMax)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
        
            svg.selectAll(".circle-min-" + selectedYear)
                .data(months.filter(function(month) {
                    return !isNaN(yearDataMin[0][month]); // Filter out NaN values
                }))
                .enter().append("circle")
                .attr("class", "circle-min-" + selectedYear)
                .attr("temperatureCelsius", function(d) { return yearDataMin[0][d]; }) // Custom attribute for temperature
                .attr("temperatureFahrenheit", function(d) { return yearDataMin[0][d + "F"]; })
                .attr("cx", function (d) { return x(d); })
                .attr("cy", function (d) { return y(yearDataMin[0][d]); })       
                .attr("r", 4)
                .style("fill", colorForMin)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
        });
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

function getColorForYear(year) {
  // You can use modulo to cycle through the colors
  const index = year % 60;
  return distinctColors[index];
}

// Initial chart creation with the default dataset
updateLineChart("data/section3/AVG/AlabamaAVG.csv", "data/section3/MAX/AlabamaMAX.csv", "data/section3/MIN/AlabamaMIN.csv", [2000]);

// Listen for changes in the dropdown selection
document.getElementById("dataset-dropdown").addEventListener("change", function () {
  const selectedDataset_1 = "data/section3/AVG/" + this.value + "AVG.csv";
  const selectedDataset_2 = "data/section3/MAX/" + this.value + "MAX.csv";
  const selectedDataset_3 = "data/section3/MIN/" + this.value + "MIN.csv";

  // Select all checked checkboxes
  const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");

  // Extract values of checked checkboxes
  const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

  d3.select("#linechart_svg").remove();
  updateLineChart(selectedDataset_1, selectedDataset_2, selectedDataset_3, selectedYears);
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

    d3.select("#linechart_svg").remove();
    updateLineChart(selectedDataset_1, selectedDataset_2, selectedDataset_3, selectedYears);
});
