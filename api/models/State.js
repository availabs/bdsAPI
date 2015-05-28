/**
* State.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var ld = sails.util._;

module.exports = {
    autoCreatedAt: false,
    autoUpdatedAt: false,
    autoPK: false,
    tableName: "ST",
    attributes: {
	year2:{ type: "integer"},
	state: { type:  "string" },
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


    state_to_fips: { "AL": "01", "AK": "02", "AZ": "04", "AR": "05",
		     "CA": "06", "CO": "08", "CT": "09", "DE": "10",
	             "DC": "11", "FL": "12", "GA": "13", "HI": "15",
	             "ID": "16", "IL": "17", "IN": "18", "IA": "19",
	             "KS": "20", "KY": "21", "LA": "22", "ME": "23",
	             "MD": "24", "MA": "25", "MI": "26", "MN": "27",
	             "MS": "28", "MO": "29", "MT": "30", "NE": "31",
	             "NV": "32", "NH": "33", "NJ": "34", "NM": "35",
	             "NY": "36", "NC": "37", "ND": "38", "OH": "39",
	             "OK": "40", "OR": "41", "PA": "42", "RI": "44",
	             "SC": "45", "SD": "46", "TN": "47", "TX": "48",
	             "UT": "49", "VT": "50", "VA": "51", "WA": "53",
	             "WV": "54", "WI": "55", "WY": "56"},

    fips_to_state: {  "01": "AL",  "02": "AK",  "04": "AZ",  "05": "AR",
		      "06": "CA",  "08": "CO",  "09": "CT",  "10": "DE",
	              "11": "DC",  "12": "FL",  "13": "GA",  "15": "HI",
	              "16": "ID",  "17": "IL",  "18": "IN",  "19": "IA",
	              "20": "KS",  "21": "KY",  "22": "LA",  "23": "ME",
	              "24": "MD",  "25": "MA",  "26": "MI",  "27": "MN",
	              "28": "MS",  "29": "MO",  "30": "MT",  "31": "NE",
	              "32": "NV",  "33": "NH",  "34": "NJ",  "35": "NM",
	              "36": "NY",  "37": "NC",  "38": "ND",  "39": "OH",
	              "40": "OK",  "41": "OR",  "42": "PA",  "44": "RI",
	              "45": "SC",  "46": "SD",  "47": "TN",  "48": "TX",
	              "49": "UT",  "50": "VT",  "51": "VA",  "53": "WA",
	              "54": "WV",  "55": "WI",  "56": "WY"},    


    getAllStates: function(opts, cb){
	return this.find({}, this._correctFips(cb));
    },
    
    getState: function(opts, cb){
	// Find all records for a particular state
	// convert from 2 letter abrev to state fips,  or just accept opts.state
	return this.find({"state": State.state_to_fips[opts.state] || opts.state}, this._correctFips(cb));

    },

    // Make sure we're always returning the correct 2 letter abrev
    _correctFips: function(cb){
	return function (err, data){
	    if(err) return cb(err);
	    // return call back,  but set each elements 'state'  to the 2 letter state abrev
	    return cb(err, ld.map(data,function(d){
		if (d.hasOwnProperty("state"))
		    d.state = State.fips_to_state[d.state];
		return d;
	    }));
	}; }
};

