
/*
 * StackedChart - Object constructor function
 * @param _parentElement 					-- the HTML element in which to draw the visualization
 * @param _dataMooc		                    -- data for 4 year mooc study
 */

StackedChart = function(_parentElement, _dataMooc){
	this.parentElement = _parentElement;
	this.data = _dataMooc;
	this.displayData = [];
    this.parse = d3.timeParse("%-m/%-d/%Y");
    this.parseYear = d3.timeParse("%Y");
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory20);
	this.initVis();
};

StackedChart.prototype.initVis = function(){
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
        // custom domain to map to the aggregated values
        .domain([vis.parseYear("2012"), vis.parseYear("2016")])
        // .domain(d3.extent(vis.data, function(d) { return vis.parse(d["Course Launch Date"]); }));
    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        // custom domain to map to aggregated values
        .domain([0,1560589]);
	vis.xAxis = d3.axisBottom()
		  .scale(vis.x);
	vis.yAxis = d3.axisLeft()
        .scale(vis.y);
    vis.svg.append("g")
	    .attr("class", "x-axis axis")
	    .attr("transform", "translate(0," + vis.height + ")");

	vis.svg.append("g")
            .attr("class", "y-axis axis");
            
      // Stacked area layout
	vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d)  { 
            console.log('this is the d in area', d)
            return vis.x(d.data.Year); })
        .y0(function(d) { 
            if(isNaN(d[0])){
                return vis.y(0);
            }
            return vis.y(d[0]); 
        })
        .y1(function(d) { 
            if(isNaN(d[1])){
                return vis.y(0);
            } 
            return vis.y(d[1]);
        });

	// (Filter, aggregate, modify data)
	vis.wrangleData();
};

StackedChart.prototype.wrangleData = function(){
	var vis = this;

    // convert values
    vis.data.forEach(function(d){
        var tempDate = vis.parse(d["Course Launch Date"]);
        var row = {
            "Institution": d.Institution,
            "Course Number": d["Course Number"],
            "Curricular Area2": d["Curricular Area2"],
            "Course Launch Date": tempDate,
            "Course Launch Year": tempDate.getFullYear(),
            "Course Launch Month": tempDate.getMonth(),
            "Year (1-4)": parseInt(d["Year (1-4)"]),
            "Participants": parseInt(d["Participants"]),
            "Explorers": parseInt(d["Explorers"]),
            "Certified": parseInt(d["Certified"]),
            "% Female": parseFloat(d["% Female"]),
            "# Female": parseInt(Math.ceil(parseFloat(d["% Female"])/100 * parseInt(d["Participants"]))),
            "% Bachelor's+": parseFloat(d["% Bachelor's+"]),
            "Median Age3": parseFloat(d["Median Age3"])
        };
        vis.displayData.push(row);
    });
    console.log(vis.displayData);
    
    // AGGREGATE: participants by year on each category
    vis.participantCount = d3.nest()
        .key(function(d){
            return d["Course Launch Year"];
        })
        .key(function(d){
            return d["Curricular Area2"];
        })
        .rollup(function(leaves){
            var count = 0;
            leaves.forEach(function(d){
                count += d.Participants;
            });
            return count;
        })
        .entries(vis.displayData);
    
    // FLATTEN: for the stacked
    vis.flattenedParticipantCount = [];
    vis.participantCount.forEach(function(d){
        // for a given object
        var temp = {
            "Year": vis.parseYear(d.key)
        };

        d.values.forEach(function(ta){
            temp[ta["key"]] = ta["value"];
        })
        vis.flattenedParticipantCount.push(temp);
    });

    // SORT: initial sort by year ascending
    vis.flattenedParticipantCount.sort(function(x, y){
        return d3.ascending(x.Year, y.Year);
    });
    console.log('flattened', vis.flattenedParticipantCount);

    // data categories
    vis.dataKeys = d3.map(vis.displayData, function(d){
        return d["Curricular Area2"];
    }).keys();

    // Initialize stack layout   
    vis.stack = d3.stack()
		.keys(vis.dataKeys);
    console.log(vis.stack);

	// Update the visualization
    vis.updateVis("index");
};


/*
 * The drawing function
 */

StackedChart.prototype.updateVis = function(orderingType){
	var vis = this;

    // Update sorting
    /*
	vis.displayData.sort( function(a, b){
		if(orderingType == "index")
			return a[orderingType] - b[orderingType];
		else
			return b[orderingType] - a[orderingType];
    });
    */

    // calculate the raw y0, y1 coords
    vis.stackedData = vis.stack(vis.flattenedParticipantCount);
    
    // Draw the layers
	var categories = vis.svg.selectAll(".area")
    .data(vis.stackedData);
    console.log(vis.stackedData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function(d,i) {
          return vis.colorScale(vis.dataKeys[i])
        })
    .attr("d", function(d) {

            console.log('this is going in d', d);
            return vis.area(d);
    })
    console.log('stacked data', vis.stackedData);

        // Call axis functions with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};