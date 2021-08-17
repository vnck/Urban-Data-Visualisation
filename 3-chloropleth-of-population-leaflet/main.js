window.onload = () => {
  loadMap();
};

let loadMap = () => {

  let tiles = new L.tileLayer('https://maps-{s}.onemap.sg/v3/Default/{z}/{x}/{y}.png', {
    detectRetina: true,
    maxZoom: 18,
    minZoom: 11,
    //Do not remove this attribution
    attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;">' + 'New OneMap | Map data © contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
  });
  let map = new L.Map("map", {
    center: [1.347833, 103.809357], 
    zoom: 11,
    maxBounds: L.latLngBounds(L.latLng(1.1, 103.5), L.latLng(1.5, 104.3))
    })
    .addLayer(tiles);
    
  Promise.all([d3.json("sgmap.json"), d3.csv('population2020.csv')]).then(data => {
    let geoData = data[0];
    let popData = data[1];

    let svg = d3.select(map.getPanes().overlayPane)
    .append("svg")
    .attr("width", window.innerWidth * .8)
    .attr("height", window.innerHeight * .8);

    function projectPoint(x, y) {
      let point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }
    
    let projection = d3.geoTransform({point: projectPoint});
    let geopath = d3.geoPath().projection(projection);
    
    svg.append("g")
      .attr("id", "subzones")
      .attr("class", "leaflet-zoom-hide")
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
        .attr('d', geopath)

    let colorScale = d3.scaleLinear()
      .domain([0,63960])
      .range(['mistyrose','mediumvioletred']);

    let getColor = (s) => {
      d = popData.filter(x => x.Subzone.toUpperCase() === s)
      if (d.length == 0){
        return '#ffffff1a'
      } else if (Number(d[0].PopFemale) && Number(d[0].PopMale)){
        return colorScale(Number(d[0].PopMale) + Number(d[0].PopFemale))
      } else {
        return '#ffffff1a'
      }
    }

    let getPopulation = (s) => {
      d = popData.filter(x => x.Subzone.toUpperCase() === s)
      if (d.length == 0){
        return ', -'
      } else if (Number(d[0].PopFemale) && Number(d[0].PopMale)){
        return ', ' + (Number(d[0].PopMale) + Number(d[0].PopFemale))
      } else {
        return ', -'
      }
    }

    svg.select('g#subzones').selectAll('path')
      .style('fill', d => getColor(d.properties['Subzone Name']))
      .attr('class','map leaflet-interactive')
      .on("mouseover", (event, d) => {
        d3.select(".tooltip")
          .text(d.properties['Subzone Name'].toLowerCase() + getPopulation(d.properties['Subzone Name']))
          .attr('class', 'tooltip')
          .style("left", (event.clientX) + "px")
          .style("top", (event.clientY) + "px");
        d3.select(event.target)
          .attr('class','map selectedPath leaflet-interactive')
      })
      .on("mouseout", (event, d) => {
        d3.select(".tooltip")
          .text("");
        d3.select(event.target)
          .attr('class','map leaflet-interactive')
      });

    svg
      .append("g")
      .attr("class", "legendLinear")
      .attr("transform", "translate(20,500)");

    let legendLinear = d3.legendColor()
      .shapeWidth(40)
      .orient('horizontal')
      .labelFormat('d')
      .title('Population Size')
      .scale(colorScale);

    svg.select(".legendLinear")
      .attr('class','legend')
      .call(legendLinear);

    let onZoom = () => {
      let bounds = geopath.bounds(geoData),
          topLeft = bounds[0],
          bottomRight = bounds[1];
          topLeft[0] = topLeft[0] - 150;
          bottomRight[1] = bottomRight[1] + 100;
    
      let svg = d3.select(map.getPanes().overlayPane).select("svg");
          
      svg.attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
        
      d3.select("#subzones").attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
  
      d3.select("#subzones").selectAll("path")
        .attr("d", geopath);
    }
  
    map.on('zoomend', onZoom);
  })
}