/*
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
        
        
        // Data
        var data = [
            { axis: "Jan", value: 6 },
            { axis: "Feb", value: 6 },
            { axis: "Mar", value: 7 },
            { axis: "Apr", value: 12 },
            { axis: "May", value: 25 },
            { axis: "Jun", value: -5 },
            { axis: "Jul", value: 15 },
            { axis: "Aug", value: 8 },
            { axis: "Sep", value: 4 },
            { axis: "Oct", value: 6 },
            { axis: "Nov", value: 7 },
            { axis: "Dec", value: 9 }
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
            .domain([minTemperature, maxTemperature])
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
*/
var RadarChart={defaultConfig:{containerClass:"radar-chart",w:600,h:600,factor:.95,factorLegend:1,levels:3,levelTick:!1,TickLength:10,maxValue:0,minValue:0,radians:2*Math.PI,color:d3.scale.category10(),axisLine:!0,axisText:!0,circles:!0,radius:5,open:!1,backgroundTooltipColor:"#555",backgroundTooltipOpacity:"0.7",tooltipColor:"white",axisJoin:function(a,b){return a.className||b},tooltipFormatValue:function(a){return a},tooltipFormatClass:function(a){return a},transitionDuration:300},chart:function(){function b(b,c){if(c===!1||void 0==c)b.classed("visible",0),b.select("rect").classed("visible",0);else{b.classed("visible",1);var d=b.node().parentNode,e=d3.mouse(d);b.select("text").classed("visible",1).style("fill",a.tooltipColor);var f=5,g=b.select("text").text(c).node().getBBox();b.select("rect").classed("visible",1).attr("x",0).attr("x",g.x-f).attr("y",g.y-f).attr("width",g.width+2*f).attr("height",g.height+2*f).attr("rx","5").attr("ry","5").style("fill",a.backgroundTooltipColor).style("opacity",a.backgroundTooltipOpacity),b.attr("transform","translate("+(e[0]+10)+","+(e[1]-10)+")")}}function c(c){c.each(function(c){function l(b,c,d,e){return d="undefined"!=typeof d?d:1,c*(1-d*e(b*a.radians/i))}function m(a,b,c){return l(a,b,c,Math.sin)}function n(a,b,c){return l(a,b,c,Math.cos)}var d=d3.select(this),e=d.selectAll("g.tooltip").data([c[0]]),f=e.enter().append("g").classed("tooltip",!0);f.append("rect").classed("tooltip",!0),f.append("text").classed("tooltip",!0),c=c.map(function(a){return a instanceof Array&&(a={axes:a}),a});var g=Math.max(a.maxValue,d3.max(c,function(a){return d3.max(a.axes,function(a){return a.value})}));g-=a.minValue;var h=c[0].axes.map(function(a,b){return{name:a.axis,xOffset:a.xOffset?a.xOffset:0,yOffset:a.yOffset?a.yOffset:0}}),i=h.length,j=a.factor*Math.min(a.w/2,a.h/2),k=Math.min(a.w/2,a.h/2);d.classed(a.containerClass,1);var o=d3.range(0,a.levels).map(function(b){return j*((b+1)/a.levels)}),p=d.selectAll("g.level-group").data(o);p.enter().append("g"),p.exit().remove(),p.attr("class",function(a,b){return"level-group level-group-"+b});var q=p.selectAll(".level").data(function(a){return d3.range(0,i).map(function(){return a})});if(q.enter().append("line"),q.exit().remove(),a.levelTick?q.attr("class","level").attr("x1",function(b,c){return j==b?m(c,b):m(c,b)+a.TickLength/2*Math.cos(c*a.radians/i)}).attr("y1",function(b,c){return j==b?n(c,b):n(c,b)-a.TickLength/2*Math.sin(c*a.radians/i)}).attr("x2",function(b,c){return j==b?m(c+1,b):m(c,b)-a.TickLength/2*Math.cos(c*a.radians/i)}).attr("y2",function(b,c){return j==b?n(c+1,b):n(c,b)+a.TickLength/2*Math.sin(c*a.radians/i)}).attr("transform",function(b){return"translate("+(a.w/2-b)+", "+(a.h/2-b)+")"}):q.attr("class","level").attr("x1",function(a,b){return m(b,a)}).attr("y1",function(a,b){return n(b,a)}).attr("x2",function(a,b){return m(b+1,a)}).attr("y2",function(a,b){return n(b+1,a)}).attr("transform",function(b){return"translate("+(a.w/2-b)+", "+(a.h/2-b)+")"}),a.axisLine||a.axisText){var r=d.selectAll(".axis").data(h),s=r.enter().append("g");a.axisLine&&s.append("line"),a.axisText&&s.append("text"),r.exit().remove(),r.attr("class","axis"),a.axisLine&&r.select("line").attr("x1",a.w/2).attr("y1",a.h/2).attr("x2",function(b,c){return a.w/2-k+m(c,k,a.factor)}).attr("y2",function(b,c){return a.h/2-k+n(c,k,a.factor)}),a.axisText&&r.select("text").attr("class",function(a,b){var c=m(b,.5);return"legend "+(.4>c?"left":c>.6?"right":"middle")}).attr("dy",function(a,b){var c=n(b,.5);return.1>c?"1em":c>.9?"0":"0.5em"}).text(function(a){return a.name}).attr("x",function(b,c){return b.xOffset+(a.w/2-k)+m(c,k,a.factorLegend)}).attr("y",function(b,c){return b.yOffset+(a.h/2-k)+n(c,k,a.factorLegend)})}c.forEach(function(b){b.axes.forEach(function(b,c){b.x=a.w/2-k+m(c,k,parseFloat(Math.max(b.value-a.minValue,0))/g*a.factor),b.y=a.h/2-k+n(c,k,parseFloat(Math.max(b.value-a.minValue,0))/g*a.factor)})});var t=d.selectAll(".area").data(c,a.axisJoin),u="polygon";if(a.open&&(u="polyline"),t.enter().append(u).classed({area:1,"d3-enter":1}).on("mouseover",function(c){d3.event.stopPropagation(),d.classed("focus",1),d3.select(this).classed("focused",1),b(e,a.tooltipFormatClass(c.className))}).on("mouseout",function(){d3.event.stopPropagation(),d.classed("focus",0),d3.select(this).classed("focused",0),b(e,!1)}),t.exit().classed("d3-exit",1).transition().duration(a.transitionDuration).remove(),t.each(function(a,b){var c={"d3-exit":0};c["radar-chart-serie"+b]=1,a.className&&(c[a.className]=1),d3.select(this).classed(c)}).style("stroke",function(b,c){return a.color(c)}).style("fill",function(b,c){return a.color(c)}).transition().duration(a.transitionDuration).attr("points",function(a){return a.axes.map(function(a){return[a.x,a.y].join(",")}).join(" ")}).each("start",function(){d3.select(this).classed("d3-enter",0)}),a.circles&&a.radius){var v=d.selectAll("g.circle-group").data(c,a.axisJoin);v.enter().append("g").classed({"circle-group":1,"d3-enter":1}),v.exit().classed("d3-exit",1).transition().duration(a.transitionDuration).remove(),v.each(function(a){var b={"d3-exit":0};a.className&&(b[a.className]=1),d3.select(this).classed(b)}).transition().duration(a.transitionDuration).each("start",function(){d3.select(this).classed("d3-enter",0)});var w=v.selectAll(".circle").data(function(a,b){return a.axes.map(function(a){return[a,b]})});w.enter().append("circle").classed({circle:1,"d3-enter":1}).on("mouseover",function(c){d3.event.stopPropagation(),b(e,a.tooltipFormatValue(c[0].value))}).on("mouseout",function(a){d3.event.stopPropagation(),b(e,!1),d.classed("focus",0)}),w.exit().classed("d3-exit",1).transition().duration(a.transitionDuration).remove(),w.each(function(a){var b={"d3-exit":0};b["radar-chart-serie"+a[1]]=1,d3.select(this).classed(b)}).style("fill",function(b){return a.color(b[1])}).transition().duration(a.transitionDuration).attr("r",a.radius).attr("cx",function(a){return a[0].x}).attr("cy",function(a){return a[0].y}).each("start",function(){d3.select(this).classed("d3-enter",0)});var x=t.node();x.parentNode.appendChild(x);var y=v.node();y.parentNode.appendChild(y);var z=e.node();z.parentNode.appendChild(z)}})}var a=Object.create(RadarChart.defaultConfig);return c.config=function(b){return arguments.length?(arguments.length>1?a[arguments[0]]=arguments[1]:d3.entries(b||{}).forEach(function(b){a[b.key]=b.value}),c):a},c},draw:function(a,b,c){var d=RadarChart.chart().config(c),e=d.config();d3.select(a).select("svg").remove(),d3.select(a).append("svg").attr("width",e.w).attr("height",e.h).datum(b).call(d)}};
