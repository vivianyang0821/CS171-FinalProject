/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */



/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * AgeVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
MapVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.eventHandler = _eventHandler;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    this.data.objects.cb_2013_us_nation_20m.geometries = 
    this.data.objects.cb_2013_us_nation_20m.geometries.filter(
      function(d){if(["Alaska", "Hawaii", "Puerto Rico"].indexOf(d.id) == -1){return d}}
    )

    // TODO: define all constants here
    this.margin = {top: 20, right: 20, bottom: 30, left: 50},
    this.width = 750 - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.airportLoc = {};

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
MapVis.prototype.initVis = function(){

    var that = this; // read about the this


    //TODO: construct or select SVG
    //TODO: create axis and scales

    // constructs SVG layout
    this.projection = d3.geo.albersUsa()
    .translate([this.width/2,this.height/2])
    .scale([800]);

    var path = d3.geo.path().projection(this.projection);

    this.svg = this.parentElement.append("svg")
        .attr("width", 750)
        .attr("height", 400)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("path")
        .datum(topojson.feature(this.data, this.data.objects.cb_2013_us_nation_20m))
        .attr("d", path)
        .style("fill", "BlanchedAlmond")
    
    // filter, aggregate, modify data
    this.wrangleData(null);

    this.displayData.map(function(d){
        var temp = that.projection([
          d.location.long,
          d.location.lat
        ]);
        that.airportLoc[d.airport] = {'x':temp[0], 'y':temp[1]};
    });

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
MapVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    //this.displayData = this.filterAndAggregate(_filterFunction);
    this.displayData = this.metaData;
 
    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
MapVis.prototype.updateVis = function(){

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};


    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs
    // TODO: implement update graphs (D3: update, enter, exit)
    // updates scales
    var that = this;
    //console.log(that.airportLoc)

    var node = this.svg.append("g")
        .attr("class", "cities")
        .selectAll("circle")
        .data(this.displayData)
        .enter().append("circle")
        .attr("transform", function(d) {
          return "translate(" + that.projection([
              d.location.long,
              d.location.lat
            ]) + ")"
          })
        .attr("r", 3)
        .attr("fill", "grey");
    //console.log(node)
    node.on("mouseover", function(n,i){
        that.airportMouseOver(i);
    })
    .on("mouseout", function(){
        that.airportMouseOut();
    })
    
}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
MapVis.prototype.airportMouseOver = function (i){
    var that = this;

    var curAirport = that.displayData[i];
    d3.select("#airportInfo").text(String(curAirport.airport));
    d3.select("#cityInfo").text(String(curAirport.city));
    var links = curAirport.dest.map(function(d){
        if ((curAirport.airport in that.airportLoc) && (d in that.airportLoc)){
            return {source: {'x':that.airportLoc[curAirport.airport].x, 'y': that.airportLoc[curAirport.airport].y},
                target: {'x':that.airportLoc[d].x, 'y': that.airportLoc[d].y}};
        }
        else{
            return {source: {'x':0, 'y': 0},
                target: {'x':0, 'y': 0}};
        }
    })

    var link = that.svg.selectAll(".link")
        .data(links);

    link.enter().append("line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style("stroke","Salmon")
        .style("stroke-width",2.5)
}

MapVis.prototype.airportMouseOut = function (){
    d3.selectAll(".link").remove();
}


/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */



/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
MapVis.prototype.filterAndAggregate = function(_filter){


    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}
   
    // create an array of values for age 0-100
    var res = d3.range(100).map(function () {
        return 0;
    });

    // accumulate all values that fulfill the filter criterion

    // TODO: implement the function that filters the data and sums the values

    return res;

}




