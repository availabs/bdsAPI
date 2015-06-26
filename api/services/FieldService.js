/**
* Fields.js
*/

var ld = sails.util._;


//connection.query(queryString, function(err, records){
//    // Do something
//});


var field_meta = {
    "esta": {
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
	    "sic": "sic1"
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
		  "msa": "msa"
	      }
	     }
};
    
    

module.exports = {
    _query_model: function(type){
	if(type == "firm"){
	    return GenericFirm;
	} else {
	    return GenericEsta;
	}
    },

    // type: one of 'firm' or 'esta'
    // field: one of 'sz', 'isz', 'age'
    // cb: call back taking one variable with an object
    //     that will be of type {"code": "value", ... }
    with_codes: function(type, field, cb){
	if(type == "establishment") type = "esta";
	
	var sql = "SELECT \"code\", \"value\" FROM \"" + field_meta[type]["pkeys"][field] + "_codes\"";
	
	this._query_model(type).query(sql,
				      function(err, data){					  
					  cb(ld.zipObject(
					      ld.map(data.rows, function(x){ return ld.str.lpad(x['code'], 2, "0"); }),
					      ld.map(data.rows, function(x){ return x['value']; })));
				      });
    },
    

    //check if 'args' are a list of valid table identifiers
    // set theory for the win
    _validp: function(type, args){
	return ld.find(field_meta[type], function(lst){
	    return ld.xor(args, lst).length == 0;
	});
    },

    _table: function(type, args){
	var tbl_parts =  this._validp(type, args);
	if(tbl_parts === undefined)
	    throw args.join(", ") + " are not valid firm subgroups!";

	return tbl_parts.join("x");
    },
    
    establishment_table: function(args){
	return this._table("esta", args);
    },

    firm_table: function(args){
	return this._table("esta", args);
    },


    _sizep: function(arg){
	if(ld.startsWith(arg, "sz"))
	    return True;
	return False;
    },


    _isizep: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "st"))
	    return True;
	return False;

    },

    _sicp: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "sic"))
	    return True;
	return False;
    },
    
    _agep: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "age"))
	    return True;
	return False;
    },

    _msap: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "msa"))
	    return True;
	return False;
    },
    
    _statep: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "st"))
	    return True;
	return False;
    }
    //msa,  min: 10180, max: 49740
    
    
};
