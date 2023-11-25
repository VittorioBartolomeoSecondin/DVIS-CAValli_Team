// set the dimensions and margins of the graph
var margin = { top: 60, right: 40, bottom: 70, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Create a tooltip
const tooltip = d3.select("#radarchart_1")
    .append("section")
        .attr("id", "radarchart_tooltip")
    .style("opacity", 0)
    .style("background-color", "lightgray")
    .style("border", "2px solid black")
        .attr("class", "tooltip");

var yearDataAvg, yearDataMax, yearDataMin;

function updateRadarChart(selectedDataset_1,selectedDataset_2,selectedDataset_3, selectedYears) {

    // append the svg object to the body of the page
    var svg = d3.select("#radarchart_1").append("svg")
        .attr("id", "radarchart_svg")
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
        
        // Data
        var data = [
            { axis: months[0], value: dataMax[0] },
            { axis: months[1], value: dataMax[1] },
            { axis: months[2], value: dataMax[2] },
            { axis: months[3], value: dataMax[3] },
            { axis: months[4], value: dataMax[4] },
            { axis: months[5], value: dataMax[5] },
            { axis: months[6], value: dataMax[6] },
            { axis: months[7], value: dataMax[7] },
            { axis: months[8], value: dataMax[8] },
            { axis: months[9], value: dataMax[9] },
            { axis: months[10], value: dataMax[10] },
            { axis: months[11], value: dataMax[11] }
        ];
        
        // Define the number of data points
        var numPoints = months.length;
        
        // Define the radius of the radar chart
        var radius = Math.min(width, height) / 2;
        
        // Define the angles for each data point
        var angle = d3.scaleLinear()
            .domain([0, numPoints])
            .range([0, 2 * Math.PI]);
        
        // Create a radial scale for the values
        var scale = d3.scaleLinear()
            .domain([minTemperature, maxTemperature])  // Assuming values are between 0 and 1
            .range([0, radius]);
        
        // Draw the axes
        for (var i = 0; i < numPoints; i++) {
            var axis = angle(i);
            svg.append("line")
                .attr("x1", width / 2)
                .attr("y1", height / 2)
                .attr("x2", width / 2 + scale(1) * Math.cos(axis))
                .attr("y2", height / 2 + scale(1) * Math.sin(axis))
                .attr("stroke", "gray");
        }
        
        // Plot the data points and connect them with lines
        var line = d3.lineRadial()
            .angle(function (d, i) { return angle(i); })
            .radius(function (d) { return scale(d.value); });
        
        svg.append("path")
            .datum(data)
            .attr("d", line)
            .attr("stroke", "blue")
            .attr("fill", "blue");

        selectedYears.forEach(function (selectedYear) {
            yearDataAvg = dataAvg.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMax = dataMax.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMin = dataMin.filter(function (d) { return +d.year === +selectedYear; });   
        });
    });
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

    d3.select("#radarchart_svg").remove();
    updateRadarChart(selectedDataset_1, selectedDataset_2, selectedDataset_3, selectedYears);
});
