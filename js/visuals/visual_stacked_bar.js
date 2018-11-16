
/*
 * StackedChart - Object constructor function
 * @param _parentElement 					-- the HTML element in which to draw the visualization
 * @param _dataMooc		                    -- data for 4 year mooc study
 */

StackedChart = function(_parentElement, _dataMooc){
	this.parentElement = _parentElement;
	this.data = _dataMooc;
	this.displayData = [];

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


	// (Filter, aggregate, modify data)
	vis.wrangleData();
};

StackedChart.prototype.wrangleData = function(){
	var vis = this;

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