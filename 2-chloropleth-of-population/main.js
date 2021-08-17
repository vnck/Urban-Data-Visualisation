window.onload = () => {
    let width = 800, height = 400;

    let svg = d3.select("svg")
        .attr("viewBox", '0 0 ' + width + ' ' + height);
    
    let projection = d3.geoEquirectangular()
                        .center([103.8800700, 1.2806700])
                        .scale(67000);
    let geopath = d3.geoPath().projection(projection);
    
    svg
        .append('path')
        .datum({type: 'Sphere'})
        .attr("d", geopath)
        .attr('class', 'ocean');
        
    d3.json("sgmap.json").then(data => {
        svg.append("g")
            .attr("id", "subzones")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
                .attr("d",  d => geopath(d))
                .attr('class', 'map')
    }).then(() => {
        d3.csv('population2020.csv').then(data => {

            let colorScale = d3.scaleLinear()
                .domain([0,63960])
                .range(['mistyrose','mediumvioletred']);
    
            let getColor = (s) => {
                d = data.filter(x => x.Subzone.toUpperCase() === s)
                if (d.length == 0){
                    return 'black'
                } else {
                    return colorScale(Number(d[0].Population))
                }
            }
    
            let getPopulation = (s) => {
                d = data.filter(x => x.Subzone.toUpperCase() === s)
                if (d.length == 0){
                    return ', -'
                } else {
                    return ', ' + d[0].Population
                }
            }
    
            svg.select('g#subzones').selectAll('path')
                .style('fill', d => getColor(d.properties['Subzone Name']))
                .on("mouseover", (event, d) => {
                    d3.select(".tooltip")
                        .text(d.properties['Subzone Name'].toLowerCase() + getPopulation(d.properties['Subzone Name']))
                        .attr('class', 'tooltip')
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                    d3.select(event.currentTarget)
                        .attr('class','map selectedPath')
                })
                .on("mouseout", (event, d) => {
                    d3.select(".tooltip")
                    .text("");
                    d3.select(event.currentTarget)
                        .attr('class','map')
                });
    
            svg.append("g")
                .attr("class", "legendLinear")
                .attr("transform", "translate(20,20)");
        
            let legendLinear = d3.legendColor()
                .shapeWidth(40)
                .orient('horizontal')
                .labelFormat('d')
                .title('Population Size')
                .scale(colorScale);
        
            svg.select(".legendLinear")
                .attr('class','legend')
                .call(legendLinear);
        })
    })
}