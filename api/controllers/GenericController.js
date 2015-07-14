/**
 * GenericController
 *
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
 * @description :: Server-side logic for managing Generics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var ld = sails.util._;

module.exports = {

    /**
     *   parse() is the main parsing function for the dynamic routes
     * it accepts standard express request and response objects but handles
     * its own dynamic routing based on entity types such as "age", "st", "sz"
     * "isz", "sic", "met", "msa", and "yr."  Req takes the "0" param (the 
     * complete URI) and parses it.  The first element in the URI is expected to 
     * be one of 'firm' or 'establishment.' After this any URI is acceptable so
     * long as it is a combination of the above entity strings that resolves to
     * a valid database table.  Valid combinations can be found in the 
     * FieldServices field_meta variable. 
     * 
     *   These combinations do not need to be order specific. In fact they are not
     * intende to be in the same order as they appear in the field_meta combinations
     * lists. At it's core parse() will return a hierarhical JSON object consistent
     * with lodash.groupedBy() behavior.  This means given a URI "firm/age/msa/sz/yr"
     * parse() will return an object containing all the rows from the AGExSZxMSA.
     * The object will have top level keys that coorispond the the codes for age
     * categories.  Each top level key will contain an object whose keys are those of
     * each MSA. These MSA key's will in turn have values of each size category and 
     * finally each size key will have keys for each year. For example:
     * 
     * {"0":                          // Age code "0"
     *   {"01023":                    // MSA code "01023" for Age "0"
     *     {"0":                      // Size code "0" for MSA "01023" for Age "0"
     *       {"1979": { ... },        // Year - each object contained with in the year
     *        "1980": { ... },        //        will be a single row coorisponding to
     *        ....                    //        to the row that meets all the parent 
     *        "2013": { ... }},       //        keys.
     *      "1": { ... },             // Size code "1" for MSA "01023" for Age "0"
     *      "2": { ... },
     *      ....
     *      "11": {....}},
     *    "01024": { .... },          // MSA Code "01024" for Age "0"
     *    "01025": { .... },
     *    ....
     *    "51013": { ... }},
     *  "1": { ... },                 // Age code "1"
     *  "2": { ... },                 // etc, etc
     *  ...
     *  "12": { ... }}
     * 
     * Year (the 'yr' URI element) is optional,  if it is not specified the year
     * will be available in each row object,  and the bottom of the object hierarchy
     * will be an array of objects,  one for each year. This has the advantageous quality 
     * of allowing for arbitrary hierarhcies of data to be dynamically generated at 
     * consistent URI.  Also,  given data from the URI "firm/age"  it is easy to get size 
     * breakdowns by querying "firm/age/sz." Or by including an ajax that request to the
     * relative URL "sz"
     * 
     *  Endpoints may be (and probably should be) subjected to conditions which reduce the
     * over all size of the data returned (AGExSZxMSA for instance is over 100Mb of text). 
     * This can by done by including zero filled numbers to the end of any URI segment
     * that coorispond to the ID's of that URI element.  For example the URI:  
     *
     * "firm/age01/msa0102301024/sz020310" 
     * 
     * will return an object of the form:
     *
     * {"01": 
     *   {"01023":
     *     { "02": [ ROW_DATA ],
     *       "03": [ ROW_DATA ],
     *       "10": [ ROW_DATA ] },
     *    "01024":
     *     "02": [ ROW_DATA ],
     *     "03": [ ROW_DATA ],
     *     "10": [ ROW_DATA ]
     *   }
     * }
     * 
     * Where age is subjected to the condition 'age = "01"', msa is subject to the condition 
     * 'msa in ("01023", "01024")' and 'size in ("02", "03", "10").' All condition values are
     * fixed width according to their data type where,  years ('yr')  are of length 4,  MSA 
     * ('msa') are of length 5,  and all others ("age", "sz", "isz", etc) are of length 2.
     *
     *  If this hierarchical behavior is not desirable data may be returned as a list of rows
     * by passing the GET argument 'flat' equal to any non falsy value.  For example:
     * 
     *   firm/age01/msa0102301024/sz020310?flat=true 
     * 
     * will return an array of rows. By default each row contains all the columns available in 
     * that database.  If a user only wants specific columns they may be selected with the 
     * 'fields' GET variable.  For example: 
     * 
     *   firm/age01/msa0102301024/sz020310?fields=job_creation
     * 
     * Multiple fields may be selected by adding additional fields variables, e.g.
     * 
     *   firm/age01/msa0102301024/sz020310?fields=job_creation&fields=job_death&fields=job_creation_rate
     *
     * PLEASE NOTE:  the current parse function does not support paging ( it is not clear the 
     * best way to page through a hierarchical object).  This means it is possible to request data that
     * takes a very long time to return and may CRASH the browser if loaded into memory.  It is 
     * (currently) the client's responsbility to request reasonable amounts of data!
     *
     * @param {Object} req - Request Object
     * @param {Object} res - Response Object
     */
    
    parse: function(req, res){
	var path = req.param("0").split("/");
	
	var type = req.originalUrl.slice(1).split("/")[0];

	var flat = req.param("flat");
	var fields = req.param("fields", []);

	// If only one field is specified wrap it in an array so
	// that it is consistent with multiple fields being specified
	if( typeof fields === 'string' ) {
	    fields = [ fields ];
	}

	// Ensure that fields does not include values that are not
	// valid columns,  e.g.,  SQL injection values etc
	fields = ld.intersection(FieldService.valid_columns, fields);

	// 404 if we can't find a database table that coorisponds to the path
	if( !(FieldService.route_table(type, path)) )
	    return res.notFound();

	// Generate the SQL query
	var sql = FieldService.route_query(type, path, fields);

	return FieldService._query_model(type).query(
	    sql,
	    function(err, data){

		// If error return the error
		if(err) return res.json(err);

		// If flat is true,  just return the data
		if(flat) return res.json(data.rows);

		// otherwise groupby each of the primary keys that coorispond
		// to the URI segments given this type (e.g. 'firm' or 'establishment')
		return res.json(GroupService.groupByMulti(
		    data.rows,
		    // transform keys into an array of functions, each of which take 
		    // a row and return the value of the column attribute for that row
		    // e.g.  ["size", "fage4"]  =>  [ function(e){ return e['size'];},
		    //                                function(e){ return e['fage4'];} ]
		    // this ensures the VALUES of 'size' and 'fage4' are what we groupby
		    GroupService.path_groupby_accessors(
			// transform the URI entities (e.g., 'age') into column names (e.g. 'fage4')
			FieldService.get_keys(
			    type,
			    // strip any conditions from the URI segments
			    ld.map(path, FieldService.field_type)))));
	    });
    },

    /**
     * debug() returns the same as parse(),  but also includes the results of
     * a number of intermediary steps for debugging purposes.
     */
    debug: function(req, res){
	var path = req.param("0").split("/");
	// use [1] here instead of [0] so we don't pick up
	// debug by accident
	var type = req.originalUrl.slice(1).split("/")[1];

	if( !(FieldService.route_table(type, path)) )
	    return res.notFound();

	var sql = FieldService.route_query(type, path);
	
	FieldService._query_model(type).query(
	    sql,
	    function(err, data){
		var resp_obj = {"type": type,
				"path": path,
				"params": req.params.all(),
				"parsed": FieldService.parse_route(type, path),
				"table": FieldService.route_table(type, path),
				"parse_conditions": FieldService._route_conditions(FieldService.parse_route(type, path)),
				"query": sql};

		if(err){
		    resp_obj["rowCount"] = 0;
		    resp_obj['data'] = err;
		} else {

		    resp_obj["rowCount"] = data.rowCount;
		    resp_obj["data"] = GroupService.groupByMulti(
			data.rows,
			GroupService.path_groupby_accessors(
			    FieldService.get_keys(
				type, ld.map(path, FieldService.field_type))));
								 
		}
		return res.json(resp_obj);
	    });
    }
    
};

