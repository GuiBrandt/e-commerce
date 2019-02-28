var nodes = $categories;
var links = $category_links;

var width = 1600, height = 1600;

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(500))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

var svg = d3.select("#$graphdiv").append("svg")
        .attr("width", width)
        .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

var link = svg.append("g")
  .attr("stroke", "#999")
  .attr("stroke-opacity", 0.3)
  .selectAll("line")
  .data(links)
  .join("line")
  .attr("distance", 200);

weight = d => d.weight;

link.attr("stroke-width", d => Math.sqrt(d.value))

drag = simulation => {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

fade = (opacity) => {
    return d => {
      node.style('stroke-opacity', function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });
        
      link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : 0.1));
    };
}

var linkmap = {};
links.forEach(d => {
    linkmap[`$${d.source.index},$${d.target.index}`] = 1;
});

isConnected = (a, b) => {
    return linkmap[`$${a.index},$${b.index}`] || linkmap[`$${b.index},$${a.index}`] || a.index === b.index;
}

color = () => {
  var heatmap = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([1, 100])

  return d => heatmap(weight(d));
}

var node = svg.append("g")
  .attr("stroke-width", 1.5)
  .attr("stroke", "#fff")
  .selectAll("circle")
  .data(nodes)
  .join("circle")
  .attr("fill", color())
  .call(drag(simulation));
  
simulation.on("tick", () => {
link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => 5 + Math.pow(weight(d), 0.75))
    .on('mouseover.tooltip', function(d) {
        tooltip.transition()
            .duration(300)
            .style("opacity", 1);
        tooltip.html(d.id)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 10) + "px");
        })
        .on('mouseover.fade', fade(0.1))
        .on('mouseout.fade', fade(1))
        .on("mouseout.tooltip", function() {
          tooltip.transition()
            .duration(100)
            .style("opacity", 0);
          link.style('stroke-opacity', 0.3);
        })
        .on("mousemove", function() {
          tooltip.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 10) + "px");
    })
})