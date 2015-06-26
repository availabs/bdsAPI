/**
* Fields.js
*/

var ld = sails.util._;

var field_meta = {
    "esta": {"combinations": [
	["ew"],
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
	      },

	      "isz_codes": {
		  "a) 1 to 4",
		  "b) 5 to 9",
		  "c) 10 to 19",
		  "d) 20 to 49",
		  "e) 50 to 99",
		  "f) 100 to 249",
		  "g) 250 to 499",
		  "h) 500 to 999",
		  "i) 1000 to 2499",
		  "j) 2500 to 4999",
		  "k) 5000 to 9999",
		  "l) 10000+"	
	     }
};
    
    



module.exports = {

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
	if(ld.startsWith(arg, "is"))
	    return True;
	return False;

    },

    _sicp: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "sc"))
	    return True;
	return False;
    },
    
    _agep: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "ag"))
	    return True;
	return False;
    },

    _msap: function(arg){
	// min: 1,  max: 56
	if(ld.startsWith(arg, "ma"))
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
