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
    },
    pips : {mode: 'steps',density: 10}
});



// var stepSliderValueElement = document.getElementById('slider-value');



var map = L.map("map").setView([37.8, -96], 4);

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);


L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);



var pruneCluster = new PruneClusterForLeaflet();

var markers = [];


DLMap = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    // this.usa10m = _usa10m;
    this.displayData = [];

    //this.initVis();
    this.wrangleData();
};


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


    // console.log(dataD);

    yearSlider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {
        // stepSliderValueElement.innerHTML = values[handle].slice(0,-3);
        // vis.year = positions;
        //this.wrangleData(positions)

        vis.displayData = dataD[unencoded - 2004];

        vis.updateVis();


    });
};

DLMap.prototype.updateVis = function () {
    vis = this;



    var  points = vis.displayData.values;

    // console.log(markers);

    // markers.clearLayers();

    // map.removeLayer(markers);
    //removeLayer(id)
    pruneCluster.RemoveMarkers();

    for (var i = 0; i < points.length; i++) {
        var a = points[i];


        var marker = new PruneCluster.Marker(a["Latitude location of institution (HD2017)"], a["Longitude location of institution (HD2017)"]);
        marker.category = a["Institutional control or affiliation (IC2017)"];

        var iconImg,instType;
        switch(a["Institutional control or affiliation (IC2017)"]) {
            case 1 :
                iconImg = "img/university-public.png";
                instType = "Public";
                break;
            case 2 :
                iconImg = "img/university-private-for-profit.png";
                instType = "Private for-profit";
                break;
            case 3 :
                iconImg = "img/university-private-not-for-profit-nreg.png";
                instType = "Private not-for-profit (no religious affiliation)";
                break;
            case 4 :
                iconImg = "img/university-private-not-for-profit-reg.png";
                instType = "Private not-for-profit (religious affiliation)";
                break;
            default:
                iconImg = "img/university-not-reported.png";
                instType = "Not reported";
        }

        var title = a["Institution Name"] + "<br>" + instType;
        marker.data.popup = title;


        // marker.data.icon = L.icon({iconUrl: 'img/university.png'});
        marker.data.icon = L.icon({iconUrl: iconImg});

        pruneCluster.RegisterMarker(marker);

    }
    pruneCluster.ProcessView();




    map.addLayer(pruneCluster);

}
