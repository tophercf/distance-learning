/*
 * Distance Learning Map - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the map
 * @param _data						-- the dataset 'institutes'
 *
 */

// TODO:    - Legends
//          - Tooltip
//          - Implement Zoom


// var test,t1,t2,t3;

var yearSlider = document.getElementById('yearSlider');

noUiSlider.create(yearSlider, {
    start: [2004],
    step: 1,
    range: {
        'min': [2004],
        'max': [2017]
    }
});



var stepSliderValueElement = document.getElementById('slider-value');



DLMap = function (_parentElement,_usa10m, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.usa10m = _usa10m;
    this.displayData = [];

    this.initVis();
}


DLMap.prototype.initVis = function () {

    var vis = this;

    vis.year = 0;



    vis.margin = { top: 60, right: 0, bottom: 60, left: 60 };
    vis.width = $("#dlMap").width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.projection = d3.geoAlbers()
        .translate([vis.width / 2, vis.height])
        .scale(1050)
        .center([0,30]);

    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.usa = topojson.feature(this.usa10m, vis.usa10m.objects.states).features;

    vis.svg.selectAll("path")
        .data(vis.usa)
        .enter()
        .append("path")
        .attr("class","usaMap")
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .attr("d", vis.path);

    // vis.circleColors = d3.scaleLinear(d3.interpolateRgb.gamma(2.2))
    vis.circleColors = d3.scaleOrdinal(d3.schemeCategory10)
        // .range(["purple", "orange"])
        // .domain([-2,5]);


    vis.wrangleData();






}

DLMap.prototype.wrangleData = function() {
    var vis = this;
    var dataD = [];

    for (var i = 2004; i <= 2017; i++) {
        if(i < 2012) {
            dataD.push(d3.nest().key(a => a["Distance learning opportunities (IC"+i+")"]).entries(vis.data)
                .filter(a => a.key == "1")
                .map(d => {
                    // change the key to be the year
                    d.key = i;
                    //Parse all integers and keep the institute name
                    d.values.forEach( row => {
                        for (var k in row) {
                            if(k !== "Institution Name")
                                if(row[k] != "")
                                    row[k] = +row[k];
                        }
                    }
                    );
                    return d;}));
        }
        else {
            dataD.push(d3.nest().key(a => a["Does not offer distance education opportunities (IC"+i+")"]).entries(vis.data)
                .filter(a => a.key == "0")
                .map(d => {
                    // change the key to be the year
                    d.key = i;
                    //Parse all integers and keep the institute name
                    d.values.forEach( row => {
                            for (var k in row) {
                                if(k !== "Institution Name")
                                    if(row[k] != "")
                                        row[k] = +row[k];
                            }

                        }
                    );
                    return d;}));
        }
    }

    dataD = dataD.map(d => d[0]); //flatten the array of objects




    yearSlider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {
        stepSliderValueElement.innerHTML = values[handle].slice(0,-3);

        // vis.year = positions;

        //this.wrangleData(positions)

        vis.displayData = dataD[unencoded - 2004];

        vis.updateVis();

        // console.log(unencoded - 2004);
        // console.log(values);
        // console.log(handle);
        // console.log(tap);


    });


    // test= dataD;


    // var counter = 0;
    // var loopPlay = setInterval(
    //     () => {
    //         console.log(vis.year);
    //         vis.year +=1;
    //         counter +=1;
    //         vis.updateVis();
    //
    //         if (counter === 14) {
    //             clearInterval(loopPlay);
    //         }
    //
    //
    //     }
    //     ,1000
    // );

    // for (var year = 0; year <= 14 ; year++ ){
    //     setTimeout(function () {
    //         //vis.year = year;
    //         //console.log(vis.year)
    //     }, 5000);
    //     //;
    // }

    // vis.year = yearIndex;




    // t1 = vis.circleColors;




};

DLMap.prototype.updateVis = function () {
    vis = this;

    vis.totals = vis.svg
        .append("text")
        .attr("transform", "translate(-10,-50)")
        .attr("class","mapTotalInstitutions");

    vis.svg.select(".mapTotalInstitutions")
        .text("Total Institutions with Distance Learning Opportunities = " +  vis.displayData.values.length);
    
    vis.circles = vis.svg.selectAll(".institute-circle")
        .data(vis.displayData.values);

    // console.log(vis.displayData.values.length);


    vis.circles
        .exit().remove();

    vis.circles
        .enter()
        .append("circle")
        .attr("class","institute-circle")
        .attr("opacity",0)
        .attr("r",0)
        // .attr("fill", c => vis.circleColors(c["Institutional control or affiliation (IC20"+(String('0' + (vis.year + 4)).slice(-2))+")"]))
        .attr("fill", c => vis.circleColors(c["Institutional control or affiliation (IC2017)"]))
        .attr("transform",d => "translate("+ vis.projection([d["Longitude location of institution (HD2017)"], d["Latitude location of institution (HD2017)"]])+")")
        .transition()
        .duration(500)
        .attr("opacity",.9)
        // .attr("title",c => {
        //     if ( c["Institution Name"] === "Amberton University")
        //     {
        //         t2 = c;
        //         console.log(c);
        //     }
        //      return "cc " + c["Institutional control or affiliation (IC20"+(String('0' + (vis.year + 4)).slice(-2))+")"]})
        .attr("r",2);


}
