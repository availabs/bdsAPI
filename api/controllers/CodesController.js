/**
 * CodesController
 *
 * @description :: Server-side logic for managing Codes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
  /**
   * `CodesController.codes()`
   */
    codes: function (req, res) {
	FieldService.with_codes("firm", "sz", function(f_sz){
	    FieldService.with_codes("firm", "isz", function(f_isz){
		FieldService.with_codes("firm", "age", function(f_age){
		    FieldService.with_codes("establishment", "sz", function(e_sz){
			FieldService.with_codes("establishment", "isz", function(e_isz){
			    FieldService.with_codes("establishment", "age", function(e_age){
				return res.json({"firm": {"size": f_sz, "isize": f_isz, "age": f_age},
						 "establishment": {"size": e_sz, "isize": e_isz, "age": e_age}});
			    });
			});
		    });
		});
	    });
	});

  },


  /**
   * `CodesController.firm_codes()`
   */
    firm_codes: function (req, res) {
	if(req.param("type")){
	    FieldService.with_codes("firm", req.param("type"), function(data){
		return res.json(data);
	    });
	} else{
	    FieldService.with_codes("firm", "sz", function(sz){
		FieldService.with_codes("firm", "isz", function(isz){
		    FieldService.with_codes("firm", "age", function(age){
			return res.json({"size": sz, "isize": isz, "age": age});
		    });
		});
	    });
	}
    },


  /**
   * `CodesController.establishment_codes()`
   */
    establishment_codes: function (req, res) {
	if(req.param("type")){
	    FieldService.with_codes("firm", req.param("type"), function(data){
		return res.json(data);
	    });
	} else{
	    FieldService.with_codes("establishment", "sz", function(sz){
		FieldService.with_codes("establishment", "isz", function(isz){
		    FieldService.with_codes("establishment", "age", function(age){
			return res.json({"size": sz, "isize": isz, "age": age});
		    });
		});
	    });
	}

	
    }
};

