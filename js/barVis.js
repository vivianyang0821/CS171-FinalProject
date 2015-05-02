/**
 * BarVis object for CS171 final project
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @constructor
 */
BarVis = function(_parentElement, _data, _airport_list, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.airport_list = _airport_list;
    this.eventHandler = _eventHandler;
    this.averageDep = 0; // overall average departure delay
    this.averageArr = 0; // overall average arrival delay

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

    // compute overall average departure and arrival delay
    this.averageDep = d3.mean(that.data, function(d){return d.DEP_DELAY;});
    this.averageArr = d3.mean(that.data, function(d){return d.ARR_DELAY;});

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    // creates axis and scales
    this.x = d3.scale.linear()
        .range([0, this.width]);

    this.color = d3.scale.ordinal().range(["Bisque", "LightBlue"]);
    this.color_avg = d3.scale.ordinal().range(["LightSalmon", "LightSteelBlue"]);

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
        .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 35) + ")"; });

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

    // legend for average lines
    this.legend_average = this.svg.selectAll(".legend_avg")
        .data(["Overall Average Departure Delay", "Overall Average Arrival Delay"])
        .enter().append("g")
        .attr("class", "legend_avg")
        .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 75) + ")"; });

    this.legend_average.append("rect")
        .attr("x", this.width - 15)
        .attr("y", 6)
        .attr("width", 15)
        .attr("height", 1)
        .style("fill", this.color_avg);

    this.legend_average.append("text")
        .attr("x", this.width - 20)
        .attr("y", 10)
        .style("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-family", "sans-serif")
        .text(function(d) { return d; });

    // sort data
    this.sortAirports(0);

    // call the update method
    this.updateVis();
}


/**
 * the drawing function
 */
BarVis.prototype.updateVis = function(){

    var that = this;

    // updates scales
    var min = d3.min(that.data.map(function (d) {
        return d3.min([d.DEP_DELAY, d.ARR_DELAY]);
    }));
    var max = d3.max(that.data.map(function (d) {
        return d3.max([d.DEP_DELAY, d.ARR_DELAY]);
    }));
    this.x.domain([min, max]);

    var bar_height = 15;
    var group_height = 32;

    this.svg.selectAll("line").remove();

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .append("line")
        .attr("x1", this.x(0))
        .attr("x2", this.x(0))
        .attr("y2", this.height);

    // draw average lines
    this.svg.append("line")
        .attr("class", "averageDep")
        .attr("x1", this.x(this.averageDep))
        .attr("x2", this.x(this.averageDep))
        .attr("y2", this.height)
        .style("stroke", "LightSalmon")
        .style("stroke-dasharray", "5,5");

    this.svg.append("line")
        .attr("class", "averageArr")
        .attr("x1", this.x(this.averageArr))
        .attr("x2", this.x(this.averageArr))
        .attr("y2", this.height)
        .style("stroke", "LightSteelBlue")
        .style("stroke-dasharray", "5,5");

    // updates graph
    var bar = this.svg.selectAll(".bar")
        .data(this.displayData, function(d) { return d.AIRPORT; });

    // Append new bar groups, if required
    var bar_enter = bar.enter().append("g");

    // Append rect and text only for the Enter set (new g)
    bar_enter.append("rect").attr("class", "dep_bar");
    bar_enter.append("rect").attr("class", "arr_bar");
    bar_enter.append("text");

    // Add mouse interactivity
    bar_enter
        .on("mouseover", function(d){
            var i = that.airport_list.indexOf(d.AIRPORT);
            $(that.eventHandler).trigger("barMouseOver", i);
        })
        .on("click", function(d){
            var i = that.airport_list.indexOf(d.AIRPORT);
            $(that.eventHandler).trigger("barMouseOver", i);
        });
        /*.on("mouseout", function(){    ----------- cannot add mouseout if we want to keep the result of click
            $(that.eventHandler).trigger("barMouseOut");
        });*/

    // Add attributes (position) to all bar groups
    bar.attr("class", "bar")
        .transition()
        .attr("transform", function(d, i) {return "translate(" + that.x(0) + "," + ((group_height + 10) * i + 5) + ")"; })

    // Remove the extra bars
    bar.exit()
        .remove();

    // Update all inner rects and texts (both update and enter sets)
    bar.selectAll(".dep_bar")
        .attr("x", function(d) { return d.DEP_DELAY < 0 ? (that.x(d.DEP_DELAY) - that.x(0)) : 1; })
        .attr("height", bar_height)
        .style("fill", "Bisque")
        .transition()
        .attr("width", function(d) {return Math.abs(that.x(d.DEP_DELAY) - that.x(0)); });

    bar.selectAll(".arr_bar")
        .attr("x", function(d) { return d.ARR_DELAY < 0 ? (that.x(d.ARR_DELAY) - that.x(0)) : 1; })
        .attr("y", bar_height + 1)
        .attr("height", bar_height)
        .style("fill", "LightBlue")
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
 * Filter the airports by airport names --------- to be tested
 */
BarVis.prototype.filterByAirport = function(_airport_filter, _sort_by){

    this.displayData = this.data.filter(function (d) {
        for (var j=0; j<_airport_filter.length; ++j)
            if (_airport_filter[j].indexOf(d.AIRPORT) != -1) return true;
        return false;
    });

    this.sortAirports(_sort_by);

}


/**
 * Filter the airports by State
 */
BarVis.prototype.filterByState = function(_state_filter, _sort_by){

    if (_state_filter == "all"){
        this.displayData = this.data;
    }
    else {
        this.displayData = this.data.filter(function (d) {
            return d.AIRPORT_STATE_NM == _state_filter;
        });
    }

    this.sortAirports(_sort_by);
}


/**
 * Sort the airports
 */
BarVis.prototype.sortAirports = function(_sortby){

    // _sortby: 0: name, 1: dep_delay asc, 2: dep_delay desc, 3: arr_delay asc, 4: arr_delay desc, 5: fl_volume desc
    this.displayData.sort(function(a, b){
        if (_sortby == 0){
            return d3.ascending(a.AIRPORT, b.AIRPORT);
        }
        else if (_sortby == 1){
            return d3.ascending(a.DEP_DELAY, b.DEP_DELAY);
        }
        else if (_sortby == 2){
            return d3.descending(a.DEP_DELAY, b.DEP_DELAY);
        }
        else if (_sortby == 3){
            return d3.ascending(a.ARR_DELAY, b.ARR_DELAY);
        }
        else if (_sortby == 4){
            return d3.descending(a.ARR_DELAY, b.ARR_DELAY);
        }
        else if (_sortby == 5){
            return d3.descending(a.FLIGHT_VOLUME, b.FLIGHT_VOLUME);
        }
    });

}




