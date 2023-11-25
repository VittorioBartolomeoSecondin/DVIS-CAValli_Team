// set the dimensions and margins of the graph
var margin = { top: 60, right: 40, bottom: 70, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var yearDataAvg, yearDataMax, yearDataMin;

function updateRadarChart(selectedDataset_1,selectedDataset_2,selectedDataset_3, selectedYears) {

    // Append the svg object to the body of the page
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

        selectedYears.forEach(function (selectedYear) {
            yearDataAvg = dataAvg.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMax = dataMax.filter(function (d) { return +d.year === +selectedYear; });
            yearDataMin = dataMin.filter(function (d) { return +d.year === +selectedYear; });   
        });
        
        // Define the number of data points
        var numPoints = months.length;
        console.log(months); 
        console.log(numPoints); 
        
        // Data
        var data = [];
        //generate the data
        for (var i = 0; i < numPoints; i++){
            var point = {}
            months.forEach(m => point[m] = dataMax[i]);
            data.push(point);
        }
        console.log(data);    
        
        // Define the radius of the radar chart
        var radius = Math.min(width, height) / 2;
        
        // Define the angles for each data point
        var angle = d3.scaleLinear()
            .domain([0, numPoints])
            .range([0, 250]);

        // Define the angles for each data point
        var ticks = [-10, 0, 10, 20, 30];    

        // Add circles
        svg.selectAll("circle")
            .data(ticks)
            .join(
                enter => enter.append("circle")
                    .attr("cx", width / 2)
                    .attr("cy", height / 2)
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("r", d => radialScale(d))
            );

        // Add text label for ticks
        svg.selectAll(".ticklabel")
            .data(ticks)
            .join(
                enter => enter.append("text")
                    .attr("class", "ticklabel")
                    .attr("x", width / 2 + 5)
                    .attr("y", d => height / 2 - radialScale(d))
                    .text(d => d.toString())
            );
        
        // Create a radial scale for the values
        var scale = d3.scaleLinear()
            .domain([minTemperature, maxTemperature])
            .range([0, radius]);

        // Create a function angle to coordinate
        function angleToCoordinate(angle, value){
            var x = Math.cos(angle) * radialScale(value);
            var y = Math.sin(angle) * radialScale(value);
            return {"x": width / 2 + x, "y": height / 2 - y};
        }

        let featureData = months.map((m, i) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
            return {
                "name": m,
                "angle": angle,
                "line_coord": angleToCoordinate(angle, 10),
                "label_coord": angleToCoordinate(angle, 10.5)
            };
        });

        // draw axis line
        svg.selectAll("line")
            .data(featureData)
            .join(
                enter => enter.append("line")
                    .attr("x1", width / 2)
                    .attr("y1", height / 2)
                    .attr("x2", d => d.line_coord.x)
                    .attr("y2", d => d.line_coord.y)
                    .attr("stroke","black")
            );
        
        // draw axis label
        svg.selectAll(".axislabel")
            .data(featureData)
            .join(
                enter => enter.append("text")
                    .attr("x", d => d.label_coord.x)
                    .attr("y", d => d.label_coord.y)
                    .text(d => d.name)
            );

        // Plotting the data
        var line = d3.line()
            .x(d => d.x)
            .y(d => d.y);
        var colors = ["darkorange", "gray", "navy"];

        function getPathCoordinates(data_point){
            let coordinates = [];
            for (var i = 0; i < months.length; i++){
                let months_name = months[i];
                let angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
                coordinates.push(angleToCoordinate(angle, data_point[months_name]));
            }
            return coordinates;
        }

        // Draw the path element
        svg.selectAll("path")
            .data(data)
            .join(
                enter => enter.append("path")
                    .datum(d => getPathCoordinates(d))
                    .attr("d", line)
                    .attr("stroke-width", 3)
                    .attr("stroke", (_, i) => colors[i])
                    .attr("fill", (_, i) => colors[i])
                    .attr("stroke-opacity", 1)
                    .attr("opacity", 0.5)
            );
        
        /*
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
        */
    });
}

// Initial chart creation with the default dataset
updateRadarChart("data/section3/AVG/AlabamaAVG.csv", "data/section3/MAX/AlabamaMAX.csv", "data/section3/MIN/AlabamaMIN.csv", [2000]);

// Listen for changes in the dropdown selection
document.getElementById("dataset-dropdown").addEventListener("change", function () {
  const selectedDataset_1 = "data/section3/AVG/" + this.value + "AVG.csv";
  const selectedDataset_2 = "data/section3/MAX/" + this.value + "MAX.csv";
  const selectedDataset_3 = "data/section3/MIN/" + this.value + "MIN.csv";

  // Select all checked checkboxes
  const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");

  // Extract values of checked checkboxes
  const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

  d3.select("#radarchart_svg").remove();
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

    d3.select("#radarchart_svg").remove();
    updateRadarChart(selectedDataset_1, selectedDataset_2, selectedDataset_3, selectedYears);
});
