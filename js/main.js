$(document).ready(function () {
    $('#fullpage').fullpage({
        //options here
        navigation: true,
        licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE'
    });

    //methods
    //$.fn.fullpage.setAllowScrolling(false);
});


// import data
queue()
//     .defer(d3.csv, "data/viz1_stacked_bar/odl_year4_mit.csv")
    .defer(d3.csv, "data/viz1_stacked_bar/odl_year4_mit_consolidated.csv")
    .defer(d3.csv, "data/viz4_min_max_dots/income_by_grad_status.csv")
    .defer(d3.csv, "data/education_pays.csv")
    .await(runVisualization);

var stackedChart;
var minmaxincomechart;
var lineGraph;

function runVisualization(error, odlYear4MIT, incomeGradStatus, incomeData) {
    stackedChart = new StackedChart("stacked-chart", odlYear4MIT);
    minmaxincomechart = new MinMaxIncomeChart("min-max-income-chart", incomeGradStatus);
    lineGraph = new LineGraph("income-chart", incomeData);

};