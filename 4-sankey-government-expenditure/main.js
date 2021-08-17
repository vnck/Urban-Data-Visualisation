window.onload = () => {
    loadDiagram();
};

const margin = {top: 10, right: 10, bottom: 10, left: 10};
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


let loadDiagram = () => {
    
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    d3.csv("expenditure_2021.csv").then(links => {
        links.forEach(d => {
            d.value = parseInt(d.value);
        });
        var nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), name => ({name}));

        var svg = d3.select('#diagram')
            .append('svg')
                .attr('viewBox', [0, 0, width, height]);

        const sankey = d3.sankey()
            .nodeId(d => d.name)
            .nodeAlign(d3.sankeyJustify)
            .nodeWidth(16)
            .nodePadding(8)
            .extent([[0, 0], [width, height]]);

        var graph = sankey({
            nodes: nodes.map(d => Object.assign({}, d)),
            links: links.map(d => Object.assign({}, d))
        });
        
        svg.append('g')
            .selectAll("rect")
            .data(graph.nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => color(d.name))
            .append("title")
            .text(d => `${d.name}\n$${d.value}`);

        svg.append("g")
            .attr("fill", "none")
            .attr("opacity", 0.5)
            .selectAll("g")
            .data(graph.links)
            .join("path")
                .attr("d", d3.sankeyLinkHorizontal())
                .attr("stroke", d => color(d.source.name))
                .attr("stroke-width", d => d.width)
                .style("mix-blend-mode", "multiply")
            .append("title")
                .text(d => `${d.source.name} -> ${d.target.name}\n$${d.value.toLocaleString()}`);

        svg.append("g")
            .selectAll("text")
            .data(graph.nodes)
            .join("text")
                .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
                .attr("y", d => (d.y1 + d.y0) / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
                .text(d => d.name)
            .append("tspan")
                .attr("fill-opacity", 0.7)
                .text(d => `$${d.value}`);
    }
)}