function updateRadarChart(selectedDataset, selectedYears) {

    // Append the svg object to the body of the page
    var svg = d3.select("#radarchart_1").append("svg")
        .attr("id", "radarchart_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Read the data
    Promise.all([
        d3.csv(selectedDataset)
    ]).then(function (datasets) {
    
        var dataAvg = datasets[0];

        var allMonths = Object.keys(dataAvg[0]).slice(2);
        var months = allMonths.slice(0, allMonths.length / 2);
        
        var minTemperature = d3.min(dataAvg, function (d) {
            return d3.min(months, function (month) {
                return +d[month];
            });
        });
        
        var maxTemperature = d3.max(dataAvg, function (d) {
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
        var data = [];
        selectedYears.forEach(function (selectedYear) {
            yearDataAvg = dataAvg.filter(function (d) { return +d.year === +selectedYear; }); 
            var point = {}
            months.forEach(m => point[m] = yearDataAvg[0][m]);
            data.push(point);
        });
        
        // Define the angles for each data point
        var radialScale = d3.scaleLinear()
            .domain([minTemperature, maxTemperature])
            .range([0, 200]);

        var ticks = [minTemperature, 0, maxTemperature];    

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
        
        // Create a function angle to coordinate
        function angleToCoordinate(angle, value){
            var x = Math.cos(angle) * radialScale(value);
            var y = Math.sin(angle) * radialScale(value);
            return {"x": width / 2 + x, "y": height / 2 - y};
        }

        var featureData = months.map((m, i) => {
            var angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
            return {
                "name": m,
                "angle": angle,
                "line_coord": angleToCoordinate(angle, maxTemperature),
                "label_coord": angleToCoordinate(angle, maxTemperature + 5)
            };
        });

        // Draw axis line
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
        
        // Draw axis label
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
        var colors = ["darkorange", "gray", "navy", "red", "yellow", "purple", "darkgreen", "lightgreen", "lightblue", "pink"];
        
        function getPathCoordinates(data_point){
            var coordinates = [];
            for (var i = 0; i < months.length; i++){
                var months_name = months[i];
                var angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
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
                    .attr("stroke-width", 5)
                    .attr("stroke", (_, i) => colors[i])
                    .attr("fill", "none")
                    .attr("stroke-opacity", 1)
                    //.attr("opacity", 0.1)
            ); 
    });
}

// Initial chart creation with the default dataset
updateRadarChart("data/section3/AVG/AlabamaAVG.csv", [2000]);

// Listen for changes in the dropdown selection
document.getElementById("dataset-dropdown").addEventListener("change", function () {
  const selectedDataset = "data/section3/AVG/" + this.value + "AVG.csv";

  // Select all checked checkboxes
  const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");

  // Extract values of checked checkboxes
  const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

  d3.select("#radarchart_svg").remove();
  updateRadarChart(selectedDataset, selectedYears);
});

// Add an event listener for changes in the year dropdown
document.getElementById("year-checkbox-form").addEventListener("change", function () {
    const selectedValue = document.getElementById("dataset-dropdown").value;

    // Select all checked checkboxes
    const checkedCheckboxes = document.querySelectorAll("#year-checkbox-form input:checked");
    
    // Extract values of checked checkboxes
    const selectedYears = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
    
    const selectedDataset = "data/section3/AVG/" + selectedValue + "AVG.csv";

    d3.select("#radarchart_svg").remove();
    updateRadarChart(selectedDataset, selectedYears);
});
