/**
* Fields.js
*/

var ld = sails.util._;


//connection.query(queryString, function(err, records){
//    // Do something
//});


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
    
    "firm":  {"combinations":
	      [["age"],
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
    _field_meta: function(){
	return field_meta;
    },

    _query_model: function(type){
	if(type == "firm"){
	    return GenericFirm;
	} else {
	    return GenericEsta;
	}
    },
/*
    // type: one of 'firm' or 'esta'
    // field: one of 'sz', 'isz', 'age'
    // cb: call back taking one variable with an object
    //     that will be of type {"code": "value", ... }
    with_codes: function(type, field, cb){
	
	var sql = "SELECT \"code\", \"value\" FROM \"" + field_meta[type]["pkeys"][field] + "_codes\"";
	
	this._query_model(type).query(sql,
				      function(err, data){
					  // Should do some kind of error checking here
					  cb(ld.zipObject(
					      ld.map(data.rows, function(x){ return ld.str.lpad(x['code'], 2, "0"); }),
					      ld.map(data.rows, function(x){ return x['value']; })));
				      });
    },
  */  

    //check if 'args' are a list of valid table identifiers
    // set theory for the win
    _validp: function(type, args){
	return ld.find(field_meta[type]["combinations"], function(lst){
	    return ld.xor(args, lst).length == 0;
	});
    },

    _table: function(type, args){
	var tbl_parts =  this._validp(type, args);
	if(tbl_parts === undefined)
	    throw args.join(", ") + " are not valid "+ type +" subgroups!";

	return tbl_parts.join("x");
    },


    get_keys: function(type, args){
	return ld.map(ld.filter(args, function(arg){
	    return ld.contains(ld.keys(field_meta[type]['pkeys']), arg);
	}), function(arg){
	    return field_meta[type]['pkeys'][arg];
	});
    },
    
    
    //Given a route component such as st065341
    //return a list of id's,  eg ['06', '53', '42']
    field_conditions: function(field, w){
	w = typeof w !== "undefined" ?  w : 2;

	if(ld.str.startsWith(field, 'msa')) w = 5;
	if(ld.str.startsWith(field, 'yr')) w = 4;

	var re = new RegExp("\\d{1," + w +  "}", "g");

	return field.match(re);
    },

    //Given a route component such as st065341
    //return the element string 'st'
    field_type: function(field){
	return field.match(/\D+/g)[0];
    },

    
    route_table: function(type, route){
	var elements = typeof route == "string" ? route.split("/") : route;
	
	try{
	    return this._table(type,
			       // filter year from the list if it exists
			       ld.filter(
				   ld.map(elements, this.field_type),
				   function(f){
				       return f != "yr";}));
	} catch(err){
	    // this should be a debug statement not a console log?
	    // how does sails do debugging?
	    console.log(err);
	    return undefined;
	}
    },

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

    // give a route parse,  return a list of conditions based on
    // parsing out the values passed in the parse
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
    
    route_query: function(type, route, fields){
	var table = this.route_table(type, route);
	var parse = this.parse_route(type, route);

	// Handle fields to select on,  if not specified we default to '*'
	// otherwise take the fields,  and pluck the keys from the parse to
	// make sure they are included for later grouping
	if( typeof fields !== "undefined"){
	    // Currently untested!
	    fields.push.apply(fields, ld.pluck(parse, "key"));
	    fields = ld.uniq(fields);
	} else {
	    fields = ["*"];
	}

	var sql = "SELECT " + fields.join(",") + " FROM \"" + table + "\""; 
	    
	// do conditions here
	var conditions =  this._route_conditions(parse);

	if( conditions.length > 0){
	    sql = sql + " WHERE ";
	    // could do more sophisticated stuff here,  but for now
	    // just AND together our conditions
	    sql = sql + conditions.join(" AND ");
	}
	// debug
	sql = sql + ";";
	
	return sql;
    }
  

    
    
};
