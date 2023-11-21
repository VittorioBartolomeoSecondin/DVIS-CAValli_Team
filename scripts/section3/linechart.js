// set the dimensions and margins of the graph
var margin = { top: 20, right: 40, bottom: 70, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

function updateLineChart(selectedDataset_1,selectedDataset_2,selectedDataset_3) {

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
    
        var yearDataAvg = dataAvg.filter(function (d) { return +d.year === 1926; });
        var yearDataMax = dataMax.filter(function (d) { return +d.year === 1926; });
        var yearDataMin = dataMin.filter(function (d) { return +d.year === 1926; });

    
        var allMonths = Object.keys(yearDataAvg[0]).slice(2);
        var months = allMonths.slice(0, allMonths.length / 2);
    
        var minTemperature = d3.min(yearDataMin, function (d) {
            return d3.min(months, function (month) {
                return +d[month];
            });
        });
        
        // Find the maximum temperature across all months in dataMax
        var maxTemperature = d3.max(yearDataMax, function (d) {
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
    
        // Add x-axis label
        svg.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.top + 20})`)
            .style("text-anchor", "middle")
            .text("Month");
        
        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Temperatures in Celsius");
    
        var lineMax = d3.line()
            .x(function (d) { return x(d); })
            .y(function (d) { return y(yearDataMax[0][d]); });
    
        var lineMin = d3.line()
            .x(function (d) { return x(d); })
            .y(function (d) { return y(yearDataMin[0][d]); });
    
        svg.append("path")
            .datum(months)
            .attr("fill", "none")
            .attr("stroke", "#0000FF")
            .attr("stroke-width", 1.5)
            .attr("d", lineMax);
    
        svg.append("path")
            .datum(months)
            .attr("fill", "none")
            .attr("stroke", "#00FFFF")
            .attr("stroke-width", 1.5)
            .attr("d", lineMin);
    
        svg.selectAll("circle")
            .data(months)
            .enter().append("circle")
            .attr("cx", function (d) { return x(d); })
            .attr("cy", function (d) { return y(yearDataAvg[0][d]); })
            .attr("r", 4)
            .style("fill", "#89CFF0");
    
        svg.selectAll(".circle-max")
            .data(months)
            .enter().append("circle")
            .attr("class", "circle-max")
            .attr("cx", function (d) { return x(d); })
            .attr("cy", function (d) { return y(yearDataMax[0][d]); })
            .attr("r", 4)
            .style("fill", "#0000FF");
    
        svg.selectAll(".circle-min")
            .data(months)
            .enter().append("circle")
            .attr("class", "circle-min")
            .attr("cx", function (d) { return x(d); })
            .attr("cy", function (d) { return y(yearDataMin[0][d]); })
            .attr("r", 4)
            .style("fill", "#00FFFF");
    
    })
}

// Initial chart creation with the default dataset
updateLineChart("data/section3/AVG/AlabamaAVG.csv","data/section3/MAX/AlabamaMAX.csv","data/section3/MIN/AlabamaMIN.csv");

// Listen for changes in the dropdown selection
document.getElementById("dataset-dropdown").addEventListener("change", function () {
  const selectedDataset_1 = "data/section3/AVG/" + this.value + "AVG.csv";
  const selectedDataset_2 = "data/section3/MAX/" + this.value + "MAX.csv";
  const selectedDataset_3 = "data/section3/MIN/" + this.value + "MIN.csv";
  d3.select("#linechart_svg").remove();
  updateLineChart(selectedDataset_1,selectedDataset_2,selectedDataset_3);
});