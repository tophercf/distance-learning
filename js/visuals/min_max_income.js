
/*
 * MinMaxIncomeChart - Object constructor function
 * @param _parentElement 					-- the HTML element in which to draw the visualization
 * @param _data	                            -- data for graduate vs undergraduate enrolment
 */

MinMaxIncomeChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.initVis();
};

MinMaxIncomeChart.prototype.initVis = function() {

    var vis = this;

    // console.log("2nd data:");
    // console.log(vis.data);

    //set configs to data naming conventions
    vis.selectedStatus = "Graduate";
    vis.status2012 = vis.selectedStatus + "2012";
    vis.status2016 = vis.selectedStatus + "2016";

    // console.log("status is " + vis.selectedStatus);


    //-----initialize SVG element------
    // var parentElement = "min-max-income-chart";

    vis.margin = {top: 80, right: 20, bottom: 60, left: 120};

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
        .text("Percentage of online learners (%)");

    //y axis label text
    vis.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Total household income by year ($)");

    vis.wrangleData();
}



MinMaxIncomeChart.prototype.wrangleData = function() {

    vis = this;

    // console.log("values for selected attribute, " + vis.selectedStatus + "2012");
    var listValues2012 = vis.data.forEach(function (el, i) {
        // console.log(el[vis.status2012]);
    });

    //find single max value of both 2012 and 2016 sets
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

    vis.x.domain([vis.min2012and2016 - 3, vis.max2012and2016 + 3]);
    vis.y.domain([0, vis.data.length]);


    //generates circles for each data point
    vis.svg.selectAll("circle")
        .data(vis.allCoordinates)
        .enter()
        .append("circle")
        .attr("r", 6)
        .attr("opacity", 0.5)
        .attr("cx", function(d, i){ return vis.x(d.x) })
        .attr("cy", function(d, i){ return vis.y(d.y) })
        .style("fill", function(d, i) {
            if (i >= (vis.allCoordinates.length / 2))
                return "lightblue"
            else
                return "orange"
        } )
        .style("stroke", "lightgrey")
        .style("stroke-width", 2);



    vis.svg.select(".y-axis").call(vis.yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");

    vis.svg.select(".x-axis").call(vis.xAxis);

    //----generate lines------

    vis.svg.append("g")
        .attr("class", "lines");

    //draws lines between points
    vis.svg.selectAll('lines')
        .data(vis.allCoordinates)
        .enter()
        .append('line')
        .style('stroke', 'lightgrey')
        .style('stroke-width', 2)
        .attr('x1', function(d, i){
            if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                return vis.x(Math.min((vis.allCoordinates[i].x), (vis.allCoordinates[i + 11].x)));
            }
            // else
            //     console.log("no value from second half");
        })
        .attr('y1', function(d, i) {
            if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                return vis.y(Math.min((vis.allCoordinates[i].y), (vis.allCoordinates[i + 11].y)));
            }
            // else
            //     console.log("no value from second half");
        })
        .attr('x2', function(d, i) {
            if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                return vis.x(Math.max((vis.allCoordinates[i].x), (vis.allCoordinates[i + 11].x)));
            }
            // else
            //     console.log("no value from second half");
        })
        .attr('y2', function(d, i) {
            if (i < (vis.allCoordinates.length / 2)) {   //only looks for coordinates on first half in order to not duplicate
                return vis.y(Math.max((vis.allCoordinates[i].y), (vis.allCoordinates[i + 11].y)));
            }
            // else
            //     console.log("no value from second half");
        })

}