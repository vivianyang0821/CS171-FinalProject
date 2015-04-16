/**
 * BarVis object for CS171 final project
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @constructor
 */
BarVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    // define "constants"
    this.margin = {top: 20, right: 10, bottom: 10, left: 10};
    this.width = 330 - this.margin.left - this.margin.right;
    this.height = this.data.length * 43 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
BarVis.prototype.initVis = function(){

    var that = this; // read about the this

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    // creates axis and scales
    this.x = d3.scale.linear()
        .range([0, this.width]);

    this.color = d3.scale.ordinal().range(["lightblue", "lightcoral"]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("top");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    // add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,0)");

    this.svg.append("g")
        .attr("class", "y axis");

    // add legend
    this.legend = this.svg.selectAll(".legend")
        .data(["Departure Delay", "Arrival Delay"])
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 5) + ")"; });

    this.legend.append("rect")
        .attr("x", this.width - 15)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", this.color);

    this.legend.append("text")
        .attr("x", this.width - 20)
        .attr("y", 10)
        .style("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-family", "sans-serif")
        .text(function(d) { return d; });

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data.
 * @param _filterFunction - a function that filters data or "null" if none
 */
BarVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};

}


/**
 * the drawing function
 */
BarVis.prototype.updateVis = function(){

    var that = this;

    // updates scales
    var min = d3.min(that.displayData.map(function (d) {
        return d3.min([d.DEP_DELAY, d.ARR_DELAY]);
    }));
    var max = d3.max(that.displayData.map(function (d) {
        return d3.max([d.DEP_DELAY, d.ARR_DELAY]);
    }));
    this.x.domain([min, max]);

    var bar_height = 15;
    var group_height = 32;

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .append("line")
        .attr("x1", this.x(0))
        .attr("x2", this.x(0))
        .attr("y2", this.height);

    // updates graph
    var bar = this.svg.selectAll(".bar")
        .data(this.displayData, function(d) { return d.AIRPORT; });

    // Append new bar groups, if required
    var bar_enter = bar.enter().append("g");

    // Append rect and text only for the Enter set (new g)
    bar_enter.append("rect").attr("class", "dep_bar");
    bar_enter.append("rect").attr("class", "arr_bar");
    bar_enter.append("text");

    // Add click interactivity
    /*bar_enter.on("click", function(d) {
        $(that.eventHandler).trigger("selectionChanged", d.type);
    })*/

    // Add attributes (position) to all bar groups
    bar.attr("class", "bar")
        .transition()
        .attr("transform", function(d, i) {return "translate(" + that.x(0) + "," + ((group_height + 10) * i + 5) + ")"; })

    // Remove the extra bars
    bar.exit()
        .remove();

    // Update all inner rects and texts (both update and enter sets)
    bar.selectAll(".dep_bar")
        .attr("x", function(d) { return d.DEP_DELAY < 0 ? (that.x(d.DEP_DELAY) - that.x(0)) : 0; })
        .attr("height", bar_height)
        .style("fill", "lightblue")
        .transition()
        .attr("width", function(d) {return Math.abs(that.x(d.DEP_DELAY) - that.x(0)); });

    bar.selectAll(".arr_bar")
        .attr("x", function(d) { return d.ARR_DELAY < 0 ? (that.x(d.ARR_DELAY) - that.x(0)) : 0; })
        .attr("y", bar_height + 1)
        .attr("height", bar_height)
        .style("fill", "lightcoral")
        .transition()
        .attr("width", function(d) {return Math.abs(that.x(d.ARR_DELAY) - that.x(0)); });

    bar.selectAll("text")
        .transition()
        .attr("x", function(d){
            return (d.DEP_DELAY < 0 || d.ARR_DELAY < 0) ? (10 + Math.abs(Math.max(that.x(d.DEP_DELAY), that.x(d.ARR_DELAY)) - that.x(0))) : -10;
        })
        .attr("y", 20)
        .text(function(d) { return d.AIRPORT; })
        .attr("class", "label")
        .attr("font-size", "10px")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", function(d){return (d.DEP_DELAY < 0 || d.ARR_DELAY < 0 ) ? "start" : "end"});

}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
BarVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    this.updateVis();

}


/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
BarVis.prototype.filterAndAggregate = function(_filter){

    return this.data;

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    var that = this;

    // create an array of values for age 0-100
    var res = d3.range(100).map(function () {
        return 0;
    });

    // accumulate all values that fulfill the filter criterion
    // filters the data and sums the values
    that.data.map(function (d){
        if (filter(d.time)){
            var i = 0;
            for (i = 0; i < res.length; i += 1){
                res[i] += d.ages[i];
            }
        }
    });

    return res.map(function(d,i){return {age:i, count: d}})

}




