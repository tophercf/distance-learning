/*
 * Distance Learning Map - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the map
 * @param _data						-- the dataset 'institutes'
 *
 */



// var test,t1,t2,t3;




DLMap = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    // this.usa10m = _usa10m; // after refactoring removed the data
    this.displayData = [];

    this.initVis();
    this.wrangleData();
};


DLMap.prototype.initVis = function () {

    var vis = this;

    vis.yearSlider = document.getElementById('yearSlider');

    vis.playSlider = $('#playSlider');
    vis.timer;

    vis.startSlider = function(){
        dlMap.yearSlider.noUiSlider.set(+dlMap.yearSlider.noUiSlider.get()+1);
        if (+vis.yearSlider.noUiSlider.get() === 2017) {
            clearInterval(vis.timer);
            $('#playSlider').removeClass('fa-pause-circle').addClass('fa-play-circle');
        };
    };

    vis.playSlider.on("click", function () {
        if (vis.playSlider.hasClass("fa-play-circle")) {
            $('#playSlider').removeClass('fa-play-circle').addClass('fa-pause-circle');
            if (+vis.yearSlider.noUiSlider.get() !== 2017) {
                console.log("Play");
                vis.timer = setInterval(vis.startSlider, 2000);
            }
            else
            {
                console.log("Reset");
                dlMap.yearSlider.noUiSlider.set(2004);
                vis.timer = setInterval(vis.startSlider, 2000);
                // clearInterval(vis.timer);
            }
        }
        else //if (vis.playSlider.hasClass("fa-pause-circle"))
        {
            $('#playSlider').removeClass('fa-pause-circle').addClass('fa-play-circle');
            clearInterval(vis.timer);
        }

    });

    noUiSlider.create(yearSlider, {
        start: [2004],
        step: 1,
        range: {
            'min': [2004],
            'max': [2017]
        },
        pips : {mode: 'steps',density: 10}
    });


    vis.map = L.map("map").setView([37.8, -95], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(vis.map);



    vis.pruneCluster = new PruneClusterForLeaflet();

    // $(window).on("resize", function() {
    //     $("#map").height($(window).height()).width($(window).width());
    //     map.invalidateSize();
    // }).trigger("resize");



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

    vis.yearSlider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {
        //pick the selected data - the easy way :D
        vis.displayData = dataD[unencoded - 2004];
        vis.updateVis();


    });
};

DLMap.prototype.updateVis = function () {
    vis = this;

    //the date we needs
    var points = vis.displayData.values;

    //get the totals for the legends
    var total = vis.displayData.values.length;
    var totalPublic = vis.displayData.values.filter(d => d["Institutional control or affiliation (IC2017)"] == 1).length;
    var totalPrivateProfitable = vis.displayData.values.filter(d => d["Institutional control or affiliation (IC2017)"] == 2).length;
    var totalPrivateNonProfitableNonRel = vis.displayData.values.filter(d => d["Institutional control or affiliation (IC2017)"] == 3).length;
    var totalPrivateNonProfitableRel = vis.displayData.values.filter(d => d["Institutional control or affiliation (IC2017)"] == 4).length;
    // var totalNotReported = vis.displayData.values.filter(d => d["Institutional control or affiliation (IC2017)"] == -1).length;
    // console.log(totalNotReported);

    //append the legends
    d3.select(".mapDataTotal").html("Total: " + total);
    d3.select(".mapDataPublic .badge").html(totalPublic);
    d3.select(".mapDataPrivateProfitable .badge").html(totalPrivateProfitable);
    d3.select(".mapDataPrivateNonProfitableNonRel .badge").html(totalPrivateNonProfitableNonRel);
    d3.select(".mapDataPrivateNonProfitableRel .badge").html(totalPrivateNonProfitableRel);

    
    //clear the map at the updates
    vis.pruneCluster.RemoveMarkers();

    //add the markers loop
    for (var i = 0; i < points.length; i++) {
        var intitute = points[i];
        var marker = new PruneCluster.Marker(intitute["Latitude location of institution (HD2017)"], intitute["Longitude location of institution (HD2017)"]);
        marker.category = intitute["Institutional control or affiliation (IC2017)"];

        var iconImg,instType;
        
        // switch to get the proper icon for each institute depends on type
        switch(intitute["Institutional control or affiliation (IC2017)"]) {
            case 1 :
                iconImg = "img/university-public.png";
                // iconImg = "#ff1654";
                instType = "Public";
                break;
            case 2 :
                iconImg = "img/university-private-for-profit.png";
                // iconImg = "#247ba0";
                instType = "Private for-profit";
                break;
            case 3 :
                iconImg = "img/university-private-not-for-profit-nreg.png";
                // iconImg = "#70c1b3";
                instType = "Private not-for-profit (no religious affiliation)";
                break;
            case 4 :
                iconImg = "img/university-private-not-for-profit-reg.png";
                // iconImg = "#313c35";
                instType = "Private not-for-profit (religious affiliation)";
                break;
            default:
                iconImg = "img/university-not-reported.png";
                // iconImg = "";
                instType = "Not reported";
        }

        // Get the title and info then append to the popup
        var title = intitute["Institution Name"] + "<br>" + instType;
        marker.data.popup = title;

        //this code was to try to use font awesome icon instead of an image icon .. but wasn't that nice!!
        // var colorfulIcon = L.divIcon({
        //     html: '<i class="fa fa-user-graduate" style="color: '+ iconImg +'"></i>',
        //     iconSize: [40, 40],
        //     className: 'myDivIcon' + a["Institutional control or affiliation (IC2017)"]
        // });

        // test = tt;

        //add the icon
        marker.data.icon = L.icon({iconUrl: iconImg});
        // marker.data.icon = colorfulIcon;

        vis.pruneCluster.RegisterMarker(marker);

    }
    vis.pruneCluster.ProcessView();




    vis.map.addLayer(vis.pruneCluster);

}
