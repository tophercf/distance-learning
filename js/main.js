// draw svg
var margin = {
    top: 30,
    left: 30,
    right: 30,
    bottom: 30
};

var width = 1000 - margin.left - margin.right;
var height = 1000 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

// global object to hold data
var familyObject;
var availableData = [];

var startingY = 110;

queue()
    .defer(d3.text, "data/marriage.txt")
    .defer(d3.text, "data/business_ties.txt")
    .defer(d3.csv, "data/florentine-familiy-attributes.csv")
    .await(runVisualization);

function runVisualization(error, marriages, businessTies, florentineFamilies){
   wrangleData();

    updateViz();
}

function wrangleData() {

}

function updateViz(){

 }

function selectionChanged(){
    sortData();
}

function sortData(){

}