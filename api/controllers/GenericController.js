/**
 * GenericController
 *
 * @description :: Server-side logic for managing Generics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var ld = sails.util._;

module.exports = {

    parse: function(req, res){
	var flat = req.param("flat");
	var path = req.param("0").split("/");
	var type = req.originalUrl.slice(1).split("/")[0];

	var fields = req.param("fields", []);
	if( typeof fields === 'string' ) {
	    fields = [ fields ];
	}
	fields = ld.intersection(FieldService.valid_columns, fields);
	console.log(fields);

	if( !(FieldService.route_table(type, path)) )
	    return res.notFound();

	var sql = FieldService.route_query(type, path, fields);

	return FieldService._query_model(type).query(
	    sql,
	    function(err, data){
		
		if(err) return res.json(err);
		if(flat) return res.json(data.rows);

		return res.json(GroupService.groupByMulti(
		    data.rows,
		    GroupService.path_groupby_accessors(
			FieldService.get_keys(
			    type, ld.map(path, FieldService.field_type)))));
	    });
    },

    
    debug: function(req, res){
	var path = req.param("0").split("/");
	var type = req.originalUrl.slice(1).split("/")[0];

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
				"parse_conditions": FieldService._route_conditions(path),
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
								 
/*		    resp_obj["data"] = GroupService.groupByMulti(data.rows,
								 ld.filter(ld.map(path, function(field){
								     return FieldService.field_type(p);
								 }), function(p){ return p != "yr"; });

								 //[function(n){ return n["year2"];}, function(n){ return n['msa']; }]
								);
*/
		}
		return res.json(resp_obj);
	    });
    }
    
};

