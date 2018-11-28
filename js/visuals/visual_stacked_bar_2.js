
/*
 * StackedChart - Object constructor function
 * @param _parentElement 					-- the HTML element in which to draw the visualization
 * @param _dataMooc		                    -- data for 4 year mooc study
 */

StackedChart = function (_parentElement, _dataMooc) {
    this.parentElement = _parentElement;
    this.data = _dataMooc;
    this.displayData = [];
    this.parse = d3.timeParse("%-m/%-d/%Y");
    this.parseYear = d3.timeParse("%Y");
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    this.initVis();
};

StackedChart.prototype.initVis = function () {
    var vis = this;
    vis.margin = { top: 80, right: 20, bottom: 20, left: 80 };

    vis.size = 800;

    vis.width = vis.size - vis.margin.left - vis.margin.right,
        vis.height = vis.size - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
    vis.xAxis = d3.axisBottom()
        .scale(vis.x);
    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    // INITIALIZE AXIS FOR GRAPH
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Chart title
    vis.svg.append("text")
        .attr("x", vis.width / 10)
        .attr("y", 0)
        .style("font-size", "20px")
        .text("Online Class Data Shows Upward Trend in Participation");

    // y axis label
    vis.ylabel = vis.svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", -10)
        .attr("y", 10)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)");

    // INITIALIZE STACKED AREA LAYOUT
    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function (d) {
            return vis.x(d.data.Year);
        })
        .y0(function (d) {
            if (isNaN(d[0])) {
                return vis.y(0);
            }
            return vis.y(d[0]);
        })
        .y1(function (d) {
            if (isNaN(d[1])) {
                return vis.y(0);
            }
            return vis.y(d[1]);
        });

    // convert values
    vis.data.forEach(function (d) {
        var row = {
            "Certified": parseInt(d.Certified),
            "Course Launch Date": d["Course Launch Date"],
            "Curricular Area2": d["Curricular Area2"],
            "Female": parseInt(d["Female"]),
            "Institution": parseInt(d["Institution"]),
            "Male": parseInt(d["Male"]),
            "Sum of Participants": parseInt(d["Sum of Participants"]),
            "Total Hours (Thousands)": parseFloat(d["Total Hours (Thousands)"])
        };
        vis.displayData.push(row);
    });

    // data categories
    vis.dataKeys = d3.map(vis.displayData, function (d) {
        return d["Curricular Area2"];
    }).keys();

    // Initialize Legend
    var legend = vis.svg.append('g').attr("class", "legend");
    var legendRows = legend.selectAll('rect.legend-row').data(vis.dataKeys);
    legendRows.enter().append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', 70)
        .attr('y', function (d, i) {
            return i * 30 + 40;
        })
        .style('fill', function (d, i) {
            return vis.colorScale(vis.dataKeys[i]);
        })
        .attr('class', 'legend-row');
    legendRows.enter().append('text')
        .attr('x', 100)
        .attr('y', function (d, i) {
            return i * 30 + 55;
        })
        .text(function (d) {
            return d;
        })
    vis.wrangleData();
};

StackedChart.prototype.wrangleData = function () {
    var vis = this;
    var selectedVal = d3.select("#user-trend-selection").property("value");
    vis.ylabel.text(selectedVal);

    if (selectedVal == "# Participants Certified") {
        selectedVal = "Certified";
    }
    if (selectedVal == "Total Participants") {
        selectedVal = "Sum of Participants";
    }

    // AGGREGATE: participants by year on each category    
    vis.rollupData = d3.nest()
        .key(function (d) {
            return d["Course Launch Date"];
        })
        .key(function (d) {
            return d["Curricular Area2"];
        })
        .rollup(function (leaves) {
            var count = 0;
            leaves.forEach(function (d) {
                count += d[selectedVal];
            });
            return count;
        })
        .entries(vis.displayData);

    // SET DOMAIN FOR X 
    vis.x.domain(d3.extent(vis.rollupData, function (d) {
        return vis.parseYear(d.key);
    }));

    // SET DOMAIN FOR Y
    var max = 0;
    vis.rollupData.forEach(function (d) {
        var yearCount = 0;
        d.values.forEach(function (k) {
            // set max
            yearCount += k.value;
        });
        if (yearCount > max) {
            max = yearCount;
        }
    });
    vis.y.domain([0, max * 1.1]);

    // FLATTEN: for the stacked
    vis.flattenedParticipantCount = [];
    vis.rollupData.forEach(function (d) {
        // for a given object
        var temp = {
            "Year": vis.parseYear(d.key)
        };

        d.values.forEach(function (ta) {
            temp[ta["key"]] = ta["value"];
        })
        vis.flattenedParticipantCount.push(temp);
    });

    // SORT: initial sort by year ascending
    vis.flattenedParticipantCount.sort(function (x, y) {
        return d3.ascending(x.Year, y.Year);
    });

    // Initialize stack layout   
    vis.stack = d3.stack()
        .keys(vis.dataKeys);

    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function
 */

StackedChart.prototype.updateVis = function () {
    var vis = this;

    // calculate the raw y0, y1 coords
    vis.stackedData = vis.stack(vis.flattenedParticipantCount);

    // Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.stackedData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function (d, i) {
            return vis.colorScale(vis.dataKeys[i])
        })
        .transition().duration(1000)
        .attr("d", function (d) {
            return vis.area(d);
        });

    // Call axis functions with the new domain 
    vis.svg.select(".x-axis").transition().duration(1000).call(vis.xAxis);
    vis.svg.select(".y-axis").transition().duration(1000).call(vis.yAxis);
};