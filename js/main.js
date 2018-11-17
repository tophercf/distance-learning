$(document).ready(function() {
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
    .defer(d3.csv, "data/viz1_stacked_bar/odl_year4_mit.csv")
    .await(runVisualization);

var stackedChart;

function runVisualization(error, odlYear4MIT){
    stackedChart = new StackedChart("stacked-chart", odlYear4MIT);
};