let w = 600;
let h = 400;
let margin = {top: 32, right: 100, bottom: 40, left: 80};


window.onload = () => {
    loadVisualisation();
};

const loadVisualisation = () => {
    d3.json("https://raw.githubusercontent.com/vnck/HASS-assignment2/main/victims_of_crime_sg.json").then(data => {
    
        let svg = d3.select('#chart')
            .append('svg')
            .attr('width', w)
            .attr('height', h)
        
        // svg.append('rect')
        //     .attr('width', '100%')
        //     .attr('height', '100%')
        //     .attr('fill', 'yellow');

        let genderDomain = ['Male', 'Female'];
        let crimeDomain = ['Cheating & Related', 'Murder','Rioting','Serious Hurt','Robbery','Rape','Outrage Of Modesty','Snatch Theft'];
        let ageGroupDomain = ['<= 21','<= 19','> 21'];

        d3.select('#selectMenu')
            .selectAll('myOptions')
            .data(crimeDomain)
            .enter()
            .append('option')
            .text(d => d)
            .attr('value', d => d);

        let xScale = d3.scaleLinear()
            .domain([2011,2019])
            .range([margin.left, w - margin.right])
            .nice();

        let xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format("d"));

        svg.append('g')
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + (h-margin.bottom) + ")")
            .call(xAxis)

        svg.append("text")
            .attr("class", "xLabel")
            .attr("text-anchor", "middle")
            .attr("x", w/2)
            .attr("y", h)
            .style("font-size","12px")
            .text("Year");

        let colorScale = d3.scaleOrdinal()
            .domain(['Male', 'Female'])
            .range(['steelblue','palevioletred']);

        let legend = d3.legendColor()
            .scale(colorScale);

        svg.append('g')
            .style("font-size","12px")
            .attr('transform','translate(530,45)')
            .call(legend);

        let selectedOption = crimeDomain[0]

        let selectedData = data.filter(d => d.crime === selectedOption && d.age_group === 'Total');

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(selectedData, d => d.value)])
            .range([h - margin.bottom, margin.top])
            .nice();

        let yAxis = d3.axisLeft(yScale);
        
        svg.append("g")
            .attr("class", "yAxis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis)

        svg.append("text")
            .attr("class", "yLabel")
            .attr("text-anchor", "middle")
            .attr("y", 10)
            .attr('x', -200)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .style("font-size","12px")
            .text("No. of Victims");

        let lines = {}
        let points = {}
        let labels ={}

        genderDomain.forEach(g => {
            let gData = selectedData.filter(d => d.gender === g);
            lines[g] = svg.append('g')
            .append('path')
            .datum(gData)
            .attr('d', d3.line()
                .x(d => xScale(+d.year))
                .y(d => yScale(+d.value))    
            )
            .attr('stroke', colorScale(g))
            .style('stroke-width', 4)
            .style('fill', 'none');
            
            points[g] = svg.selectAll('points')
                .data(gData)
                .enter()
                .append('circle')
                .attr('fill', colorScale(g))
                .attr('cx', d => xScale(+d.year))
                .attr('cy', d => yScale(+d.value))
                .attr('r', 5)
        });
        
        genderDomain.forEach(g => {
            let gData = selectedData.filter(d => d.gender === g);

            labels[g] = svg.selectAll('labels')
                .data(gData)
                .enter()
                .append('text')
                .attr('x', d => xScale(+d.year))
                .attr('y', d => yScale(+d.value) - 5)
                .text(d => d.value)
                .style('text-anchor', 'middle')
                .style('font-size', '12px')
        });

        const update = (selectedOption) => {

            let selectedData = data.filter(d => d.crime === selectedOption && d.age_group === 'Total');
        
            let yScale = d3.scaleLinear()
                .domain([0, d3.max(selectedData, d => d.value)])
                .range([h - margin.bottom, margin.top])
                .nice();
        
            let yAxis = d3.axisLeft(yScale);
            
            svg.select("g.yAxis")
                .transition()
                .duration(1000)
                .call(yAxis)
        
            genderDomain.forEach(g => {
                let gData = selectedData.filter(d => d.gender === g);
                lines[g]
                    .datum(gData)
                    .transition()
                    .duration(1000)
                    .attr('d', d3.line()
                        .x(d => xScale(+d.year))
                        .y(d => yScale(+d.value))    
                    )
                    .attr('stroke', colorScale(g))
                    .style('stroke-width', 4)
                    .style('fill', 'none');

                points[g]
                    .data(gData)
                    .transition()
                    .duration(1000)
                    .attr('fill', colorScale(g))
                    .attr('cx', d => xScale(+d.year))
                    .attr('cy', d => yScale(+d.value))
                
                labels[g]
                    .data(gData)
                    .transition()
                    .duration(500)
                    .attr('fill-opacity', 0)
                    .transition()
                    .duration(200)
                    .attr('x', d => xScale(+d.year))
                    .attr('y', d => yScale(+d.value) - 5)
                    .transition()
                    .duration(500)
                    .attr('fill-opacity', 1)
                    .text(d => d.value)
            });
        }

        d3.select('#selectMenu').on('change', d => {
            let selectedOption = d3.select('#selectMenu').property('value');
            update(selectedOption);
            console.log(selectedOption);
        })
    });
}