// set the dimensions and margins of the graph
/*var margin = {top: 20, right: 40, bottom: 70, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("data/AVG/AlabamaAVG.csv").then(function(data) {

    var yearData = data.filter(function (d) { return d.year === 1895; });

    // Extract the months from the header (excluding the first two columns: 'state' and 'year')
    var allMonths = Object.keys(data[0]).slice(2);
    var months = allMonths.slice(0, allMonths.length / 2); // Use only the first 12 months
    
    // set the domain of x-axis scale to be the months
    var x = d3.scaleBand()
        .domain(months)
        .range([0, width])
        .padding(1);

    // set the domain of y-axis scale to be the maximum temperature across all months
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            // Compute the maximum temperature across all months for each row
            return d3.max(months, function(month) {
                return +d[month]; // Convert the temperature from string to number
            });
        })])
        .range([height, 0]);

   // Draw the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Draw the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Create a line function
    var line = d3.line()
        //.x(function(month) { return x(month); })
        .x(function(d) { return x(d); })
        .y(function(d) { return y(data[0][d]); });

    // Draw the line
    svg.append("path")
        .datum(months)
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 1.5)
        .attr("d", line);


});
*/

// set the dimensions and margins of the graph
var margin = { top: 20, right: 40, bottom: 70, left: 40 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
Promise.all([
    d3.csv("data/AVG/AlabamaAVG.csv"),
    d3.csv("data/MAX/AlabamaMAX.csv"),
    d3.csv("data/MIN/AlabamaMIN.csv")
]).then(function (datasets) {

    var dataAvg = datasets[0];
    var dataMax = datasets[1];
    var dataMin = datasets[2];

    var yearDataAvg = dataAvg.filter(function (d) { return d.year === 1895; });
    var yearDataMax = dataMax.filter(function (d) { return d.year === 1895; });
    var yearDataMin = dataMin.filter(function (d) { return d.year === 1895; });

    var allMonths = Object.keys(dataAvg[0]).slice(2);
    var months = allMonths.slice(0, allMonths.length / 2);

    var minTemperature = d3.min(dataMin, function (d) {
        return d3.min(months, function (month) {
            return +d[month];
        });
    });
    
    // Find the maximum temperature across all months in dataMax
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

    var lineAvg = d3.line()
        .x(function (d) { return x(d); })
        .y(function (d) { return y(dataAvg[0][d]); });

    var lineMax = d3.line()
        .x(function (d) { return x(d); })
        .y(function (d) { return y(dataMax[0][d]); });

    var lineMin = d3.line()
        .x(function (d) { return x(d); })
        .y(function (d) { return y(dataMin[0][d]); });

    svg.append("path")
        .datum(months)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", lineAvg);

    svg.append("path")
        .datum(months)
        .attr("fill", "none")
        .attr("stroke", "red") // Adjust the color for max temperature
        .attr("stroke-width", 1.5)
        .attr("d", lineMax);

    svg.append("path")
        .datum(months)
        .attr("fill", "none")
        .attr("stroke", "blue") // Adjust the color for min temperature
        .attr("stroke-width", 1.5)
        .attr("d", lineMin);

});
