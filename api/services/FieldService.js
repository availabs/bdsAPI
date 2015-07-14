/**
 * FieldService.js
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Christopher Kotfila
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
*/

/**
 * Map the sails underscore function to the ld 'namespace'a
 *
 * @param {Object} ld
 */
var ld = sails.util._;

/**
 * field_meta contains static information about the 'firm'  and the
 * 'establishment' databases. It's top level keys are 'establishment'
 * and 'firm.'  Each of these has keys 'combinations' and 'pkeys.' The
 * 'combinations' field lists lowercase valid combinations of entites.
 * these are consistent with the tables in the database and their with-in
 * list order is importaint (e.g.,  ["age", "sz", "st"]  will be trans-
 * formed into 'agexszxst' which is a valid table name. The 'pkeys' is a
 * mapping between the url level entities (e.g.,  "age", "st", etc) and
 * the database columns they corrispond too (e.g. "age4", "state", etc).
 * Please note this are not the same in all cases for firm and
 * establishment databases.
 *
 * @param {Object} field_meta
 **/
var field_meta = {
    "establishment": {
	"combinations": [["ew"],
			 ["st"],
			 ["sz"],
			 ["isz"],
			 ["age"],
			 ["sic"],
			 ["sz","st"]
			 ["isz","st"],
			 ["sz","sic"],
			 ["age","st"],
			 ["age","sz"],
			 ["isz","sic"],
			 ["age","sic"],
			 ["age","isz"],
			 ["age","sz","st"],
			 ["age","isz","st"],
			 ["age","sz","sic"],
			 ["age","isz","sic"]],
	"pkeys": {
	    "age": "age4",
	    "st": "state",
	    "sz": "size",
	    "isz": "isize",
	    "sic": "sic1",
	    "yr": "year2"
	}
    },
    
    "firm":  {
	"combinations":[["age"],
			["ew"],
			["isz"],
			["met"],
			["sic"],
			["st"],
			["sz"],
			["msa"],
			["sz","st"]	  
			["sz","met"],
			["sz","msa"],
			["sz","sic"],
			["age","st"],
			["age","sz"],
			["isz","st"],
			["isz","sic"],
			["age","isz"],
			["age","met"],
			["age","msa"],
			["age","sic"],
			["isz","met"],
			["age","sz","st"],
			["age","isz","st"],
			["age","sz","met"],	  
			["age","sz","msa"],
			["age","sz","sic"],
			["age","isz","sic"],
			["age","isz","met"],
			["age","sz","met","st"],
			["age","isz","met","st"]],
	
	"pkeys": {
	    "age": "fage4",
	    "st": "state",
	    "sz": "fsize",
	    "isz": "ifsize",
	    "sic": "sic1",
	    "met": "metro",
	    "msa": "msa",
	    "yr": "year2"
	}
    }
};

    
module.exports = {
    /**
      * Set of all valid column strings for both firm and establishment databases
      * @param {Array} valid_columns
      */
    valid_columns: [
	"year2",
	"sic1",
	"size",
	"fsize",
	"age4",
	"fage4",
	"firms",
	"estabs",
	"emp",
	"denom",
	"estabs_entry",
	"estabs_entry_rate",
	"estabs_exit",
	"estabs_exit_rate",
	"job_creation",
	"job_creation_births",
	"job_creation_continuers",
	"job_creation_rate_births",
	"job_creation_rate",
	"job_destruction_deaths",
	"job_destruction_continuers",
	"job_destruction_rate_deaths",
	"job_destruction_rate",
	"net_job_creation",
	"net_job_creation_rate",
	"reallocation_rate",
	"d_flag",
	"firmdeath_firms",
	"firmdeath_estabs",
	"firmdeath_emp",
	"metro",
	"msa"],

    /**
     * Module accessor for the field_meta variable.
     * In general this should not be used except for debugging
     *
     * @return {Object}
     */
    _field_meta: function(){
	return field_meta;	
    },

    /**
     * Model _query_model(String)
     *
     * Given a string 'firm'  or 'establishment'  return a model
     * with the correct database connection attribute
     *
     * @param {String} type - one of 'firm' or 'establishment'
     */
    _query_model: function(type){
	if(type == "firm"){
	    return GenericFirm;
	} else {
	    return GenericEsta;
	}
    },
    /**
     * Make an SQL query to pull the code & values from the database
     * fields that have codes (e.g.,  'sz', 'isz' and 'age'). 
     *
     * @param {String} type - one of 'firm' or 'establishment'
     * @param {String} field - one of 'sz', 'isz', 'age' these are the URL elements
     * @param {Function} cb - call back taking one variable with an object
     *                        that will be of type {"code1": "value1", "code2": "value2", ... }
     * @return {undefined}
     */
    with_codes: function(type, field, cb){

	// TODO: Should be doing better error checking here to prevent things like selecting from "undefined_codes"
	var sql = "SELECT \"code\", \"value\" FROM \"" + field_meta[type]["pkeys"][field] + "_codes\"";
	
	this._query_model(type).query(sql,
				      function(err, data){
					  if(err){
					      cb(err);
					  } else {
					      // call the cb() function with an argument like: {"code1": "value1", "code2": "value2", ... }
					      // this is constructed by zipping together the code and value columns
					      cb(ld.zipObject(
						  // zero pad the code column so keys are a consistent length
						  ld.map(data.rows, function(x){ return ld.str.lpad(x['code'], 2, "0"); }),
						  ld.map(data.rows, function(x){ return x['value']; })));
					  }});
    },

    /**
     * Check if 'args' are a list of valid table identifiers regardless of order.
     * 
     * @param {String} type - one of 'firm' or 'establishment'
     * @param {Array} args - a list of strings with non-conditioned 
     *                       url entities (e.g.,  'st'  not 'st06')
     * @return {Array|undefined}  the correctly ordered array (from field_meta)
     *                            based on valid url elements in args,  or undefined
     */
    _validp: function(type, args){
	return ld.find(field_meta[type]["combinations"], function(lst){
	    return ld.xor(args, lst).length == 0;
	});
    },
    
    /**
     * Return the correct table name based on the list of entity strings
     * these entity strings (e.g.,  "age", "isz", "msa", etc)  may be in any
     * order.  Throw an error if the strings are not a valid combination of entities
     * as defined by the values in field_meta
     * 
     * @param {String} type - one of 'firm' or 'establishment'
     * @param {Array} args - a list of strings
     * @return {String} the table name
     */
    _table: function(type, args){
	var tbl_parts =  this._validp(type, args);
	if(tbl_parts === undefined)
	    throw args.join(", ") + " are not valid "+ type +" subgroups!";

	return tbl_parts.join("x");
    },

    /**
     * This function returns a list of the column names for a particular database
     * (e.g., "age4", "isize", etc)  for a list of url entities (e.g., 'age', 'isz')
     * 
     * @param {String} type - one of 'firm' or 'establishment'
     * @param {Array} args - a list of strings
     * @return {Array} column names 
     */
    get_keys: function(type, args){
	// First filter 'args'  to ensure it only contains valid keys before mapping
	return ld.map(ld.filter(args,
				function(arg){
				    return ld.contains(ld.keys(field_meta[type]['pkeys']), arg); }),
		      function(arg){
			  return field_meta[type]['pkeys'][arg];});
    },
    
    /**
     * Given a route component such as st065341 return a list of id's,  eg ['06', '53', '42']
     *
     * @param {String} field - a string that shoiuld begin with an entity type
     * @param {Integer} w - an optional integer specifying the fixed width of the condition ids
     * @return {Array}
     *
     * CONSIDER: This in formation is static and related to the fields,  it might be better
     *           suited in the field_meta variable. One could move the 'w' field into the
     *           field_meta variable pretty easily. Consider instead though moving the RegExp
     *           which is currently (inefficiently) compiled in this function.
     * CONSIDER: It would probably be best to add an assertion that all list elements returned
     *           by field.match(re) are of the expected length. This should at least log a
     *           warning or possibly throw an exception.  condition values of malformed length
     *           are sure to evaluate to false which may cause the entire query to return
     *           nothing.
     */ 
    field_conditions: function(field, w){
	// By default assume length two
	w = typeof w !== "undefined" ?  w : 2;

	// msa are length 5
	if(ld.str.startsWith(field, 'msa')) w = 5;
	// years are length 4
	if(ld.str.startsWith(field, 'yr')) w = 4;

	// build a Regex that identifys the first integer and captures
	// sequences of integers of length 'w'
	var re = new RegExp("\\d{1," + w +  "}", "g");
	
	return field.match(re);

    },
    /**
     * Given a route component such as st065341 return the element string 'st'
     * 
     * @param {String} field - string containing a url path element
     * @return {String}
     **/
    field_type: function(field){
	// CONSIDER: throwing an exception if the field parsed is not valid
	//           as defined by pkeys.
	return field.match(/\D+/g)[0];
    },

    /**
     * Given a route string that has been stripped of leading 'firm' or 'establishment'
     * parts return the table name for the url elements specified in that table, otherwise
     * throw an exception. This should return the table name regardless of conditions on
     * those url elements and will ignore the year ('yr') element. 
     * Eg:
     * 
     * sails> FieldService.route_table("firm", "msa/age010203/sz06")
     * 'agexszxmsa'
     *
     * sails> FieldService.route_table("firm", "foo/bar/baz")
     * foo, bar, baz are not valid firm subgroups!
     * undefined
     *
     * @param {String} type - one of 'firm' or 'establishment'
     * @param {String} route - part of the route containing the url elements
     * @return {String|undefined} database table name or undefined
     * 
     */
    route_table: function(type, route){
	var elements = typeof route == "string" ? route.split("/") : route;
	
	try{
	    return this._table(type,
			       // filter year ('yr') from the list if it exists
			       ld.filter( ld.map(elements, this.field_type),
					  function(f){
					      return f != "yr";}));
	} catch(err){

	    // TODO this should be a debug statement not a console log
	    console.log(err);
	    return undefined;
	}
    },


    /**
     * An intermediate function that takes a route and produces a list of
     * objects that have 'field', 'key' and 'conditions'  values.  This parsed
     * route object is then used to generate the actual query.
     *
     * @param {String} type - one of 'firm' or 'establishment'
     * @param {String} route - the route for parsing should be everything that
     *                         comes after a '/firm/'  or '/establishment/' route
     * @return {Array}  Array of objects with parsed data from the url part
     */
    parse_route: function(type, route){
	return ld.map(route, function(f){
	    var field = FieldService.field_type(f);
	    var condition = FieldService.field_conditions(f);

	    // should have check that key can be found
	    return {"field": field,
		    "key": field_meta[type]["pkeys"][field],
		    "conditions": condition};
	});

    },
    /**
     * Given a route parse as returned by FieldServices.parse_route,
     * return a list of SQL conditions based on the 'key' value and the
     * 'conditions' value for each part of the url. Conditions are handled
     * as follows:
     *
     * - The condition is null:
     *   Skip it
     *
     * - The condition has one value: 
     *   Create SQL like:  "KEY = 'VALUE'"
     *
     * - The condition has more than one value: 
     *   Create SQL like: "KEY IN ('VALUE1', 'VALUE2', ...)"
     *
     * If the key is 'year' then we manage a special condition where there
     * are two values in 'conditions' in this case we treat these as as
     * start and end values for a range of years.  This means a parse segment
     * like this:
     *
     * { "field": "yr",
     *   "key": "year2",
     *   "condition": ['1997', 2001'] }
     *
     * will produce the following SQL condition:
     *
     * "year2 IN ('1997', '1998', '1999', '2000', 2001')"
     *
     * @param {Array} parse - a list of parsed objects returned from parse_route
     * @return {Array} A list of strings with the correct SQL conditions
     *
     * CONSIDER: currently everything is being treated as a string in the SQL
     *           query (i.e.  it is in quotes),  Postgres handles this without
     *           trouble but it woul probably be better if logic was added to
     *           correctly manage data types. This information could be maintained
     *           in field_meta and handled here to improve portability of the
     *           generated SQL.
     */
    _route_conditions: function(parse){	
	return ld.filter(
	    ld.map(parse,
		   function(e){
		       if(e['conditions'] == null) return null;
		       // Add code here to manage year range,  this is only needed
		       // if we're dealing with year and a length of 2,  otherwise
		       // the default condition generation should be fine.
		       if(e['field'] == 'yr' && e['conditions'].length == 2){
			   return e['key'] + " BETWEEN " + e['conditions'][0] + " AND " + e['conditions'][1];
		       }
		       
		       if(e['conditions'].length == 1){
			   return e['key'] + " = '" + e['conditions'].join("") + "'";
		       } else if (e['conditions'].length > 1){
			   return e['key'] + " IN ('" + e['conditions'].join("','") + "')";
		       }
		       return null;
		   }),
	    function(e){ return e != null; });
    },

    /** 
     * This function takes a type and a route and produces a full SQL query string
     * for execution against the database,  it relies heavily on 
     * FieldServices.route_table() and FieldServices.parse_route() logic.  An array
     * of fields may also be included    
     *
     * @param {String} type - One of 'establishment' or 'firm'
     * @param {String} route - A string containing the dynamic portion of the route
     * @param {Array} fields - Optional list of fields to select
     * @return {String} the SQL query generated from the route
     */
    route_query: function(type, route, fields){
	var table = this.route_table(type, route);
	var parse = this.parse_route(type, route);

	// Handle fields to select on,  if not specified we default to '*'
	// otherwise take use the fields varible, we also pluck the keys from 
	// the parse to make sure they are included for later grouping. Field order
	// is not garunteed
	if( typeof fields !== "undefined" && fields.length > 0){
	    // Always include year2
	    fields = ['year2'].concat(ld.pluck(parse, "key").concat(fields));
	    fields = ld.uniq(fields);
	} else {
	    fields = ["*"];
	}

	var sql = "SELECT " + fields.join(",") + " FROM \"" + table + "\""; 
	    
	// Pull the route conditions
	var conditions =  this._route_conditions(parse);

	if( conditions.length > 0){
	    sql = sql + " WHERE ";
	    // CONSIDER: We could do more sophisticated stuff here like include
	    //           options for conjunctive and disjunctive conditions
	    //           for now though just AND together our conditions
	    sql = sql + conditions.join(" AND ");
	}

	sql = sql + ";";
	
	return sql;
    }
  

    
    
};
