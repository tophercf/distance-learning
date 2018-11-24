
/* TO DO:
- tool tips
- legend
- change colors
- maybe UI slider / transitions?
 */


LineGraph = function (_parentElement, _dataIncome) {

    this.parentElement = _parentElement;
    this.data = _dataIncome;
    this.displayData = [];
    this.time = 800;
    this.initVis();

};

LineGraph.prototype.initVis = function () {

    var vis = this;

    // Initialize SVG area
    vis.size = 800;
    vis.margin = { top: 80, right: 20, bottom: 20, left: 80 };

    vis.width = vis.size - vis.margin.left - vis.margin.right;
    vis.height = vis.size - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Create scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Chart title
    vis.svg.append("text")
        .attr("x", vis.width/10)
        .attr("y", 0)
        .text("Cumulative Lifetime Earnings by Educational Attainment");

    // Add tool tip
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return 1 //"<p>Edition: " + d.EDITION + "</p>" + "<p class = 'title'>" + selected.replace("_", " ").toLowerCase() + ": " + d[selected] + "</p>";
        });

    vis.svg.call(vis.tip);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};

LineGraph.prototype.wrangleData = function () {

    var vis = this;

    // Clean data
    vis.data.forEach(function (d) {
        d.Age = +d.Age;
        d['Associate Degree'] = +(d['Associate Degree'].replace(/\$|,/g, ''));
        d['Bachelor\'s Degree'] = +(d['Bachelor\'s Degree'].replace(/\$|,/g, ''));
        d['High School Diploma'] = +(d['High School Diploma'].replace(/\$|,/g, ''));
        d['Some College, No Degree'] = +(d['Some College, No Degree'].replace(/\$|,/g, ''));
    });

    console.log(vis.data);

    // Update the visualization
    vis.updateVis();
};

LineGraph.prototype.updateVis = function() {

    var vis = this;

    // Update domains
    vis.x.domain(d3.extent(vis.data, function(d) { return d.Age; }));
    vis.y.domain([0, d3.max(vis.data, function(d) {return d['Bachelor\'s Degree'];})]);

    // Initialize paths
    vis.lineAssociate = d3.line()
        .x(function(d) {return vis.x(d.Age);})
        .y(function(d) {return vis.y(d['Associate Degree']);})
        .curve(d3.curveCardinal);

    vis.lineBachelors = d3.line()
        .x(function(d) {return vis.x(d.Age);})
        .y(function(d) {return vis.y(d['Bachelor\'s Degree']);})
        .curve(d3.curveCardinal);

    vis.lineHighSchool = d3.line()
        .x(function(d) {return vis.x(d.Age);})
        .y(function(d) {return vis.y(d['High School Diploma']);})
        .curve(d3.curveCardinal);

    vis.lineSomeCollege = d3.line()
        .x(function(d) {return vis.x(d.Age);})
        .y(function(d) {return vis.y(d['Some College, No Degree']);})
        .curve(d3.curveCardinal);

    // Draw lines
    vis.pathAssociate = vis.svg.append("path")
        .data(vis.data);

    vis.pathAssociate.attr("class", "line")
        .attr("d", vis.lineAssociate(vis.data))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("fill", "none");

    vis.pathBachelors = vis.svg.append("path")
        .data(vis.data);

    vis.pathBachelors.attr("class", "line")
        .attr("d", vis.lineBachelors(vis.data))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("fill", "none");

    vis.pathHighSchool = vis.svg.append("path")
        .data(vis.data);

    vis.pathHighSchool.attr("class", "line")
        .attr("d", vis.lineHighSchool(vis.data))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("fill", "none");

    vis.pathSomeCollege = vis.svg.append("path")
        .data(vis.data);

    vis.pathSomeCollege.attr("class", "line")
        .attr("d", vis.lineSomeCollege(vis.data))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("fill", "none");

    // Add the data points
    var circleAssociate = vis.svg.selectAll("circleAssociate")
        .data(vis.data);

    circleAssociate.exit().remove();

    // Enter
    circleAssociate.enter().append("circle")
        .attr("r", 5)
        .attr("class", "circleAssociate")
        // Merge
        .merge(circleAssociate)
        .transition()
        .duration(vis.time)
        .attr("cx", function (d) { return vis.x(d.Age); })
        .attr("cy", function(d) { return vis.y(d['Associate Degree']); });

    // Add the data points
    var circleBachelors = vis.svg.selectAll("circleBachelors")
        .data(vis.data);

    circleBachelors.exit().remove();

    // Enter
    circleBachelors.enter().append("circle")
        .attr("r", 5)
        .attr("class", "circleBachelors")
        // Merge
        .merge(circleBachelors)
        .transition()
        .duration(vis.time)
        .attr("cx", function (d) { return vis.x(d.Age); })
        .attr("cy", function(d) { return vis.y(d['Bachelor\'s Degree']); });

    // Add the data points
    var circleHighSchool = vis.svg.selectAll("circleHighSchool")
        .data(vis.data);

    circleHighSchool.exit().remove();

    // Enter
    circleHighSchool.enter().append("circle")
        .attr("r", 5)
        .attr("class", "circleHighSchool")
        // Merge
        .merge(circleHighSchool)
        .transition()
        .duration(vis.time)
        .attr("cx", function (d) { return vis.x(d.Age); })
        .attr("cy", function(d) { return vis.y(d['High School Diploma']); });

    // Add the data points
    var circleSomeCollege = vis.svg.selectAll("circleSomeCollege")
        .data(vis.data);

    circleSomeCollege.exit().remove();

    // Enter
    circleSomeCollege.enter().append("circle")
        .attr("r", 5)
        .attr("class", "circleSomeCollege")
        // Merge
        .merge(circleSomeCollege)
        .transition()
        .duration(vis.time)
        .attr("cx", function (d) { return vis.x(d.Age); })
        .attr("cy", function(d) { return vis.y(d['Some College, No Degree']); });


    // Update the axes
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);


};