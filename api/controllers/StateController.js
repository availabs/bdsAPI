/**
 * StateController
 *
 * @description :: Server-side logic for managing states
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    state: function(req, res){
	State.getState({"state": req.param("state_id")},
			function(err, data){
			    if(err) return res.send(err);
			    return res.json(data);
			});
		      }
};

