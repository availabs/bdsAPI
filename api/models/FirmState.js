/**
* State.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var ld = sails.util._;

module.exports = {
    connection: "bds_firm",
    autoCreatedAt: false,
    autoUpdatedAt: false,
    autoPK: false,
    tableName: "st",
    attributes: {
	year2:{ type: "integer"},
	state: { type:  "integer" },
	firms: { type: "integer" },
	estabs: { type: "integer" },
	emp: { type: "integer" },
	denom: { type: "integer" },
	estabs: { type: "integer" },
	estabs_entry_rate: { type: "float" },
	estabs_exit: { type: "integer"},
	estabs_exit_rate: { type: "float"},
	job_creation: { type: "integer"},
	job_creation_births: { type: "integer"},
	job_creation_continuers: { type: "integer"},
	job_creation_rate_births: { type: "float"},
	job_creation_rate: { type: "float"},
	job_destruction: { type: "integer"},
	job_destruction_deaths: { type: "integer"},
	job_destruction_continuers: { type: "integer"},
	job_destruction_rate_deaths: { type: "float"},
	job_destruction_rate: { type: "float"},
	net_job_creation: { type: "integer"},
	net_job_creation_rate: { type: "float"},
	reallocation_rate: { type: "float"},
	d_flag: { type: "integer"},
	firmdeath_firms: { type: "integer"},
	firmdeath_estabs: { type: "integer"},
	firmdeath_emp: { type: "integer"}
    },


    getAllStates: function(opts, cb){
	return this.find({}, cb);
    },
    
    getState: function(opts, cb){
	// Find all records for a particular state
	// convert from 2 letter abrev to state fips,  or just accept opts.state
	return this.find({"state": opts.state}, cb);

    },


    // general function to generate a postgres style SQL condition
    // based on a collection and its attributes. This allows us to
    // query other tables (e.g.,  "AGExST") and return only the rows 
    // that are applicable to the the items in the collection. 
    _generateCondition: function (collection, attrs){
	return ld.map(collection, function(obj){
	    return "(" +
		ld.map(attrs, function(a) {
		    // put single quotes around a value if the attribute is of type 'string'
		    // as defined by State.attributes
		    var _cast = function (v){
			return State.attributes[a]['type'] == 'string' ? "'" + v + "'" : v; };

		    // this is janky and doesn't belong here,  going to maybe have to think
		    // about moving the FIPS/Abrev stuff into the controler?  more of presentation
		    // thing anyways
		    if( a == "state")
			return a + " = " + _cast(State.state_to_fips[obj[a]] || obj[a]);

		    return a + " = " + _cast(obj[a]); }).join(" AND ")
		+ ")";}).join(" OR ");
    },

    withAge: function (states, cb){
	// for debugging
	states = ld.sample(states, 10);

	var _shash = function (obj){
	    return obj.year2.toString() + obj.state; };
	
	var state_hash = ld.zipObject( ld.map(states, _shash), states);


	return State.query("SELECT * FROM \"AGExST\" WHERE " +
			   State._generateCondition(states, ["year2", "state"]),
			   function(err, data){
			       if(err) cb(err);
			       // Do stuff here to merge datasets
			       // **** HERE *****
			       // loop/map through the returned data and merge it into the objects
			       // stored on state_hash using the _shash function. Then abstract
			       // this out into a function '_with'   that takes the nessisary configurables
			       // and then create functions like withAge,  withMetro  etc
			       
			      });

	

    }    

};

