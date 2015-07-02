/**
 * GenericController
 *
 * @description :: Server-side logic for managing Generics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var ld = sails.util._;

module.exports = {

    parse: function(req, res){
	return;
    },

    
    debug: function(req, res){
//	console.log(req.params.all());
	var path = req.param("0").split("/");
	var type = req.originalUrl.slice(1).split("/")[0];

	if( !(FieldService.route_table(type, path)) )
	    return res.notFound();

	var additional_conditions = [];
	if( req.param("year") ){
	    additional_conditions = FieldService.year_condition(req.param("year"));
	}

	var sql = FieldService.route_query(type, path, additional_conditions);
	FieldService._query_model(type).query(
	    sql, function(err, data){
		var resp_obj = {"type": type,
				"path": path,
				"params": req.params.all(),
				"parsed": FieldService.parse_route(type, path),
				"table": FieldService.route_table(type, path),
				"parse_conditions": FieldService._route_conditions(path),
				"additional_conditions": additional_conditions,
				"query": sql};

		if(err){
		    resp_obj["rowCount"] = 0;
		    resp_obj['data'] = err;
		} else {
		    resp_obj["rowCount"] = data.rowCount;
		    resp_obj["data"] =  data.rows.slice(0, 10).concat([".........."]).concat(data.rows.slice(data.rowCount - 10));
		}
		return res.json(resp_obj);
	    });
    }
    
};

