/**
 * FipsController
 *
 * @description :: Server-side logic for managing fips
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var ld = sails.util._;

function get_type(req){
    // This is lazy and should be better
    return req.originalUrl.split("/")[1];
}


// There is a smarter way to do this,  probably by directly
// manipulating the global definitions that expose "State"
// and "MSA" models
function get_model_function(req){
    if(get_type(req) == "firm"){
	return function _get_model(n){
	    return {"State": FirmState}[n];
	};
    } else {
	return function _get_model(n){
	    return {"State": EstaState}[n];
	};	
    }
}

module.exports = {
	

  /**
   * `FipsController.process()`
   */
    processFips: function (req, res) {
	var m = get_model_function(req)("State");
	
	m.getState({"state": parseInt(req.param("fips"))},
		   function(err, data){
		       if(err) return res.json({"error": err});
		       return res.json(data);
		   });
		
  }
};

