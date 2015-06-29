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
	var path = req.originalUrl.slice(1).split("/");
	var type = path.shift();

	if( !(FieldService.route_table(type, path)) )
	    return res.notFound();

	FieldService._query_model(type).query(
	    FieldService.route_query(type, path),
	    function(err, data){
		return res.json(
		    {"type": type,
		     "path": path,
		     "parsed": FieldService.parse_route(type, path),
		     "table": FieldService.route_table(type, path),
		     "conditions": FieldService._route_conditions(path),
		     "query": FieldService.route_query(type, path),
		     "rowCount": data.rowCount,
		     "data": data.rows.slice(0, 10)
		    });
	    });
    }
    
};

