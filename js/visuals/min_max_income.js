
/*
 * MinMaxIncomeChart - Object constructor function
 * @param _parentElement 					-- the HTML element in which to draw the visualization
 * @param _data	                            -- data for graduate vs undergraduate enrolment
 */
// var vis;

MinMaxIncomeChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.initVis();
};

MinMaxIncomeChart.prototype.initVis = function() {

    var vis = this;

    //-----initialize SVG element------

    vis.margin = {top: 80, right: 20, bottom: 60, left: 100};

    vis.size = 600;

    vis.width = vis.size - vis.margin.left - vis.margin.right;
    vis.height = vis.size - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    //-----set scales and axes----------

    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        //insert custom tick mark values
        .tickFormat(function (d, i) {
            if (i == 1)
                return "<25,000";
            else if (i == 2)
                return "25,000-39,999";
            else if (i == 3)
                return "40,000-54,999";
            else if (i == 4)
                return "55,000-69,999";
            else if (i == 5)
                return "70,000-84,999";
            else if (i == 6)
                return "85,000-99,999";
            else if (i == 7)
                return "100,000-114,999";
            else if (i == 8)
                return "115,000-129,999";
            else if (i == 9)
                return "130,000-149,999";
            else if (i == 10)
                return "150,000+";
            else if (i == 11)
                return "Prefer not to say";
            else
                return "";
        });
    ;

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0, " + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    //x axis label text
    vis.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", vis.height - 6)
        .attr("font-size", "12")
        .style("font-weight", "bold")
        .text("Percentage of online learners (%)");

    //y axis label text
    vis.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "12")
        .style("font-weight", "bold")
        .text("Total household income by year ($)");

    //----generate legend

    vis.legendData = [
        {
            year: "2012",
            color: "blue",
        },
        {
            year: "2016",
            color: "orange",
        },
        {
            year: "2012/2016",
            color: "#4B0082",
        },
    ];

    // console.log("legend data is");
    // console.log(vis.legendData);

    var legendHeight = 90;
    var legendWidth = 110;

    vis.lengendBackground = vis.svg.append("rect")
        .attr("class", "legend-background")
        .attr("height", legendHeight)
        .attr("width", legendWidth)
        .attr("x", vis.width - legendWidth)
        .attr("y", 0)
        .attr("fill", "lightgrey")
        .attr("border", "solid black 3px");

    vis.svg.append("g")
        .attr("class", "legend");

    //enter selection for legend data
    var legend = vis.svg.selectAll('legend')
        .data(vis.legendData)
        .enter();

    //adds rectangles for legend
    legend.append('rect')
        .attr('transform', 'translate(' + (vis.width - legendWidth + 10) + ',' + 0 + ')')
        .attr('height', 12)
        .attr('width', 12)
        .attr('y', function(d, i){
            return i * 30 + 10
        })
        .attr('x', 0)
        .style('fill', function(d, i){
            return 'fill', vis.legendData[i].color
        })
        .style("stroke", "lightgrey")
        .style("stroke-width", 2);

    //adds text for legend
    legend.append('text')
        .attr("transform", "translate(-80 , 21)")
        .attr('x', vis.width)
        .attr('y', function(d,i){
            return i * 30
        })
        .attr("text-anchor", "start")
        .text(function(d, i) {
            return vis.legendData[i].year
        })
        .attr("font-size", "14");

    vis.wrangleData();
}



MinMaxIncomeChart.prototype.wrangleData = function() {

    vis = this;

    // console.log("data on return is: ");
    // console.log(vis.data);

    //gets graduate status button value from HTML
    vis.selectedStatus = $("input:radio:checked").val();
    // console.log("grad/undergrad is " + vis.selectedStatus);

    //set configs to data naming conventions
    vis.status2012 = vis.selectedStatus + "2012";
    vis.status2016 = vis.selectedStatus + "2016";


    // //find single max value of both 2012 and 2016 sets
    vis.max2012and2016 = Math.max(findMax(2012), findMax(2016));
    // console.log("max is " + vis.max2012and2016);

    //find max of all values for specific year (2012 or 2016)
    function findMax(year) {
        //create new array to sort and not affect original array
        var newData1 = vis.data.map(function (el) {
            return el;
        });

        //sort new array according to status and year for descending values
        var mostToLeast = newData1.sort(function (a, b) {
            return b[vis.selectedStatus + year] - a[vis.selectedStatus + year]
        });

        //take top value of descending array as maximum
        var maxYear = (mostToLeast[0][vis.selectedStatus + year]);
        // console.log("max " + year + " is " + maxYear);
        //
        // console.log("most to least " + year + ":");
        // console.log(mostToLeast);

        return maxYear;
    }

    //find single min value of both 2012 and 2016 sets
    vis.min2012and2016 = Math.min(findMin(2012), findMin(2016));
    // console.log("min is " + vis.min2012and2016);

    //find min of all values for specific year (2012 or 2016)
    function findMin(year) {

        //create new array to sort and not affect original array
        var newData1 = vis.data.map(function (el) {
            return el;
        });

        //sort new array according to status and year for descending values
        var leastToMost = newData1.sort(function (a, b) {
            return a[vis.selectedStatus + year] - b[vis.selectedStatus + year]
        });

        //take top value of descending array as maximum
        var minYear = (leastToMost[0][vis.selectedStatus + year]);
        // console.log("min " + year + " is " + minYear);
        //
        // console.log("least to most " + year + ":");
        // console.log(leastToMost);

        return minYear;
    }

    //grabs x and y values for scatterplot
    function getCoordinates(array, xAttribute, yAttribute) {
        var isolateXandYValues = array.map(function (el) {
            return {
                x: el[xAttribute],
                y: el[yAttribute]
            }
        });
        return isolateXandYValues;
    }

    vis.coordinates2012 = getCoordinates(vis.data, vis.status2012, "IncomeLevel");
    // console.log("2012 coords: ");
    // console.log(vis.coordinates2012);

    vis.coordinates2016 = getCoordinates(vis.data, vis.status2016, "IncomeLevel");
    // console.log("2016 coords: ");
    // console.log(vis.coordinates2016);

    //combines all coordinates for passing into circle generator
    vis.allCoordinates = vis.coordinates2012.concat(vis.coordinates2016);
    // console.log("coordinates upon combined array: ");
    // console.log(vis.allCoordinates);

    vis.updateVis();
}



MinMaxIncomeChart.prototype.updateVis = function() {

    vis = this;

    vis.x.domain([vis.min2012and2016 - 2, vis.max2012and2016 + 2]);
    vis.y.domain([0, vis.data.length]);


    //update selection for dots
    var circlePlot = vis.svg.selectAll("circle")
        .data(vis.allCoordinates, function(d){ return d });

    //enter selection for plots
    circlePlot.enter()
            .append("circle")
        .merge(circlePlot)
            .attr("r", 6)
            .attr("cx", function(d, i){ return vis.x(d.x) })
            .attr("cy", function(d, i){ return vis.y(d.y) })
            .style("fill", function(d, i) {
                if (i < (vis.allCoordinates.length / 2)) {
                    if (vis.allCoordinates[i].x == vis.allCoordinates[i + 11].x){
                        console.log(i + "coordinates match");
                        return "green";
                    }
                    else if (i >= (vis.allCoordinates.length / 2))
                        return "blue";
                    else
                        return "orange";
                }
                else {
                    if (i >= (vis.allCoordinates.length / 2))
                        return "blue";
                    else
                        return "orange";
                }
            } )
            .style("stroke", "lightgrey")
            .style("stroke-width", 2);

    //exit selection for plots
    circlePlot.exit().remove();

    vis.svg.select(".y-axis").call(vis.yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");

    vis.svg.select(".x-axis").call(vis.xAxis);

    //----generate lines------

    // vis.svg.append("g")
    //     .attr("class", "lines");

    //draws lines between points
    var linePlot = vis.svg.selectAll('line')
        .data(vis.allCoordinates, function(d){ return d});

    linePlot.enter()
            .append('line')
        .merge(linePlot)
            .style('stroke', 'lightgrey')
            .style('stroke-width', 2)
        // .transition().duration(1000)
            .attr('x1', function(d, i){
                if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                    return vis.x(Math.min((vis.allCoordinates[i].x), (vis.allCoordinates[i + 11].x)));
                }
            })
            .attr('y1', function(d, i) {
                if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                    return vis.y(Math.min((vis.allCoordinates[i].y), (vis.allCoordinates[i + 11].y)));
                }
            })
            .attr('x2', function(d, i) {
                if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                    return vis.x(Math.max((vis.allCoordinates[i].x), (vis.allCoordinates[i + 11].x)));
                }
            })
            .attr('y2', function(d, i) {
                if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                    return vis.y(Math.max((vis.allCoordinates[i].y), (vis.allCoordinates[i + 11].y)));
                }
            });
    //
    // linePlot.transition()
    // .duration(1000)
    // .tween("value", function(d, i){
    //     var i = d3.interpolate(this.value, this.max);
    //     return function(t){ this.value = i(t);}
    // })

    linePlot.exit().remove();

}


//listens for button change and calls wrangle data with new undergraduate/graduate status data
$('#grad-status input').on('change', function() {
    var newValue = $("input:radio:checked").val();
    // console.log("new value is " + newValue);

    //skips initviz but re-wrangles data and updates viz accordingly
    minmaxincomechart.wrangleData();
});

