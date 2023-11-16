function highlight_node_links(node,i){

  var remainingNodes=[],
      nextNodes=[];

  var stroke_opacity = 0;
  if( d3.select(this).attr("data-clicked") == "1" ){
    d3.select(this).attr("data-clicked","0");
    stroke_opacity = 0.2;
  }else{
    d3.select(this).attr("data-clicked","1");
    stroke_opacity = 0.5;
  }

  var traverse = [{
                    linkType : "sourceLinks",
                    nodeType : "target"
                  },{
                    linkType : "targetLinks",
                    nodeType : "source"
                  }];

  traverse.forEach(function(step){
    node[step.linkType].forEach(function(link) {
      remainingNodes.push(link[step.nodeType]);
      highlight_link(link.id, stroke_opacity);
    });

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node[step.linkType].forEach(function(link) {
          nextNodes.push(link[step.nodeType]);
          highlight_link(link.id, stroke_opacity);
        });
      });
      remainingNodes = nextNodes;
    }
  });
}

function highlight_link(id,opacity){
    d3.select("#link-"+id).style("stroke-opacity", opacity);
}

// set the dimensions and margins of the graph
var margin = {top: 20, right: 40, bottom: 70, left: 60},
    width = 1300 - margin.left - margin.right,
    height = 1100 - margin.top - margin.bottom;  

// format variables
var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory10);
  
// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .on("click", highlight_node_links)
	    .attr("transform", 
	          "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);
    //.nodeSort(null); // creates sankey nodes as ordered in the data 

var path = sankey.links();

// load the data
d3.csv("data/section2/sankey_alternative.csv").then(function(data) {

  //set up graph in same style as original example but empty
  sankeydata = {"nodes" : [], "links" : []};

  data.forEach(function (d) {
    sankeydata.nodes.push({ "name": d.source });
    sankeydata.nodes.push({ "name": d.target });
    sankeydata.links.push({ "source": d.source,
                       "target": d.target,
                       "value": +d.value });
   });

  // return only the distinct / unique nodes
  sankeydata.nodes = Array.from(
    d3.group(sankeydata.nodes, d => d.name),
	([value]) => (value)
  );

  // loop through each link replacing the text with its index from node
  sankeydata.links.forEach(function (d, i) {
    sankeydata.links[i].source = sankeydata.nodes
      .indexOf(sankeydata.links[i].source);
    sankeydata.links[i].target = sankeydata.nodes
      .indexOf(sankeydata.links[i].target);
  });

  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  sankeydata.nodes.forEach(function (d, i) {
    sankeydata.nodes[i] = { "name": d };
  });

  graph = sankey(sankeydata);

  // add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-width", function(d) { return d.width; });

  // add the link titles
  link.append("title")
        .text(function(d) {
    		    return d.source.name + " → " + 
                d.target.name + "\n" + d.value; });

  // add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node");

  // add the rectangles for the nodes
  node.append("rect")
      .attr("x", function(d) { return d.x0; })
      .attr("y", function(d) { return d.y0; })
      .style("stroke", "black")
      .style("stroke-width", 2)
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { 
	  return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { 
	  return d3.rgb(d.color).darker(2); });

  // add the title for the nodes
  node.append("title")
      .text(function(d) { 
          return d.name + "\n" + d.value; });

  // add in the text for the nodes
  node.append("text")
      .attr("x", function(d) { return d.x0 - 6; })
      .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text(function(d) { return d.name; })
      .style("fill", function(d) { return d.color; })
    .filter(function(d) { return d.x0 < width / 2; })
      .attr("x", function(d) { return d.x1 + 6; })
      .attr("text-anchor", "start");

 // Add hover effects to nodes
 node.on("mouseover", function(d) {
     d3.select(this)
         .attr("font-weight", "bold");
 })
 .on("mouseout", function() {
     d3.select(this)
         .attr("font-weight", "normal");
 });

// Add hover effects to links
link.on("mouseover", function() {
    d3.select(this)
        .attr("stroke-width", function(d) { console.log(d.width); if (d.width < 4) return 4; else return d.width; });
})
.on("mouseout", function() {
    d3.select(this)
        .attr("stroke-width", function(d) { return d.width; });
});

});
