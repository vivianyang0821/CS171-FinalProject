/**
 * LineVis object for CS171 final project
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @constructor
 */
LineVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.airports = "all";
    // define "constants"
    this.MARGINS = {top: 20, right: 20, bottom: 20, left: 20};
    this.WIDTH = 750 - this.MARGINS.left - this.MARGINS.right;
    this.HEIGHT = 300 - this.MARGINS.top - this.MARGINS.bottom;
    this.dictionary = {
        "FL": "Airtran Airways",
        "VX": "Virgin America",
        "AA": "American Airlines",
        "UA": "United Airlines",
        "DL": "Delta Airlines",
        "US": "US Airways",
        "B6": "Jetblue Airways",
        "MQ": "Envoy Air",
        "EV": "ExpressJet",
        "F9": "Frontier Airlines",
        "WN": "Southwest Airlines",
        "OO": "Skywest Airlines",
        "HA": "Hawaiian Airlines",
        "AS": "Alaska Airlines"
    }

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
LineVis.prototype.initVis = function(){

    var that = this; // read about the this

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.WIDTH + this.MARGINS.left + this.MARGINS.right)
        .attr("height", this.HEIGHT + this.MARGINS.top + this.MARGINS.bottom)
        .append("g")
        .attr("transform", "translate(" + this.MARGINS.left + "," + this.MARGINS.top + ")")

    // creates axis and scales
    this.xScale = d3.scale.linear().range([this.MARGINS.left, this.WIDTH - this.MARGINS.right]).domain([1, 12])

    this.xAxis = d3.svg.axis()
            .scale(this.xScale);

    //this.colors = d3.scale.category20();

    // add axes visual elements
    this.svg.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.HEIGHT - this.MARGINS.bottom) + ")");
        

    this.svg.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (this.MARGINS.left) + ",0)");
        

    // filter, aggregate, modify data
    this.wrangleData('all', 'arr_delay');

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data.
 * @param _filterFunction - a function that filters data or "null" if none
 */
//LineVis.prototype.wrangleData= function(_filterFunction){
LineVis.prototype.wrangleData= function(_airport_filter, _delay_filter){

    // displayData should hold the data which is visualized
    //this.airports = _airport_filter;
    this.filterByAirport(_airport_filter);

    this.displayData = d3.nest()
        .key(function(d){ return d.UNIQUE_CARRIER})
        .key(function(d){ return d.MONTH})
        .rollup(function(leaves) {
            return {
                "dep_delay": d3.mean(leaves, function(d){return d.DEP_DELAY}),
                "arr_delay": d3.mean(leaves, function(d){return d.ARR_DELAY}),
                "carrier_delay": d3.mean(leaves, function(d){return d.CARRIER_DELAY}),
                "weather_delay": d3.mean(leaves, function(d){return d.WEATHER_DELAY}),
                "nas_delay": d3.mean(leaves, function(d){return d.NAS_DELAY}),
                "security_delay": d3.mean(leaves, function(d){return d.SECURITY_DELAY}),
                "late_aircraft_delay": d3.mean(leaves, function(d){return d.LATE_AIRCRAFT_DELAY}),
                "total_delay": d3.mean(leaves, function(d){return d3.sum([d.DEP_DELAY,d.ARR_DELAY])})
            }
        })
        .entries(this.displayData);

    this.displayData = this.filterByDelay(_delay_filter);

}


/**
 * the drawing function
 */
LineVis.prototype.updateVis = function(){

    var that = this;
    var compare = [];
    for (var i=0; i<this.displayData.length; ++i){
        for (var j=0; j<this.displayData[i].delay.length; ++j){
            compare.push(this.displayData[i].delay[j]);
        }
    }
    //console.log(compare)
    var ymax = d3.max(compare)
    var ymin = d3.min(compare)-1

    this.yScale = d3.scale.linear().range([this.HEIGHT - this.MARGINS.top, this.MARGINS.bottom]).domain([ymin, ymax]);

    this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left");

    this.svg.selectAll("path").remove();
    // updates axis

    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis);

    // updates graph

    var lineGen = d3.svg.line()
        .x(function(d, i) {
            return that.xScale(i+1);
        })
        .y(function(d) {
            return that.yScale(d);
        });

    this.line = this.svg;

    for (var m = 0; m<this.displayData.length; ++m){
        this.line.append('path')
            .attr('id', String(m))
            .attr('d', lineGen(this.displayData[m].delay))
            .attr('stroke', "Wheat")
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .style("opacity",0.5)
            .on('mouseover', function(){
                d3.select(this).style("stroke-width", 3);

                g = that.line
                .append("g")
                .attr("id", "info");
                

                g
                .append("rect")
                .attr("x", d3.mouse(this)[0])
                .attr("y", d3.mouse(this)[1])
                .attr("width", 125)
                .attr("height", 20)
                .attr("fill", "#F3E2A9");

                g
                .append("text")
                .attr("x", d3.mouse(this)[0] + 10)
                .attr("y", d3.mouse(this)[1] + 15)
                .attr("fill", "#585858")
                .text(that.dictionary[that.displayData[parseInt(d3.select(this).attr('id'))].name]);
                d3.select(this).style("opacity",1);
                d3.select(this).style("stroke","Salmon");
                //console.log(that.displayData)

            })
            .on('mouseout',function(){
                d3.select(this).style("stroke-width", 2);
                d3.select(this).style("opacity",0.5);
                d3.select(this).style("stroke","Wheat");
                d3.select("#info").remove()
            })
            .style("cursor", "pointer");
    }
}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
LineVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    this.updateVis();

}


/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
LineVis.prototype.filterByDelay = function(_delay_filter){
    var _data = []

    this.displayData.map(function(d){
        var content = {};
        content["name"] = d.key;
        content['delay'] = d.values.map(function(e){
            return parseFloat(e.values[_delay_filter]);
        })
        _data.push(content);
    })

    return _data;
}

LineVis.prototype.filterByAirport = function(airports){
    if (airports == "all") {
        this.displayData = this.data;
        return;
    }
    else{
        this.displayData = this.data.filter(function(d){
            return (airports.indexOf(d.ORIGIN) != -1 || airports.indexOf(d.DEST) != -1);
        }) 
    };

}




