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

    this.colors = d3.scale.category20();

    // add axes visual elements
    this.svg.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.HEIGHT - this.MARGINS.bottom) + ")");

    this.svg.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (this.MARGINS.left) + ",0)");

    // filter, aggregate, modify data
    this.wrangleData('arr_delay');

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data.
 * @param _filterFunction - a function that filters data or "null" if none
 */
//LineVis.prototype.wrangleData= function(_filterFunction){
LineVis.prototype.wrangleData= function(_filter){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filter);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};
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
    console.log(compare)
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
            .attr('stroke', this.colors(m))
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .style("opacity",0.15)
            .on('mouseover', function(){
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

            })
            .on('mouseout',function(){
                d3.select(this).style("opacity",0.15);
                d3.select("#info").remove()
            })
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
LineVis.prototype.filterAndAggregate = function(_delay_filter){
    var _data = []

    for (var m in this.data){
        var content = {};
        content['delay'] =  this.data[m].map(function(d){
            return parseInt(d[_delay_filter], 10);
        });
        content['name'] = m;
        _data.push(content);
    }
    return _data;
}




