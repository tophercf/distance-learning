
/*
 * StackedChart - Object constructor function
 * @param _parentElement 					-- the HTML element in which to draw the visualization
 * @param _dataMooc		                    -- data for 4 year mooc study
 */

StackedChart = function(_parentElement, _dataMooc){
	this.parentElement = _parentElement;
	this.data = _dataMooc;
	this.displayData = [];
    this.parse = d3.timeParse("%-m/%-d/%Y")

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
        .domain(d3.extent(vis.data, function(d) { return vis.parse(d["Course Launch Date"]); }));

    vis.y = d3.scaleLinear()
		.range([vis.height, 0]);

	vis.xAxis = d3.axisBottom()
		  .scale(vis.x);

	vis.yAxis = d3.axisLeft()
	    .scale(vis.y);

	// (Filter, aggregate, modify data)
	vis.wrangleData();
};

StackedChart.prototype.wrangleData = function(){
	var vis = this;

    // convert values
    vis.data.forEach(function(d){
        var row = {
            "Institution": d.Institution,
            "Course Number": d["Course Number"],
            "Curricular Area2": d["Curricular Area2"],
            "Course Launch Date": vis.parse(d["Course Launch Date"]),
            "Year (1-4)": parseInt(d["Year (1-4)"]),
            "Participants": parseInt(d["Participants"]),
            "Explorers": parseInt(d["Explorers"]),
            "Certified": parseInt(d["Certified"]),
            "% Female": parseFloat(d["% Female"]),
            "# Female": parseInt(Math.ceil(d["% Female"] * parseInt(d["Participants"]))),
            "% Bachelor's+": parseFloat(d["% Bachelor's+"]),
            "Median Age3": parseFloat(d["Median Age3"])
        };
        vis.displayData.push(row);
    });
    console.log(vis.displayData);

    // update display data after data transforms
    

	// Update the visualization
	// vis.updateVis("index");
};


/*
 * The drawing function
 */

StackedChart.prototype.updateVis = function(orderingType){
	var vis = this;

	// Update sorting
	vis.displayData.sort( function(a, b){
		if(orderingType == "index")
			return a[orderingType] - b[orderingType];
		else
			return b[orderingType] - a[orderingType];
	});
};