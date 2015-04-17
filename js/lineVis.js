/**
 * LineVis object for CS171 final project
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @constructor
 */
LineVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;

    // define "constants"
    this.MARGINS = {top: 20, right: 20, bottom: 20, left: 20};
    this.WIDTH = 750 - this.MARGINS.left - this.MARGINS.right;
    this.HEIGHT = 300 - this.MARGINS.top - this.MARGINS.bottom;

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
    this.xScale = d3.scale.linear().range([this.MARGINS.left, this.WIDTH - this.MARGINS.right]).domain([1, 12]);

    this.yScale = d3.scale.linear().range([this.HEIGHT - this.MARGINS.top, this.MARGINS.bottom]).domain([-10, 30]);

    this.xAxis = d3.svg.axis()
            .scale(this.xScale);

    this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left");

    this.colors = d3.scale.category20();

    // add axes visual elements
    this.svg.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.HEIGHT - this.MARGINS.bottom) + ")");

    this.svg.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (this.MARGINS.left) + ",0)");

    // filter, aggregate, modify data
    this.wrangleData(null);

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

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis);

    // updates graph

    var lineGen = d3.svg.line()
        .x(function(d) {
            return that.xScale(d.month);
        })
        .y(function(d) {
            return that.yScale(d.dep_delay);
        });

    for (var m in this.displayData){
        this.svg.append('svg:path')
            .attr('d', lineGen(this.displayData[m]))
            .attr('stroke', this.colors(m))
            .attr('stroke-width', 2)
            .attr('fill', 'none');
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
LineVis.prototype.filterAndAggregate = function(_filter){

    return this.data;

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    /*var filter = function(){return true;}
     if (_filter != null){
     filter = _filter;
     }
     */
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

}




