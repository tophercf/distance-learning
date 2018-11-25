
/* TO DO:
- on click
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

    // Axis labels
    vis.svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", vis.height - 10)
        .text("Age");

    vis.svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("y", 10)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Cumulative Lifetime Earnings ($)");

    // Add legend

    vis.legendTitles = [
        {
            "Title": "Associate's Degree",
            "Color": "#0376BA"
        },
        {
            "Title": "Bachelor's Degree",
            "Color": "#AAC6EB"
        },
        {
            "Title": "High School Diploma",
            "Color": "#FF7701"
        },
        {
            "Title": "Some College, No Degree",
            "Color": "#FDBB71"
        }];

    vis.legend = vis.svg.selectAll(".legend")
        .data(vis.legendTitles)
        .enter().append("g")
        .attr("class", "legend");

    vis.legend.append("rect")
        .attr("class", "legend")
        .attr("x", vis.width - 275)
        .attr("y",  function(d, i) { return 575 + i * 20; })
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", function(d) {return d.Color;});

    vis.legend.append("text")
        .attr("x", vis.width - 250)
        .attr("y", function(d, i) { return 582 + i * 20; })
        .attr("dy", ".32em")
        .text(function(d) { return d.Title; });


    // Add tool tip
    vis.tipAssociate = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return "<p>Associate Degree - Age: " + d.Age + "</p>" + "<p>Lifetime Earnings: $" + d3.format(",")(d['Associate Degree']) + "</p>"
        });

    vis.tipBachelors = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return "<p>Bachelor's Degree - Age: " + d.Age + "</p>" + "<p>Lifetime Earnings: $" + d3.format(",")(d['Bachelor\'s Degree']) + "</p>"
        });

    vis.tipHighSchool = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return "<p>High School Diploma - Age: " + d.Age + "</p>" + "<p>Lifetime Earnings: $" + d3.format(",")(d['High School Diploma']) + "</p>"
        });

    vis.tipSomeCollege = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return "<p>Some College, No Degree - Age: " + d.Age + "</p>" + "<p>Lifetime Earnings: $" + d3.format(",")(d['Some College, No Degree']) + "</p>"
        });

    vis.svg.call(vis.tipAssociate);
    vis.svg.call(vis.tipBachelors);
    vis.svg.call(vis.tipHighSchool);
    vis.svg.call(vis.tipSomeCollege);

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
        .attr("stroke", "#0376BA")
        .attr("fill", "none");

    vis.pathBachelors = vis.svg.append("path")
        .data(vis.data);

    vis.pathBachelors.attr("class", "line")
        .attr("d", vis.lineBachelors(vis.data))
        .attr("stroke-width", 2)
        .attr("stroke", "#AAC6EB")
        .attr("fill", "none");

    vis.pathHighSchool = vis.svg.append("path")
        .data(vis.data);

    vis.pathHighSchool.attr("class", "line")
        .attr("d", vis.lineHighSchool(vis.data))
        .attr("stroke-width", 2)
        .attr("stroke", "#FF7701")
        .attr("fill", "none");

    vis.pathSomeCollege = vis.svg.append("path")
        .data(vis.data);

    vis.pathSomeCollege.attr("class", "line")
        .attr("d", vis.lineSomeCollege(vis.data))
        .attr("stroke-width", 2)
        .attr("stroke", "#FDBB71")
        .attr("fill", "none");

    // Add the data points
    var circleAssociate = vis.svg.selectAll("circleAssociate")
        .data(vis.data);

    circleAssociate.exit().remove();

    // Enter
    circleAssociate.enter().append("circle")
        .attr("r", 5)
        .attr("class", "circleAssociate")
        .attr("fill", "#0376BA")
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
        .attr("fill", "#AAC6EB")
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
        .attr("fill", "#FF7701")
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
        .attr("fill","#FDBB71")
        // Merge
        .merge(circleSomeCollege)
        .transition()
        .duration(vis.time)
        .attr("cx", function (d) { return vis.x(d.Age); })
        .attr("cy", function(d) { return vis.y(d['Some College, No Degree']); });

    vis.svg.selectAll(".circleAssociate")
        .on("mouseover", vis.tipAssociate.show)
        .on("mouseout", vis.tipAssociate.hide)
        .on("click",  function(d) { updateRatio(d) });

    vis.svg.selectAll(".circleBachelors")
        .on("mouseover", vis.tipBachelors.show)
        .on("mouseout", vis.tipBachelors.hide)
        .on("click",  function(d) { updateRatio(d) });

    vis.svg.selectAll(".circleHighSchool")
        .on("mouseover", vis.tipHighSchool.show)
        .on("mouseout", vis.tipHighSchool.hide)
        .on("click",  function(d) { updateRatio(d) });

    vis.svg.selectAll(".circleSomeCollege")
        .on("mouseover", vis.tipSomeCollege.show)
        .on("mouseout", vis.tipSomeCollege.hide)
        .on("click",  function(d) { updateRatio(d) });

    // Update the axes
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

};

function updateRatio(d) {
    // Remove data
    d3.select("#income-detail")
        .selectAll("*")
        .remove();

    var detail = "<i style = 'color:#0376BA'>At age " + d.Age + ", an individual with a bachelor's degree has earned:<ul><li>$"

    if (d['Bachelor\'s Degree'] > d['High School Diploma']) {
        detail = detail + d3.format(",")(d['Bachelor\'s Degree'] - d['High School Diploma']) + " more ";
    } else {
        detail = detail + d3.format(",")(d['High School Diploma'] - d['Bachelor\'s Degree']) + " less ";
    }

    detail = detail + "than somebody with a high school diploma,</li><li>$";

    if (d['Bachelor\'s Degree'] > d['Associate Degree']) {
        detail = detail + d3.format(",")(d['Bachelor\'s Degree'] - d['Associate Degree']) + " more ";
    } else {
        detail = detail + d3.format(",")(d['Associate Degree'] - d['Bachelor\'s Degree']) + " less ";
    }

    detail = detail + "than somebody with an associate degree,</li><li>$";

    if (d['Bachelor\'s Degree'] > d['Some College, No Degree']) {
        detail = detail + d3.format(",")(d['Bachelor\'s Degree'] - d['Some College, No Degree']) + " more ";
    } else {
        detail = detail + d3.format(",")(d['Some College, No Degree'] - d['Bachelor\'s Degree']) + " less ";
    }

    detail = detail + "than somebody with some college but no degree.</li>";

    detail = detail + "</ul></i>";


    // Append table
    d3.select("#income-detail")
        .append("div")
        .html(detail);
}