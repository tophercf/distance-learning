
LineGraph = function (_parentElement, _dataIncome) {
    this.parentElement = _parentElement;
    this.data = _dataIncome;
    this.displayData = [];
    this.initVis();
};


LineGraph.prototype.initVis = function () {
    var vis = this;

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};

LineGraph.prototype.wrangleData = function () {
    var vis = this;

    // Update the visualization
    vis.updateVis();
};

LineGraph.prototype.updateVis = function() {
    var vis = this;

};