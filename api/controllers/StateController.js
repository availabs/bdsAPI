/**
 * StateController
 *
 * @description :: Server-side logic for managing states
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// to client error management function
// stubbed out - could be used to ensure more consistent response/request metadata
function return_error(res, err){
    return res.json({error: err});
}

module.exports = {

    // Return the entire collection
    all_states: function(req, res){
	State.getAllStates({}, function(err, data){
	    if(err) return return_error(res, err);	    
	    return res.json(data);
	});
    },
    
    // main function for the per state endpoints
    state: function(req, res){
	State.getState({"state": req.param("state_id")},
		       function(err, data){
			   if(err) return return_error(res, err);	
			   return res.json(data);
			});
    }
};

